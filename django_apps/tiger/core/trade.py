from abc import ABC, abstractmethod
from tiger.utils import timestamp_to_datetime_with_default_tz

from .leg import Leg, CashLeg, StockLeg, OptionLeg
from .security import Stock


class Trade(ABC):
    def __init__(self, type, stock, legs, target_price_lower=None, target_price_upper=None):
        '''
        :param type: type of trade.
        :param stock: current state of underlying stock.
        :param legs: all legs of this trade.
        :param target_price_lower: lower bound of target stock price in the future. Optional.
        :param target_price_upper: upper bound of target stock price in the future. Optional.
        '''
        if target_price_lower is not None and target_price_upper is not None:
            assert target_price_lower <= target_price_upper
        self.type = type
        self.stock = stock
        self.legs = legs
        self.target_price_lower = target_price_lower
        self.target_price_upper = target_price_upper

    @classmethod
    def from_snapshot(cls, trade_snapshot):
        stock = Stock.from_snapshot(trade_snapshot.stock_snapshot)
        legs = [Leg.from_snapshot(leg_snapshot) for leg_snapshot in trade_snapshot.leg_snapshots.all()]

        if trade_snapshot.type == 'long_call':
            trade_class = LongCall
        elif trade_snapshot.type == 'long_put':
            trade_class = LongPut
        elif trade_snapshot.type == 'covered_call':
            trade_class = CoveredCall
        elif trade_snapshot.type == 'cash_secured_put':
            trade_class = CashSecuredPut
        elif trade_snapshot.type == 'bull_call_spread':
            trade_class = BullCallSpread
        elif trade_snapshot.type == 'bear_call_spread':
            trade_class = BearCallSpread
        elif trade_snapshot.type == 'bear_put_spread':
            trade_class = BearPutSpread
        elif trade_snapshot.type == 'bull_put_spread':
            trade_class = BullPutSpread

        new_trade = trade_class(stock, legs, target_price_lower=trade_snapshot.target_price_lower,
                                target_price_upper=trade_snapshot.target_price_upper)
        return new_trade

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
        step = max(0.02, self.stock.stock_price / 50)
        price = self.stock.stock_price * 0.25
        while price < self.stock.stock_price * 1.75:
            graph_prices.append(price)
            price += step

        for leg in self.legs:
            if leg.contract and leg.contract.strike not in graph_prices:
                graph_prices.append(leg.contract.strike)

        graph_prices = sorted(graph_prices)
        return graph_prices

    @property
    def graph_y_points(self):
        return [self.get_profit_in_price_range(price, price) for price in self.graph_x_points]

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


