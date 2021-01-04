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

    def init_basic_derived(self):
        self.break_even_price = self.get_break_even_price()  # Could be None.
        self.to_break_even_ratio = self.get_to_break_even_ratio()  # Could be None.
        self.cost = self.get_cost()
        self.expiration = self.get_expiration()
        self.days_till_expiration = days_from_timestamp(self.expiration)
        self.last_trade_date = self.get_last_trade_date()

        if self.target_price is not None:
            self.to_target_price_ratio = self.get_to_target_price_ratio()
            self.target_price_profit = self.get_target_price_profit()
            self.target_price_profit_ratio = self.get_target_price_profit_ratio()

    def get_leg_by_name(self, name):
        for leg in self.legs:
            if leg.name == name:
                return leg
        return None

    @abstractmethod
    def get_cost(self):
        pass

    @abstractmethod
    def get_break_even_price(self):
        pass

    @abstractmethod
    def get_target_price_profit(self):
        pass

    @abstractmethod
    def get_expiration(self):
        pass

    @abstractmethod
    def get_last_trade_date(self):
        pass

    def get_target_price_profit_ratio(self):
        return self.get_target_price_profit() / self.get_cost()

    def get_to_target_price_ratio(self):
        return self.target_price / self.stock.stock_price - 1.0

    def get_to_break_even_ratio(self):
        return (self.get_break_even_price() - self.stock.stock_price) / self.stock.stock_price


class LongCall(Trade):
    def __init__(self, stock, call_contract, target_price=None):
        super().__init__('long_call', stock, target_price)
        self.legs.append(OptionLeg('long_call_leg', True, 1, call_contract))
        self.init_basic_derived()

    @property
    def long_call_leg(self):
        return self.get_leg_by_name('long_call_leg')

    def get_cost(self):
        return self.long_call_leg.cost

    def get_break_even_price(self):
        return self.long_call_leg.contract.strike + self.long_call_leg.contract.premium

    def get_target_price_profit(self):
        return self.long_call_leg.get_profit_at_target_price(self.target_price)

    def get_expiration(self):
        return self.long_call_leg.contract.expiration

    def get_last_trade_date(self):
        return self.long_call_leg.contract.last_trade_date


class LongPut(Trade):
    def __init__(self, stock, put_contract, target_price=None):
        super().__init__('long_put', stock, target_price)
        self.legs.append(OptionLeg('long_put_leg', True, 1, put_contract))
        self.init_basic_derived()

    @property
    def long_put_leg(self):
        return self.get_leg_by_name('long_put_leg')

    def get_cost(self):
        return self.long_put_leg.cost

    def get_break_even_price(self):
        return self.long_put_leg.contract.strike - self.long_put_leg.contract.premium

    def get_target_price_profit(self):
        return self.long_put_leg.get_profit_at_target_price(self.target_price)

    def get_expiration(self):
        return self.long_put_leg.contract.expiration

    def get_last_trade_date(self):
        return self.long_put_leg.contract.last_trade_date


class CoveredCall(Trade):
    def __init__(self, stock, call_contract, target_price=None):
        super().__init__('covered_call', stock, target_price)
        self.legs.append(StockLeg('long_stock_leg', 100, stock))
        self.legs.append(OptionLeg('short_call_leg', False, 1, call_contract))
        self.init_basic_derived()
        # Covered call specific metrics:
        self.profit_cap = self.get_profit_cap()
        self.profit_cap_ratio = self.get_profit_cap_ratio()
        self.premium_profit = self.get_premium_profit()
        self.premium_profit_ratio = self.get_premium_profit_ratio()

    @property
    def long_stock_leg(self):
        return self.get_leg_by_name('long_stock_leg')

    @property
    def short_call_leg(self):
        return self.get_leg_by_name('short_call_leg')

    def get_cost(self):
        return self.long_stock_leg.cost + self.short_call_leg.cost

    def get_break_even_price(self):
        return self.stock.stock_price - self.short_call_leg.contract.premium

    def get_target_price_profit(self):
        return self.long_stock_leg.get_profit_at_target_price(self.target_price) + \
               self.short_call_leg.get_profit_at_target_price(self.target_price)

    def get_profit_cap(self):
        profit_cap_price = self.short_call_leg.contract.strike + self.short_call_leg.contract.premium
        profit = self.long_stock_leg.get_profit_at_target_price(profit_cap_price) + \
                 self.short_call_leg.get_profit_at_target_price(profit_cap_price)
        return profit

    def get_profit_cap_ratio(self):
        return self.profit_cap / self.cost

    def get_premium_profit(self):
        return min(-self.short_call_leg.cost, self.get_profit_cap())

    def get_premium_profit_ratio(self):
        return self.premium_profit / self.cost

    def get_expiration(self):
        return self.short_call_leg.contract.expiration

    def get_last_trade_date(self):
        return self.short_call_leg.contract.last_trade_date


class CashSecuredPut(Trade):
    def __init__(self, stock, put_contract, target_price=None):
        super().__init__('cash_secured_put', stock, target_price)
        self.legs.append(OptionLeg('short_put_leg', False, 1, put_contract))
        self.legs.append(CashLeg(100 * self.short_put_leg.contract.strike))
        self.init_basic_derived()
        # Cash secured put specific metrics:
        self.premium_profit = self.get_premium_profit()
        self.premium_profit_ratio = self.get_premium_profit_ratio()
        self.cash_required = self.long_cash_leg.cost

    @property
    def short_put_leg(self):
        return self.get_leg_by_name('short_put_leg')

    @property
    def long_cash_leg(self):
        return self.get_leg_by_name('long_cash_leg')

    def get_cost(self):
        return self.long_cash_leg.cost + self.short_put_leg.cost

    def get_break_even_price(self):
        return self.short_put_leg.contract.strike - self.short_put_leg.contract.premium

    def get_target_price_profit(self):
        return self.long_cash_leg.get_profit_at_target_price(self.target_price) + \
               self.short_put_leg.get_profit_at_target_price(self.target_price)

    def get_premium_profit(self):
        return -self.short_put_leg.cost

    def get_premium_profit_ratio(self):
        return self.premium_profit / self.cost

    def get_expiration(self):
        return self.short_put_leg.contract.expiration

    def get_last_trade_date(self):
        return self.short_put_leg.contract.last_trade_date

# TODO: add a sell everything now and hold cash trade.
