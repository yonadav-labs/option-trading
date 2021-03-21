from abc import ABC, abstractmethod
import math


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

        self.common_validate()

    def common_validate(self):
        if self.target_price_lower is not None and self.target_price_upper is not None:
            assert self.target_price_lower <= self.target_price_upper
        self.validate()

    @abstractmethod
    def validate(self):
        '''Custom validation logic per strategy type.'''
        pass

    def get_leg(self, is_long, type, is_call=None):
        assert type in ('cash', 'stock', 'option')
        for leg in self.legs:
            if leg.is_long != is_long:
                continue
            if type == 'cash' and leg.cash:
                return leg
            if type == 'stock' and leg.stock:
                return leg
            if type == 'option' and leg.contract and leg.contract.is_call == is_call:
                return leg
        return None

    def get_long_cash_leg(self):
        return self.get_leg(is_long=True, type='cash')

    def get_long_stock_leg(self):
        return self.get_leg(is_long=True, type='stock')

    def get_long_call_leg(self):
        return self.get_leg(is_long=True, type='option', is_call=True)

    def get_short_call_leg(self):
        return self.get_leg(is_long=False, type='option', is_call=True)

    def get_long_put_leg(self):
        return self.get_leg(is_long=True, type='option', is_call=False)

    def get_short_put_leg(self):
        return self.get_leg(is_long=False, type='option', is_call=False)

    # TODO: self.cost could be 0 in a spread. How to prevent this?
    @property
    def cost(self):
        cost_sum = 0.0
        for leg in self.legs:
            cost_sum += leg.cost
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
    def min_expiration(self):
        return self._get_aggr_contract_attribute('expiration', use_min=True)

    @property
    def min_days_till_expiration(self):
        return self._get_aggr_contract_attribute('days_till_expiration', use_min=True)

    @property
    def min_last_trade_date(self):
        return self._get_aggr_contract_attribute('last_trade_date', use_min=True)

    @property
    def min_volume(self):
        return self._get_aggr_contract_attribute('volume', use_min=True)

    @property
    def min_open_interest(self):
        return self._get_aggr_contract_attribute('open_interest', use_min=True)

    @property
    def max_bid_ask_spread(self):
        return self._get_aggr_contract_attribute('bid_ask_spread', use_min=False)

    @property
    def target_price_profit(self):
        '''Expected profit within target price range.'''
        if not self.has_target_prices():
            return None
        return self.get_profit_in_price_range(self.target_price_lower, self.target_price_upper)

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
    def to_break_even_ratio(self):
        return (self.break_even_price - self.stock.stock_price) / self.stock.stock_price

    @property
    @abstractmethod
    def break_even_price(self):
        pass

    @property
    @abstractmethod
    def display_name(self):
        pass

    @property
    @abstractmethod
    def profit_cap_price(self):
        ''' None means no cap.'''
        pass

    @property
    def profit_cap(self):
        ''' None means no cap.'''
        profit_cap_price = self.profit_cap_price
        if profit_cap_price is None:
            return None
        return self.get_profit_in_price_range(profit_cap_price, profit_cap_price)

    @property
    def profit_cap_ratio(self):
        if self.profit_cap is None:
            return None
        return self.profit_cap / self.cost

    # TODO: make this a separate API call to reduce payload.
    @property
    def graph_x_points(self):
        '''Currently all trade types we have strike prices as key points so we can share this.'''
        graph_prices = []
        step = max(0.05, self.stock.stock_price / 200.0)
        price = 0.0
        while price < self.stock.stock_price * 2:
            graph_prices.append(price)
            price += step

        for leg in self.legs:
            if leg.contract and leg.contract.strike not in graph_prices:
                graph_prices.append(leg.contract.strike)

        graph_prices.append(self.stock.stock_price)
        graph_prices.append(self.break_even_price)
        if self.target_price_lower:
            graph_prices.append(self.target_price_lower)
        if self.target_price_upper:
            graph_prices.append(self.target_price_upper)
        graph_prices = sorted(graph_prices)
        return graph_prices

    @property
    def graph_y_points(self):
        return [self.get_profit_in_price_range(price, price) for price in self.graph_x_points]

    def get_sigma_prices(self, sigma_num):
        '''Returns 2 prices, -X * sigma, X * sigma, based on historical volatility.'''
        # TODO: historical_volatility is not saved as snapshot.
        historical_volatility = self.stock.historical_volatility
        if not historical_volatility:
            return []
        # TODO: change to count actual trading days.
        trading_days_till_exp = int(self.min_days_till_expiration * 5.0 / 7.0)  # Estimation to exclude weekends.
        daily_volatility = historical_volatility / math.sqrt(253)
        sigma = daily_volatility * math.sqrt(trading_days_till_exp)
        return [max(0.0, self.stock.stock_price * (1 + n * sigma)) for n in (-sigma_num, sigma_num)]

    @property
    def two_sigma_prices(self):
        return self.get_sigma_prices(2)

    @property
    def two_sigma_profit_lower(self):
        # TODO: change to a function that can handle peek/valley. Currently all strategies are monotonic.
        if not self.two_sigma_prices:
            return None
        lower_price, higher_price = self.two_sigma_prices
        return max(-self.cost, min(self.get_profit_in_price_range(lower_price, lower_price),
                                   self.get_profit_in_price_range(higher_price, higher_price)))

    @property
    def two_sigma_profit_lower_ratio(self):
        if self.two_sigma_profit_lower is None:
            return None
        return self.two_sigma_profit_lower / self.cost

    def get_profit_in_price_range(self, price_lower, price_upper):
        profit_sum = 0.0
        for leg in self.legs:
            profit_sum += leg.get_profit_in_price_range(price_lower, price_upper)
        return profit_sum

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

# TODO: add a sell everything now and hold cash trade and a long stock trade.