class TradeFactory:
    @staticmethod
    def build_long_call(stock, call_contract, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_call_leg = OptionLeg(True, 1, call_contract)
        new_trade = LongCall(stock, [long_call_leg], target_price_lower=target_price_lower,
                             target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_long_put(stock, put_contract, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_put_leg = OptionLeg(True, 1, put_contract)
        new_trade = LongPut(stock, [long_put_leg], target_price_lower=target_price_lower,
                            target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_covered_call(stock, call_contract, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_stock_leg = StockLeg(100, stock)
        short_call_leg = OptionLeg(False, 1, call_contract)
        new_trade = CoveredCall(stock, [short_call_leg, long_stock_leg], target_price_lower=target_price_lower,
                                target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_cash_secured_put(stock, put_contract, target_price_lower=None, target_price_upper=None,
                               available_cash=None):
        short_put_leg = OptionLeg(False, 1, put_contract)
        long_cash_leg = CashLeg(100 * put_contract.strike)
        new_trade = CashSecuredPut(stock, [short_put_leg, long_cash_leg], target_price_lower=target_price_lower,
                                   target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_bull_call_spread(stock, call_contract_1, call_contract_2, target_price_lower=None,
                               target_price_upper=None, available_cash=None):
        if call_contract_1.strike == call_contract_2.strike or call_contract_1.expiration != call_contract_2.expiration:
            return None
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)

        long_call_leg = OptionLeg(True, 1, lower_strike_call)
        short_call_leg = OptionLeg(False, 1, higher_strike_call)
        new_trade = BullCallSpread(stock, [long_call_leg, short_call_leg], target_price_lower=target_price_lower,
                                   target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @staticmethod
    def build_bear_call_spread(stock, call_contract_1, call_contract_2, target_price_lower=None,
                               target_price_upper=None, available_cash=None):
        if call_contract_1.strike == call_contract_2.strike or call_contract_1.expiration != call_contract_2.expiration:
            return None
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)

        long_call_leg = OptionLeg(True, 1, higher_strike_call)
        short_call_leg = OptionLeg(False, 1, lower_strike_call)
        cash_leg = CashLeg((higher_strike_call.strike - lower_strike_call.strike) * 100)
        new_trade = BearCallSpread(stock, [long_call_leg, short_call_leg, cash_leg],
                                   target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @staticmethod
    def build_bear_put_spread(stock, put_contract_1, put_contract_2, target_price_lower=None,
                              target_price_upper=None, available_cash=None):
        if put_contract_1.strike == put_contract_2.strike or put_contract_1.expiration != put_contract_2.expiration:
            return None
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)

        long_put_leg = OptionLeg(True, 1, higher_strike_put)
        short_put_leg = OptionLeg(False, 1, lower_strike_put)
        new_trade = BearPutSpread(stock, [long_put_leg, short_put_leg],
                                  target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @staticmethod
    def build_bull_put_spread(stock, put_contract_1, put_contract_2, target_price_lower=None,
                              target_price_upper=None, available_cash=None):
        if put_contract_1.strike == put_contract_2.strike or put_contract_1.expiration != put_contract_2.expiration:
            return None
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)

        long_put_leg = OptionLeg(True, 1, lower_strike_put)
        short_put_leg = OptionLeg(False, 1, higher_strike_put)
        cash_leg = CashLeg((higher_strike_put.strike - lower_strike_put.strike) * 100)
        new_trade = BullPutSpread(stock, [long_put_leg, short_put_leg, cash_leg],
                                  target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade


class LongCall(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        super().__init__('long_call', stock, legs, target_price_lower, target_price_upper)

    @property
    def display_name(self):
        long_call_leg = self.get_long_call_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_call_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Long call] {} {} strike ${} at ${:.2f} per contract' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_call_leg.units) if long_call_leg.units > 1 else '',
                    expiration_date_str, long_call_leg.contract.strike, long_call_leg.contract.cost)

    @property
    def break_even_price(self):
        return self.get_long_call_leg().contract.strike + self.get_long_call_leg().contract.premium

    @property
    def profit_cap_price(self):
        return None


class LongPut(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        super().__init__('long_put', stock, legs, target_price_lower, target_price_upper)

    @property
    def display_name(self):
        long_put_leg = self.get_long_put_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_put_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Long put] {} {} strike ${} at ${:.2f} per contract' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_put_leg.units) if long_put_leg.units > 1 else '',
                    expiration_date_str, long_put_leg.contract.strike, long_put_leg.contract.cost)

    @property
    def break_even_price(self):
        return self.get_long_put_leg().contract.strike - self.get_long_put_leg().contract.premium

    @property
    def profit_cap_price(self):
        return 0.0


# TODO: add validation logic (number of stock and contract should match)
class CoveredCall(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        super().__init__('covered_call', stock, legs, target_price_lower, target_price_upper)

    @property
    def display_name(self):
        short_call_leg = self.get_short_call_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(short_call_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Covered call] {} {} strike ${} - ${} at ${:.2f} per position' \
            .format(self.stock.ticker.symbol, '{}X'.format(short_call_leg.units) if short_call_leg.units > 1 else '',
                    expiration_date_str, short_call_leg.contract.strike, short_call_leg.contract.strike,
                    self.cost / short_call_leg.units)

    @property
    def break_even_price(self):
        return self.stock.stock_price - self.get_short_call_leg().contract.premium

    @property
    def profit_cap_price(self):
        return self.get_short_call_leg().contract.strike


class CashSecuredPut(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        super().__init__('cash_secured_put', stock, legs, target_price_lower, target_price_upper)

    @property
    def display_name(self):
        short_put_leg = self.get_short_put_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(short_put_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Cash secured put] {} {} strike ${} at ${:.2f} per position' \
            .format(self.stock.ticker.symbol, '{}X'.format(short_put_leg.units) if short_put_leg.units > 1 else '',
                    expiration_date_str, short_put_leg.contract.strike, short_put_leg.contract.strike,
                    self.cost / short_put_leg.units)

    @property
    def break_even_price(self):
        return self.get_short_put_leg().contract.strike - self.get_short_put_leg().contract.premium

    @property
    def profit_cap_price(self):
        return self.get_short_put_leg().contract.strike


# TODO: generalize to vertical call spread, vertical spread...
class BullCallSpread(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        super().__init__('bull_call_spread', stock, legs, target_price_lower, target_price_upper)

    @property
    def display_name(self):
        long_call_leg = self.get_long_call_leg()
        short_call_leg = self.get_short_call_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_call_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Bull call spread] {} {} strike ${} / ${} at ${:.2f} net debit' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_call_leg.units) if long_call_leg.units > 1 else '',
                    expiration_date_str, long_call_leg.contract.strike, short_call_leg.contract.strike,
                    long_call_leg.contract.premium - short_call_leg.contract.premium)

    @property
    def break_even_price(self):
        return self.get_long_call_leg().contract.strike \
               + self.get_long_call_leg().contract.premium \
               - self.get_short_call_leg().contract.premium

    @property
    def profit_cap_price(self):
        return self.get_short_call_leg().contract.strike


class BearCallSpread(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        assert len(legs) == 3
        super().__init__('bear_call_spread', stock, legs, target_price_lower, target_price_upper)

    @property
    def display_name(self):
        long_call_leg = self.get_long_call_leg()
        short_call_leg = self.get_short_call_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_call_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Bear call spread] {} {} strike ${} / ${} at ${:.2f} net credit' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_call_leg.units) if long_call_leg.units > 1 else '',
                    expiration_date_str, long_call_leg.contract.strike, short_call_leg.contract.strike,
                    short_call_leg.contract.premium - long_call_leg.contract.premium)

    @property
    def break_even_price(self):
        return self.get_short_call_leg().contract.strike \
               + (self.get_short_call_leg().contract.premium - self.get_long_call_leg().contract.premium)

    @property
    def profit_cap_price(self):
        return self.get_short_call_leg().contract.strike


class BearPutSpread(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        assert len(legs) == 2
        super().__init__('bear_put_spread', stock, legs, target_price_lower, target_price_upper)

    @property
    def display_name(self):
        long_put_leg = self.get_long_put_leg()
        short_put_leg = self.get_short_put_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_put_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Bear put spread] {} {} strike ${} / ${} at ${:.2f} net debit' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_put_leg.units) if long_put_leg.units > 1 else '',
                    expiration_date_str, short_put_leg.contract.strike, long_put_leg.contract.strike,
                    long_put_leg.contract.premium - short_put_leg.contract.premium)

    @property
    def break_even_price(self):
        return self.get_long_put_leg().contract.strike \
               - (self.get_long_put_leg().contract.premium - self.get_short_put_leg().contract.premium)

    @property
    def profit_cap_price(self):
        return self.get_short_put_leg().contract.strike


class BullPutSpread(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        assert len(legs) == 3
        super().__init__('bull_put_spread', stock, legs, target_price_lower, target_price_upper)

    @property
    def display_name(self):
        long_put_leg = self.get_long_put_leg()
        short_put_leg = self.get_short_put_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_put_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Bull put spread] {} {} strike ${} / ${} at ${:.2f} net credit' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_put_leg.units) if long_put_leg.units > 1 else '',
                    expiration_date_str, long_put_leg.contract.strike, short_put_leg.contract.strike,
                    short_put_leg.contract.premium - long_put_leg.contract.premium)

    @property
    def break_even_price(self):
        return self.get_short_put_leg().contract.strike \
               - (self.get_short_put_leg().contract.premium - self.get_long_put_leg().contract.premium)

    @property
    def profit_cap_price(self):
        return self.get_short_put_leg().contract.strike

# TODO: add a sell everything now and hold cash trade and a long stock trade.
