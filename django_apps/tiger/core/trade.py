from .security import Stock
from .leg import Leg, CashLeg, StockLeg, OptionLeg
from tiger.utils import days_from_timestamp


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
        if attributes:
            if use_min:
                return min(attributes)
            else:
                return max(attributes)
        else:
            return None

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

        profit_sum = 0.0
        for leg in self.legs:
            profit_sum += leg.get_profit_at_target_price(self.target_price)
        return profit_sum

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


class TradeFactory:
    @staticmethod
    def build_long_call(stock, call_contract, target_price=None, available_cash=None):
        long_call_leg = OptionLeg('long_call_leg', True, 1, call_contract)
        unit_multiplier = int(available_cash / long_call_leg.cost) if available_cash is not None else 1
        if unit_multiplier < 1:
            # Insufficient fund.
            return None

        long_call_leg.units *= unit_multiplier
        new_trade = LongCall(stock, [long_call_leg], target_price=target_price)
        return new_trade

    @staticmethod
    def build_long_put(stock, put_contract, target_price=None, available_cash=None):
        long_put_leg = OptionLeg('long_put_leg', True, 1, put_contract)
        unit_multiplier = int(available_cash / long_put_leg.cost) if available_cash is not None else 1
        if unit_multiplier < 1:
            return None

        long_put_leg.units *= unit_multiplier
        new_trade = LongPut(stock, [long_put_leg], target_price=target_price)
        return new_trade

    @staticmethod
    def build_covered_call(stock, call_contract, target_price=None, available_cash=None):
        long_stock_leg = StockLeg('long_stock_leg', 100, stock)
        short_call_leg = OptionLeg('short_call_leg', False, 1, call_contract)
        unit_cost = long_stock_leg.cost + short_call_leg.cost
        unit_multiplier = int(available_cash / unit_cost) if available_cash is not None else 1
        if unit_multiplier < 1:
            return None

        long_stock_leg.units *= unit_multiplier
        short_call_leg.units *= unit_multiplier
        new_trade = CoveredCall(stock, [long_stock_leg, short_call_leg], target_price=target_price)
        return new_trade

    @staticmethod
    def build_cash_secured_put(stock, put_contract, target_price=None, available_cash=None):
        short_put_leg = OptionLeg('short_put_leg', False, 1, put_contract)
        long_cash_leg = CashLeg(100 * put_contract.strike)
        unit_cost = short_put_leg.cost + long_cash_leg.cost
        unit_multiplier = int(available_cash / unit_cost) if available_cash is not None else 1
        if unit_multiplier < 1:
            return None

        short_put_leg.units *= unit_multiplier
        long_cash_leg.units *= unit_multiplier
        new_trade = CashSecuredPut(stock, [short_put_leg, long_cash_leg], target_price=target_price)
        return new_trade


class LongCall(Trade):
    def __init__(self, stock, legs, target_price=None):
        # TODO: add validation.
        super().__init__('long_call', stock, legs, target_price)

    @property
    def break_even_price(self):
        return self.get_leg('long_call_leg').contract.strike + self.get_leg('long_call_leg').contract.premium


class LongPut(Trade):
    def __init__(self, stock, legs, target_price=None):
        # TODO: add validation.
        super().__init__('long_put', stock, legs, target_price)

    @property
    def break_even_price(self):
        return self.get_leg('long_put_leg').contract.strike - self.get_leg('long_put_leg').contract.premium


# TODO: add validation logic (number of stock and contract should match)
class CoveredCall(Trade):
    def __init__(self, stock, legs, target_price=None):
        # TODO: add validation.
        super().__init__('covered_call', stock, legs, target_price)

    @property
    def break_even_price(self):
        return self.stock.stock_price - self.get_leg('short_call_leg').contract.premium

    @property
    def profit_cap(self):
        profit_cap_price = self.get_leg('short_call_leg').contract.strike + self.get_leg(
            'short_call_leg').contract.premium
        profit = self.get_leg('long_stock_leg').get_profit_at_target_price(profit_cap_price) + \
                 self.get_leg('short_call_leg').get_profit_at_target_price(profit_cap_price)
        return profit


class CashSecuredPut(Trade):
    def __init__(self, stock, legs, target_price=None):
        # TODO: add validation.
        super().__init__('cash_secured_put', stock, legs, target_price)

    @property
    def break_even_price(self):
        return self.get_leg('short_put_leg').contract.strike - self.get_leg('short_put_leg').contract.premium

    @property
    def profit_cap(self):
        return -self.get_leg('short_put_leg').cost

# TODO: add a sell everything now and hold cash trade and a long stock trade.
