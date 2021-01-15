from .security import Stock
from .leg import Leg, CashLeg, StockLeg, OptionLeg
from tiger.utils import days_from_timestamp, timestamp_to_datetime_with_default_tz


class Trade:
    def __init__(self, type, stock, legs, target_price=None):
        '''
        :param type: type of trade.
        :param stock: current state of underlying stock.
        :param legs: all legs of this trade.
        :param target_price: target stock price in the future. Optional.
        '''
        self.type = type
        self.stock = stock
        self.legs = legs
        self.target_price = target_price

    @classmethod
    def from_snapshot(cls, trade_snapshot):
        stock = Stock.from_snapshot(trade_snapshot.stock_snapshot)
        legs = [Leg.from_snapshot(leg_snapshot) for leg_snapshot in trade_snapshot.leg_snapshots.all()]
        new_trade = cls(trade_snapshot.type, stock, legs, target_price=trade_snapshot.target_price)
        if trade_snapshot.type == 'long_call':
            new_trade.__class__ = LongCall
        elif trade_snapshot.type == 'long_put':
            new_trade.__class__ = LongPut
        elif trade_snapshot.type == 'covered_call':
            new_trade.__class__ = CoveredCall
        elif trade_snapshot.type == 'cash_secured_put':
            new_trade.__class__ = CashSecuredPut
        elif trade_snapshot.type == 'bull_call_spread':
            new_trade.__class__ = BullCallSpread
        return new_trade

    def get_leg(self, name):
        for leg in self.legs:
            if leg.name == name:
                return leg
        return None

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
        if self.target_price is None:
            return None
        return self.get_profit_at_price(self.target_price)

    @property
    def target_price_profit_ratio(self):
        if self.target_price is None:
            return None
        return self.target_price_profit / self.cost

    @property
    def to_target_price_ratio(self):
        if self.target_price is None:
            return None
        return self.target_price / self.stock.stock_price - 1.0

    @property
    def to_break_even_ratio(self):
        return (self.break_even_price - self.stock.stock_price) / self.stock.stock_price

    @property
    def break_even_price(self):
        return None

    @property
    def display_name(self):
        return None

    @property
    def profit_cap(self):
        '''
        :return: None means no cap.
        '''
        return None

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
        step = self.stock.stock_price / 50
        price = self.stock.stock_price / 2.0
        for i in range(50):
            graph_prices.append(price)
            price += step

        for leg in self.legs:
            if leg.contract and leg.contract.strike not in graph_prices:
                graph_prices.append(leg.contract.strike)

        graph_prices = sorted(graph_prices)
        return graph_prices

    @property
    def graph_y_points(self):
        return [self.get_profit_at_price(price) for price in self.graph_x_points]

    def get_profit_at_price(self, price):
        profit_sum = 0.0
        for leg in self.legs:
            profit_sum += leg.get_profit_at_target_price(price)
        return profit_sum

    def max_out(self, available_cash):
        '''Returns True if succeeded, otherwise False.'''
        # TODO: think of how to deal with net credit position.
        multiplier = int(available_cash / self.cost)
        assert multiplier >= 0
        for leg in self.legs:
            leg.units *= multiplier
        return multiplier >= 1


class TradeFactory:
    @staticmethod
    def build_long_call(stock, call_contract, target_price=None, available_cash=None):
        long_call_leg = OptionLeg('long_call_leg', True, 1, call_contract)
        new_trade = LongCall(stock, [long_call_leg], target_price=target_price)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_long_put(stock, put_contract, target_price=None, available_cash=None):
        long_put_leg = OptionLeg('long_put_leg', True, 1, put_contract)
        new_trade = LongPut(stock, [long_put_leg], target_price=target_price)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_covered_call(stock, call_contract, target_price=None, available_cash=None):
        long_stock_leg = StockLeg('long_stock_leg', 100, stock)
        short_call_leg = OptionLeg('short_call_leg', False, 1, call_contract)
        new_trade = CoveredCall(stock, [long_stock_leg, short_call_leg], target_price=target_price)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_cash_secured_put(stock, put_contract, target_price=None, available_cash=None):
        short_put_leg = OptionLeg('short_put_leg', False, 1, put_contract)
        long_cash_leg = CashLeg(100 * put_contract.strike)
        new_trade = CashSecuredPut(stock, [short_put_leg, long_cash_leg], target_price=target_price)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_bull_call_spread(stock, call_contract_1, call_contract_2, target_price=None, available_cash=None):
        if call_contract_1.strike == call_contract_2.strike or call_contract_1.expiration != call_contract_2.expiration:
            return None
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)

        long_call_leg = OptionLeg('long_call_leg', True, 1, lower_strike_call)
        short_call_leg = OptionLeg('short_call_leg', False, 1, higher_strike_call)
        new_trade = BullCallSpread(stock, [long_call_leg, short_call_leg], target_price=target_price)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade


