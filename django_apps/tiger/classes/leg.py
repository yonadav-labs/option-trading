from abc import ABC, abstractmethod

from .security import Cash


class Leg(ABC):
    def __init__(self, type, is_long, units, cash=None, stock=None, contract=None):
        if (not cash and not stock and not contract) or (stock and contract) or (cash and contract) or (cash and stock):
            raise ValueError('Leg must have exactly 1 security.')
        self.type = type
        self.is_long = is_long  # True means "long"/"buy", False means "short"/"sell".
        self.units = units
        self.cash = cash
        self.stock = stock
        self.contract = contract
        self.cost = self.get_cost()

    @abstractmethod
    def get_cost(self):
        pass

    @abstractmethod
    def get_value_at_target_price(self, target_price):
        pass

    def get_profit_at_target_price(self, target_price):
        return self.get_value_at_target_price(target_price) - self.get_cost()


# Represent units US dollar. Currently only long.
class CashLeg(Leg):
    def __init__(self, units):
        super().__init__('cash', True, units, cash=Cash())

    def get_cost(self):
        return self.cash.get_cost() * self.units

    def get_value_at_target_price(self, target_price):
        return self.cash.get_cost() * self.units


# Represent `units` shares of stock. Currently only long.
class StockLeg(Leg):
    def __init__(self, units, stock):
        super().__init__('stock', True, units, stock=stock)

    def get_cost(self):
        return self.stock.get_cost() * self.units

    def get_value_at_target_price(self, target_price):
        return self.stock.get_value_at_target_price(target_price) * self.units


# Represent `units` contract of option.
class OptionLeg(Leg):
    def __init__(self, is_long, units, contract):
        super().__init__('option', is_long, units, contract=contract)

    def get_cost(self):
        return self.contract.get_cost() * (self.units if self.is_long else -self.units)

    def get_value_at_target_price(self, target_price):
        return self.contract.get_value_at_target_price(target_price) * (self.units if self.is_long else -self.units)
