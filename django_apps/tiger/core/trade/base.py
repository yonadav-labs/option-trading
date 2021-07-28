import itertools
import math
from abc import ABC, abstractmethod
from collections import defaultdict

import more_itertools
import numpy as np
from django.utils import dateformat
from scipy.stats import norm
from tiger.core import Leg
from tiger.core.probability import probability_of_price_ranges, get_normal_dist
from tiger.utils import get_dates_till_expiration, get_decimal_25x

INFINITE = 'infinite'


class Trade(ABC):
    def __init__(self, type, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        '''
        :param type: type of trade.
        :param stock: current state of underlying stock.
        :param legs: all legs of this trade.
        :param premium_type: 'mid': use mid/mark price; 'market': use bid for sell, use ask for buy.
        :param target_price_lower: lower bound of target stock price in the future. Optional.
        :param target_price_upper: upper bound of target stock price in the future. Optional.
        '''
        self.type = type
        self.stock = stock
        self.legs = legs
        self.target_price_lower = target_price_lower
        self.target_price_upper = target_price_upper
        self.premium_type = premium_type
        self.meta = {}  # meta info including number of comparisons among combinations
        self.worst_return = 0
        self.best_return = 0
        self.break_evens = []
        # important price points (possible inflection points): 0, each leg's strike, infinity
        self.key_points = {}
        '''
        group legs into this structure:
        action (is_long): {
            type (is_call): [leg_a, leg_b] (Note: leg_a, leg_b is sorted by expiration and strike)
        }
        example for a long call:
        'long': {
            'call': [OptionLeg]
        }
        '''
        self.organized_option_legs = defaultdict(lambda: defaultdict(list))

        self.organize_option_legs()
        self.common_validate()
        self.calc_properties()

    def common_validate(self):
        if self.target_price_lower is not None and self.target_price_upper is not None:
            assert self.target_price_lower <= self.target_price_upper

    @abstractmethod
    def validate(self):
        '''Custom validation logic per strategy type.'''
        pass

    @property
    def option_legs(self):
        return list(filter(lambda x: x.contract, self.legs))

    @property
    def stock_legs(self):
        return list(filter(lambda x: x.stock, self.legs))

    @property
    def cash_legs(self):
        return list(filter(lambda x: x.cash, self.legs))

    @property
    def reward_to_risk_ratio(self):
        '''calculate how many multiples of the amount at risk that can be gained in an ideal case'''
        # check if max profit is actualy positive and not infinite, max loss is actually negative and not infinite
        if self.best_return != INFINITE and self.best_return > 0 and \
                self.worst_return != INFINITE and self.worst_return < 0:
            return abs(self.best_return / self.worst_return)
        else:
            return None

    # TODO: self.cost could be 0 in a spread. How to prevent this?
    @property
    def cost(self):
        cost_sum = 0.0
        for leg in self.legs:
            cost_sum += leg.total_cost
        return cost_sum

    @property
    def notional_value(self):
        notional_value = 0.0
        for leg in self.legs:
            if leg.contract:
                notional_value = leg.contract.notional_value * leg.units
                break

        return notional_value

    @property
    def leverage(self):
        if not self.cost or self.notional_value is None:
            return
        return self.notional_value / self.cost

    def _get_aggr_contract_attribute(self, attribute_name, use_min):
        attributes = [getattr(leg.contract, attribute_name) for leg in self.legs if leg.contract]
        if None in attributes or not attributes:
            return None
        return min(attributes) if use_min else max(attributes)

    @property
    def min_days_till_expiration(self):
        return self._get_aggr_contract_attribute('days_till_expiration', use_min=True)

    @property
    def target_price_profit(self):
        '''Expected profit within target price range.'''
        if not self.has_target_prices():
            return None
        return self.get_total_return(self.target_price_lower, self.target_price_upper)

    @property
    def target_price_profit_ratio(self):
        if not self.has_target_prices():
            return None
        return self.target_price_profit / self.cost

    @property
    def to_target_price_lower_ratio(self):
        if not self.target_price_lower:
            return None
        return self.target_price_lower / self.stock.stock_price - 1.0

    @property
    def to_target_price_upper_ratio(self):
        if not self.target_price_upper:
            return None
        return self.target_price_upper / self.stock.stock_price - 1.0

    @property
    def break_even_prices_and_ratios(self):
        result = []
        for break_even in self.break_evens:
            result.append({
                'price': break_even,
                'ratio': (break_even - self.stock.stock_price) / self.stock.stock_price
            })
        return result

    # currently unused property
    @property
    def prices_for_best_return(self):
        ''' None means unlimited return.'''
        if self.best_return == INFINITE:
            return None
        else:
            return list(self.key_points.keys())[list(self.key_points.values()).index(self.best_return)]

    def build_stock_price_range(self, points=100):
        x = sorted(self.key_points.keys())[1:-1]
        x.append(self.stock.stock_price)
        if self.target_price_lower:
            x.append(self.target_price_lower)
        if self.target_price_upper:
            x.append(self.target_price_upper)
        x.extend(self.break_evens)
        x = sorted(x)
        x = [x[0] * 0.9] + x + [x[len(x) - 1] * 1.1]
        # generate interval points
        additional_x = np.linspace(x[0], x[len(x) - 1], points).tolist()
        x = set(x)
        additional_x = set(additional_x)
        # join important points with interval points
        x.update(additional_x)
        x = sorted(list(x))
        return x

    @property
    def graph_points_simple(self):
        stock_prices = self.build_stock_price_range(points=50)
        returns_at_expiry = [self.get_total_return(price, price) for price in stock_prices]

        return {'x': stock_prices, 'y': returns_at_expiry}

    @property
    def graph_points(self):
        stock_prices = self.build_stock_price_range(points=50)
        returns_at_expiry = [self.get_total_return(price, price) for price in stock_prices]

        min_expiration = self._get_aggr_contract_attribute('expiration', use_min=True)
        # We don't need the last date (expiry date).
        # Because this calculation is very slow, we cannot afford to calculate for many dates.
        # TODO: make this a separate API so we don't slow down the main search that much.
        calculation_dates = get_dates_till_expiration(min_expiration, 3)[:-1]
        return_matrix = self.get_value_matrix(calculation_dates, stock_prices)

        returns_by_date = []
        for idx in range(len(calculation_dates)):
            returns_by_date.append({
                'date': dateformat.format(calculation_dates[idx], 'M jS, Y') + (' (today)' if idx == 0 else ''),
                'data': [row[idx] for row in return_matrix]
            })
        return {'x': stock_prices, 'y': returns_at_expiry, 'y2': returns_by_date}

    # TODO: deprecated.
    def get_sigma_prices(self, sigma_num):
        '''Returns 2 prices, -X * sigma, X * sigma, based on historical volatility.'''
        # TODO: historical_volatility is not saved as snapshot.
        historical_volatility = self.stock.historical_volatility
        if not historical_volatility:
            return []
        # TODO: change to count actual trading days.
        # Estimation to exclude weekends.
        trading_days_till_exp = int(self.min_days_till_expiration * 5.0 / 7.0)
        daily_volatility = historical_volatility / math.sqrt(253)
        sigma = daily_volatility * math.sqrt(trading_days_till_exp)
        return [max(0.0, self.stock.stock_price * (1 + n * sigma)) for n in (-sigma_num, sigma_num)]

    @property
    def sigma(self):
        # https://www.profitspi.com/stock/view.aspx?v=stock-chart&uv=100585
        # https://www.macroption.com/historical-volatility-calculation/
        historical_volatility = self.stock.historical_volatility
        if not historical_volatility or self.min_days_till_expiration < 0:
            return None
        # TODO: change to count actual trading days.
        # Estimation to exclude weekends.
        trading_days_till_exp = int(self.min_days_till_expiration * 5.0 / 7.0)
        daily_volatility = historical_volatility / math.sqrt(252)
        return daily_volatility * math.sqrt(trading_days_till_exp)

    def is_disabled_for_prob(self):
        return self.sigma is None

    def get_ten_percent_prices_and_returns(self, is_profit):
        '''
        Use stock's historic volatility to estimate an extreme price range that has 10% probability to happen.
        Then we calculate the potential profit/loss with this price range as a estimate for how rewarding/risky
        this trade is.
        :param is_profit: if True, return the price and return of 10% profit case, otherwise, return for the losee case.
        :return: a 10% chance price and it's return.
        '''
        if self.is_disabled_for_prob():
            return [None, None]

        stock_price = self.stock.stock_price

        # Generate a normal distribution with the given price as the center, sigma*price as stdev
        normal_dist = norm(loc=stock_price, scale=self.sigma * stock_price)

        # Absolute lowest/highest are the interval endpoints where 99% of values can be found.
        lowest_price, highest_price = normal_dist.interval(0.99)

        # Ten percent lowest/highest are the interval endpoints where 80% of values can be found (10% on either side)
        ten_percent_low_price, ten_percent_high_price = normal_dist.interval(0.8)

        low_price_return = max(
            -self.cost,
            self.get_total_return(lowest_price, ten_percent_low_price)
        )

        high_price_return = max(
            -self.cost,
            self.get_total_return(ten_percent_high_price, highest_price)
        )

        if is_profit:
            return [ten_percent_low_price, low_price_return] if low_price_return > high_price_return \
                else [ten_percent_high_price, high_price_return]
        else:
            return [ten_percent_high_price, high_price_return] if low_price_return > high_price_return \
                else [ten_percent_low_price, low_price_return]

    @property
    def ten_percent_best_return_price(self):
        if self.is_disabled_for_prob():
            return None
        return self.get_ten_percent_prices_and_returns(is_profit=True)[0]

    @property
    def ten_percent_best_return(self):
        if self.is_disabled_for_prob():
            return None
        return self.get_ten_percent_prices_and_returns(is_profit=True)[1]

    @property
    def ten_percent_best_return_ratio(self):
        if self.is_disabled_for_prob():
            return None
        return self.ten_percent_best_return / self.cost

    @property
    def ten_percent_worst_return_price(self):
        if self.is_disabled_for_prob():
            return None
        return self.get_ten_percent_prices_and_returns(is_profit=False)[0]

    @property
    def ten_percent_worst_return(self):
        if self.is_disabled_for_prob():
            return None
        return self.get_ten_percent_prices_and_returns(is_profit=False)[1]

    @property
    def ten_percent_worst_return_ratio(self):
        if self.is_disabled_for_prob():
            return None
        return self.ten_percent_worst_return / self.cost

    def get_total_return(self, price_lower, price_upper):
        '''gets profit or loss of strategy at expiration for a given underlying price range'''
        # given: stock price
        # calculate p/l of each option leg
        total_return = 0.0
        leg: Leg
        for leg in self.legs:
            if not leg.is_cash:
                total_return += leg.get_return_at_expiration(price_lower, price_upper)
        return total_return

    def max_out(self, available_cash):
        '''Returns True if succeeded, otherwise False.'''
        # TODO: think of how to deal with net credit position.
        multiplier = int(available_cash / self.cost)
        assert multiplier >= 0
        for leg in self.legs:
            leg.units *= multiplier
        return multiplier >= 1

    def has_target_prices(self):
        return self.target_price_lower is not None and self.target_price_upper is not None

    @property
    def quote_time(self):
        for leg in self.legs:
            if leg.contract and leg.contract.quote_time:
                return leg.contract.quote_time
        return None

    @property
    def net_debit_per_unit(self):
        '''Nagtive number means net credit.'''
        net_debit = 0.0
        for leg in self.legs:
            if leg.contract:
                # dividing by units doesnt work well if not all legs' units are not the same multiple (ex for 3 legs: 1, 2, 1 doesnt work but 2, 2, 2 does)
                net_debit += leg.net_cost / leg.units
            elif leg.stock:
                net_debit += leg.total_cost * (leg.units / 100)
        return net_debit

    @property
    def commission_cost(self):
        commission_cost = 0.0
        for leg in self.legs:
            if leg.contract:
                commission_cost += (leg.open_commission + leg.close_commission) * leg.units
        return commission_cost

    @property
    def delta(self):
        delta = 0.0
        for leg in self.legs:
            sign = 1 if leg.is_long else -1
            if leg.contract:
                delta += leg.contract.delta * sign * leg.units
            elif leg.stock:
                delta += sign
        return delta

    @property
    def gamma(self):
        gamma = 0.0
        for leg in self.option_legs:
            sign = 1 if leg.is_long else -1
            gamma += leg.contract.gamma * sign * leg.units
        return gamma

    @property
    def theta(self):
        theta = 0.0
        for leg in self.option_legs:
            sign = 1 if leg.is_long else -1
            theta += leg.contract.theta * sign * leg.units
        return theta

    @property
    def vega(self):
        vega = 0.0
        for leg in self.option_legs:
            sign = 1 if leg.is_long else -1
            vega += leg.contract.vega * sign * leg.units
        return vega

    @property
    @abstractmethod
    def is_bullish(self):
        pass

    @property
    def profit_prob(self):
        '''Probability of profit， implied from options pricing.'''
        if self.is_disabled_for_prob() or len(self.break_evens) == 0:
            return None

        all_points = [None] + self.break_evens + [None]
        current_range_is_profitable = self.get_total_return(self.break_evens[0] - 0.1, self.break_evens[0] - 0.1) > 0
        profitable_ranges = []
        for i in range(len(all_points) - 1):
            if current_range_is_profitable:
                profitable_ranges.append((all_points[i], all_points[i + 1]))
            current_range_is_profitable = not current_range_is_profitable

        normal_dist = get_normal_dist(self.stock.stock_price, self.sigma)
        res = probability_of_price_ranges(normal_dist, profitable_ranges)
        return sum(res.values())

    def get_value_matrix(self, calculation_dates, underlying_prices):
        final_matrix = None
        for leg in self.legs:
            matrix = leg.get_value_matrix(calculation_dates, underlying_prices)
            if final_matrix is None:
                final_matrix = matrix
            else:
                final_matrix += matrix

        final_matrix = final_matrix.transpose() - self.cost

        return final_matrix

    @property
    def return_matrix(self):
        underlying_prices = self.build_stock_price_range(24)
        underlying_prices = list(set([get_decimal_25x(price) for price in underlying_prices]))
        underlying_prices.sort(reverse=True)
        min_expiration = self._get_aggr_contract_attribute('expiration', use_min=True)
        calculation_dates = get_dates_till_expiration(min_expiration, 20)
        final_matrix = self.get_value_matrix(calculation_dates, underlying_prices)

        return {
            'prices': underlying_prices,
            'values': final_matrix,
            'dates': [date.strftime('%m/%d/%y') for date in calculation_dates],
            'max': final_matrix.max(),
            'min': final_matrix.min(),
        }

    def calc_properties(self):
        '''calculates max loss, max profit, and break even points of strategy'''
        points = {}
        # calculate total return at 0
        points[0] = self.get_total_return(0, 0)
        # calculate total return at last price
        points[self.stock.stock_price] = self.get_total_return(self.stock.stock_price, self.stock.stock_price)
        # calculate total return at each strike
        leg: Leg
        for leg in self.option_legs:
            strike = leg.contract.strike
            points[strike] = self.get_total_return(strike, strike)
        # sort the points by strike
        points = {k: points[k] for k in sorted(points)}
        # get the highest strike to calculate "infinity"
        highest_strike = max(points.keys())
        infinity = highest_strike + 1
        # calculate the total profit and loss at "infinity"
        points[infinity] = self.get_total_return(infinity, infinity)
        self.key_points = points

        # find break even points
        # for each pair of adjacent points check if points have opposite signs indicating there is a breakeven in between
        # use formula of line to calculate exact break even point: y = mx + c [m = slope, c = y intercept]
        for x1, x2 in more_itertools.pairwise(sorted(points.keys())):
            # calculate slope: rise/run or delta y / delta x
            slope = (points[x2] - points[x1]) / (x2 - x1)
            # if slope is zero then it is a flat line, no break even in between points
            if slope == 0:
                continue
            # edge case: for the last pair (largest strike and "infinity") compare sign of largest strike with sign of slope
            if x1 == highest_strike and x2 == infinity:
                if math.copysign(1, points[x1]) == math.copysign(1, slope):
                    continue
            else:
                # check if sign of first point and second point are the same (indicating no break even)
                if math.copysign(1, points[x1]) == math.copysign(1, points[x2]):
                    continue
            # find y intercept
            c = points[x1] - slope * x1
            # solve for x when y is zero, a.k.a find strike where return is 0
            self.break_evens.append((0 - c) / slope)

        # set max profit and max loss
        # check if the slope of the two highest points are positive, indicating infinite profit
        if points[infinity] > points[highest_strike]:
            self.best_return = INFINITE
        else:
            # otherwise there is a max profit
            self.best_return = max(points.values())

        # check if the slope of the two highest points are negative, indicating infinite loss
        if points[infinity] < points[highest_strike]:
            self.worst_return = INFINITE
        else:
            # otherwise there is a max loss
            self.worst_return = min(points.values())

    def organize_option_legs(self):
        organized = sorted(self.option_legs, key=lambda x: (x.is_long, x.contract.is_call))
        grouped = itertools.groupby(organized, key=lambda x: (x.is_long, x.contract.is_call))
        for groups, option_legs in grouped:
            is_long, is_call = groups
            action_alias = 'long' if is_long else 'short'
            type_alias = 'call' if is_call else 'put'
            self.organized_option_legs[action_alias][type_alias] = sorted(
                list(option_legs), key=lambda x: (x.contract.expiration, x.contract.strike))

    def get_nth_option_leg(self, action, type, n):
        return self.organized_option_legs[action][type][n]

# TODO: add a sell everything now and hold cash trade and a long stock trade.
