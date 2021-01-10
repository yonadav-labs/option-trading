from abc import ABC, abstractmethod

from .security import Cash, Stock, OptionContract


class Leg(ABC):
    def __init__(self, name, is_long, units, cash=None, stock=None, contract=None):
        if (not cash and not stock and not contract) or (stock and contract) or (cash and contract) or (cash and stock):
            raise ValueError('Leg must have exactly 1 security.')
        self.name = name
        self.is_long = is_long  # True means "long"/"buy", False means "short"/"sell".
        self.units = units
        self.cash = cash
        self.stock = stock
        self.contract = contract

    @classmethod
    def from_snapshot(cls, leg_snapshot):
        if leg_snapshot.cash_snapshot:
            return CashLeg(leg_snapshot.units)
        elif leg_snapshot.stock_snapshot:
            stock = Stock.from_snapshot(leg_snapshot.stock_snapshot)
            return StockLeg(leg_snapshot.name, leg_snapshot.units, stock)
        elif leg_snapshot.contract_snapshot:
            contract = OptionContract.from_snapshot(leg_snapshot.contract_snapshot)
            return OptionLeg(leg_snapshot.name, leg_snapshot.is_long, leg_snapshot.units, contract)

    @property
    def is_cash(self):
        return self.cash is not None

    @property
    @abstractmethod
    def display_name(self):
        pass

    @property
    @abstractmethod
    def cost(self):
        pass

    @abstractmethod
    def get_value_at_target_price(self, target_price):
        pass

    def get_profit_at_target_price(self, target_price):
        return self.get_value_at_target_price(target_price) - self.cost


# Represent units US dollar. Currently only long.
class CashLeg(Leg):
    def __init__(self, units):
        super().__init__('long_cash_leg', True, units, cash=Cash())

    @property
    def display_name(self):
        return 'Keep ${} cash'.format(self.units)

    @property
    def cost(self):
        return self.cash.cost * self.units

    def get_value_at_target_price(self, target_price):
        return self.cash.cost * self.units


# Represent `units` shares of stock. Currently only long.
class StockLeg(Leg):
    def __init__(self, name, units, stock):
        super().__init__(name, True, units, stock=stock)

    @property
    def display_name(self):
        return 'Long {} share{} of {} at ${:.2f} per share'.format(self.units, 's' if self.units > 1 else '',
                                                                   self.stock.display_name, self.stock.stock_price)

    @property
    def cost(self):
        return self.stock.cost * self.units

    def get_value_at_target_price(self, target_price):
        return self.stock.get_value_at_target_price(target_price) * self.units


# Represent `units` contract of option.
class OptionLeg(Leg):
    def __init__(self, name, is_long, units, contract):
        super().__init__(name, is_long, units, contract=contract)

    @property
    def display_name(self):
        return '{} {} contract{} of {} at ${:.2f} per contract' \
            .format('Long' if self.is_long else 'Short', self.units,
                    's' if self.units > 1 else '', self.contract.display_name, self.contract.cost)

    @property
    def cost(self):
        return self.contract.cost * (self.units if self.is_long else -self.units)

    def get_value_at_target_price(self, target_price):
        return self.contract.get_value_at_target_price(target_price) * (self.units if self.is_long else -self.units)
