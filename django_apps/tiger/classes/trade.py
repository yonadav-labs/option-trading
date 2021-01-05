from abc import ABC, abstractmethod

from .leg import CashLeg, StockLeg, OptionLeg
from tiger.utils import days_from_timestamp


class Trade(ABC):
    def __init__(self, type, stock, target_price=None):
        '''
        :param stock: current state of underlying stock.
        :param target_price: target stock price in the future. Optional.
        '''
        self.type = type
        self.stock = stock
        self.target_price = target_price
        self.legs = []

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

    @property
    def expiration(self):
        '''
        If there is multiple contract legs, return the earliest expiration.
        :return: expiration timestamp
        '''
        expirations = [leg.contract.expiration for leg in self.legs if leg.contract]
        if expirations:
            return min(expirations)
        else:
            return None

    @property
    def last_trade_date(self):
        '''
        If there is multiple contract legs, return the earliest last_trade_date.
        :return: last_trade_date timestamp
        '''
        last_trade_dates = [leg.contract.last_trade_date for leg in self.legs if leg.contract]
        if last_trade_dates:
            return min(last_trade_dates)
        else:
            return None

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
        return self.target_price / self.stock.stock_price - 1.0

    @property
    def to_break_even_ratio(self):
        return (self.break_even_price - self.stock.stock_price) / self.stock.stock_price

    @property
    def days_till_expiration(self):
        return days_from_timestamp(self.expiration)

    @property
    @abstractmethod
    def break_even_price(self):
        pass

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


class LongCall(Trade):
    def __init__(self, stock, call_contract, target_price=None):
        super().__init__('long_call', stock, target_price)
        self.legs.append(OptionLeg('long_call_leg', True, 1, call_contract))

    @property
    def break_even_price(self):
        return self.get_leg('long_call_leg').contract.strike + self.get_leg('long_call_leg').contract.premium


class LongPut(Trade):
    def __init__(self, stock, put_contract, target_price=None):
        super().__init__('long_put', stock, target_price)
        self.legs.append(OptionLeg('long_put_leg', True, 1, put_contract))

    @property
    def break_even_price(self):
        return self.get_leg('long_put_leg').contract.strike - self.get_leg('long_put_leg').contract.premium


class CoveredCall(Trade):
    def __init__(self, stock, call_contract, target_price=None):
        super().__init__('covered_call', stock, target_price)
        self.legs.append(StockLeg('long_stock_leg', 100, stock))
        self.legs.append(OptionLeg('short_call_leg', False, 1, call_contract))

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
    def __init__(self, stock, put_contract, target_price=None):
        super().__init__('cash_secured_put', stock, target_price)
        self.legs.append(OptionLeg('short_put_leg', False, 1, put_contract))
        self.legs.append(CashLeg(100 * self.get_leg('short_put_leg').contract.strike))

    @property
    def break_even_price(self):
        return self.get_leg('short_put_leg').contract.strike - self.get_leg('short_put_leg').contract.premium

    @property
    def profit_cap(self):
        return -self.get_leg('short_put_leg').cost

# TODO: add a sell everything now and hold cash trade.
