from abc import ABC, abstractmethod

from .leg import CashLeg, StockLeg, OptionLeg


class Trade(ABC):
    def __init__(self, type, stock_price, target_price=None):
        '''
        :param stock_price: current stock price.
        :param target_price: target stock price in the future. Optional.
        '''
        self.type = type
        self.stock_price = stock_price
        self.target_price = target_price

    def init_basic_derived(self):
        self.break_even_price = self.get_break_even_price()  # Could be None.
        self.to_break_even_ratio = self.get_to_break_even_ratio()  # Could be None.
        self.cost = self.get_cost()

        if self.target_price is not None:
            self.to_target_price_ratio = self.get_to_target_price_ratio()
            self.target_price_profit = self.get_target_price_profit()
            self.target_price_profit_ratio = self.get_target_price_profit_ratio()

    @abstractmethod
    def get_cost(self):
        pass

    @abstractmethod
    def get_break_even_price(self):
        pass

    @abstractmethod
    def get_target_price_profit(self):
        pass

    def get_target_price_profit_ratio(self):
        return self.get_target_price_profit() / self.get_cost()

    def get_to_target_price_ratio(self):
        if self.target_price is None:
            return None
        return self.target_price / self.stock_price - 1.0

    def get_to_break_even_ratio(self):
        if self.get_break_even_price() is None:
            return None
        return (self.get_break_even_price() - self.stock_price) / self.stock_price


class LongCall(Trade):
    def __init__(self, stock_price, call_contract, target_price=None):
        super().__init__('long_call', stock_price, target_price)
        self.long_call_leg = OptionLeg(True, 1, call_contract)
        self.init_basic_derived()

    def get_cost(self):
        return self.long_call_leg.cost

    def get_break_even_price(self):
        return self.long_call_leg.contract.strike + self.long_call_leg.contract.premium

    def get_target_price_profit(self):
        return self.long_call_leg.get_profit_at_target_price(self.target_price)


class LongPut(Trade):
    def __init__(self, stock_price, put_contract, target_price=None):
        super().__init__('long_put', stock_price, target_price)
        self.long_put_leg = OptionLeg(True, 1, put_contract)
        self.init_basic_derived()

    def get_cost(self):
        return self.long_put_leg.cost

    def get_break_even_price(self):
        return self.long_put_leg.contract.strike - self.long_put_leg.contract.premium

    def get_target_price_profit(self):
        return self.long_put_leg.get_profit_at_target_price(self.target_price)


class CoveredCall(Trade):
    def __init__(self, stock_price, stock, call_contract, target_price=None):
        super().__init__('covered_call', stock_price, target_price)

        self.long_stock_leg = StockLeg(100, stock)
        self.short_call_leg = OptionLeg(False, 1, call_contract)
        self.init_basic_derived()
        # Covered call specific metrics:
        self.profit_cap = self.get_profit_cap()
        self.profit_cap_ratio = self.get_profit_cap_ratio()
        self.premium_profit = self.get_premium_profit()
        self.premium_profit_ratio = self.get_premium_profit_ratio()

    def get_cost(self):
        return self.long_stock_leg.cost + self.short_call_leg.cost

    def get_break_even_price(self):
        return self.stock_price - self.short_call_leg.contract.premium

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


class CashSecuredPut(Trade):
    def __init__(self, stock_price, put_contract, target_price=None):
        super().__init__('cash_secured_put', stock_price, target_price)

        self.short_put_leg = OptionLeg(False, 1, put_contract)
        self.long_cash_leg = CashLeg(100 * self.short_put_leg.contract.strike)
        self.init_basic_derived()
        # Cash secured put specific metrics:
        self.premium_profit = self.get_premium_profit()
        self.premium_profit_ratio = self.get_premium_profit_ratio()
        self.cash_required = self.long_cash_leg.cost

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

# TODO: add a sell everything now and hold cash trade.
