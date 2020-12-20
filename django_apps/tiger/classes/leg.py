from abc import ABC, abstractmethod


class Leg(ABC):
    def __init__(self, is_long, units, cash=None, stock=None, contract=None):
        if (not cash and not stock and not contract) or (stock and contract) or (cash and contract) or (cash and stock):
            raise ValueError('Leg must have exactly 1 security.')
        self.is_long = is_long  # True means "long"/"buy", False means "short"/"sell".
        self.units = units
        self.stock = stock
        self.contract = contract
        self.cost = self.get_cost()

    @abstractmethod
    def get_cost(self):
        pass

    @abstractmethod
    def get_income_at_target_price(self, stock_price):
        pass

    def get_profit_at_target_price(self, target_price):
        return self.get_income_at_target_price(target_price) - self.get_cost()


# Represent units US dollar. Currently only long.
class CashLeg(Leg):
    def __init__(self, units):
        super().__init__(True, units, cash=1)

    def get_cost(self):
        return self.units

    def get_income_at_target_price(self, stock_price):
        return self.units


# Represent `units` shares of stock. Currently only long.
class StockLeg(Leg):
    def __init__(self, units, stock):
        super().__init__(True, units, stock=stock)

    def get_cost(self):
        return self.stock.stock_price * self.units

    def get_income_at_target_price(self, target_price):
        return target_price * self.units


# Represent `units` contract of option.
class OptionLeg(Leg):
    def __init__(self, is_long, units, contract):
        super().__init__(is_long, units, contract=contract)

    # TODO: 100 can be obtained from contract_size. Fix this.
    def get_cost(self):
        return self.contract.premium * (100 if self.is_long else -100) * self.units

    def get_income_at_target_price(self, target_price):
        if self.contract.is_call:
            return max(0, target_price - self.contract.strike) * (100 if self.is_long else -100) * self.units
        else:
            return max(0, self.contract.strike - target_price) * (100 if self.is_long else -100) * self.units