class LongCall(Trade):
    def __init__(self, stock, legs, target_price=None):
        # TODO: add validation.
        super().__init__('long_call', stock, legs, target_price)

    @property
    def display_name(self):
        return self.get_leg('long_call_leg').display_name

    @property
    def break_even_price(self):
        return self.get_leg('long_call_leg').contract.strike + self.get_leg('long_call_leg').contract.premium


class LongPut(Trade):
    def __init__(self, stock, legs, target_price=None):
        # TODO: add validation.
        super().__init__('long_put', stock, legs, target_price)

    @property
    def display_name(self):
        return self.get_leg('long_put_leg').display_name

    @property
    def break_even_price(self):
        return self.get_leg('long_put_leg').contract.strike - self.get_leg('long_put_leg').contract.premium


# TODO: add validation logic (number of stock and contract should match)
class CoveredCall(Trade):
    def __init__(self, stock, legs, target_price=None):
        # TODO: add validation.
        super().__init__('covered_call', stock, legs, target_price)

    @property
    def display_name(self):
        short_call_leg = self.get_leg('short_call_leg')
        long_stock_leg = self.get_leg('long_stock_leg')
        return 'Short {} contract{} of {}, covered by {} share{} of {}' \
            .format(short_call_leg.units, 's' if short_call_leg.units > 1 else '',
                    short_call_leg.contract.display_name,
                    long_stock_leg.units, 's' if long_stock_leg.units > 1 else '',
                    long_stock_leg.stock.display_name)

    @property
    def break_even_price(self):
        return self.stock.stock_price - self.get_leg('short_call_leg').contract.premium

    @property
    def profit_cap(self):
        profit_cap_price = self.get_leg('short_call_leg').contract.strike
        return self.get_profit_at_price(profit_cap_price)


class CashSecuredPut(Trade):
    def __init__(self, stock, legs, target_price=None):
        # TODO: add validation.
        super().__init__('cash_secured_put', stock, legs, target_price)

    @property
    def display_name(self):
        short_put_leg = self.get_leg('short_put_leg')
        long_cash_leg = self.get_leg('long_cash_leg')
        return 'Short {} contract{} of {}, covered by ${} cash' \
            .format(short_put_leg.units, 's' if short_put_leg.units > 1 else '',
                    short_put_leg.contract.display_name, long_cash_leg.units)

    @property
    def break_even_price(self):
        return self.get_leg('short_put_leg').contract.strike - self.get_leg('short_put_leg').contract.premium

    @property
    def profit_cap(self):
        return -self.get_leg('short_put_leg').cost


# TODO: generalize to vertical call spread, vertical spread...
class BullCallSpread(Trade):
    def __init__(self, stock, legs, target_price=None):
        # TODO: add validation.
        super().__init__('bull_call_spread', stock, legs, target_price)

    @property
    def display_name(self):
        long_call_leg = self.get_leg('long_call_leg')
        short_call_leg = self.get_leg('short_call_leg')
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_call_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '{} {} {} strike ${} - ${} bull call spread for total ${:.2f}' \
            .format(long_call_leg.units, self.stock.ticker.symbol, expiration_date_str, long_call_leg.contract.strike,
                    short_call_leg.contract.strike, self.cost)

    @property
    def break_even_price(self):
        return self.get_leg('long_call_leg').contract.strike \
               + self.get_leg('long_call_leg').contract.premium \
               - self.get_leg('short_call_leg').contract.premium

    @property
    def profit_cap(self):
        profit_cap_price = self.get_leg('short_call_leg').contract.strike
        return self.get_profit_at_price(profit_cap_price)

# TODO: add a sell everything now and hold cash trade and a long stock trade.
