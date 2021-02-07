from abc import ABC, abstractmethod

from .security import Cash, Stock, OptionContract


class Leg(ABC):
    def __init__(self, is_long, units, cash=None, stock=None, contract=None):
        if (not cash and not stock and not contract) or (stock and contract) or (cash and contract) or (cash and stock):
            raise ValueError('Leg must have exactly 1 security.')
        self.is_long = is_long  # True means "long"/"buy", False means "short"/"sell".
        self.units = units
        self.cash = cash
        self.stock = stock
        self.contract = contract

    @classmethod
    def from_snapshot(cls, leg_snapshot, premium_type):
        if leg_snapshot.cash_snapshot:
            return CashLeg(leg_snapshot.units)
        elif leg_snapshot.stock_snapshot:
            stock = Stock.from_snapshot(leg_snapshot.stock_snapshot)
            return StockLeg(leg_snapshot.units, stock)
        elif leg_snapshot.contract_snapshot:
            contract = OptionContract.from_snapshot(leg_snapshot.contract_snapshot)
            return OptionLeg(leg_snapshot.is_long, leg_snapshot.units, contract, premium_type)

    @property
    def is_cash(self):
        return self.cash is not None

    # TODO: remove once we switched frontend to not depend on this field.
    @property
    @abstractmethod
    def name(self):
        pass

    @property
    @abstractmethod
    def display_name(self):
        pass

    @property
    @abstractmethod
    def cost(self):
        pass

    @abstractmethod
    def get_value_in_price_range(self, price_lower, price_upper):
        pass

    def get_profit_in_price_range(self, price_lower, price_upper):
        return self.get_value_in_price_range(price_lower, price_upper) - self.cost


# Represent units US dollar. Currently only long.
class CashLeg(Leg):
    def __init__(self, units):
        super().__init__(True, units, cash=Cash())

    @property
    def name(self):
        return 'long_cash_leg'

    @property
    def display_name(self):
        return 'Keep ${} cash as collateral'.format(self.units)

    @property
    def cost(self):
        return self.units

    def get_value_in_price_range(self, price_lower, price_upper):
        return self.cost


# Represent `units` shares of stock. Currently only long.
class StockLeg(Leg):
    def __init__(self, units, stock):
        super().__init__(True, units, stock=stock)

    @property
    def name(self):
        return 'long_stock_leg'

    @property
    def display_name(self):
        return 'Long {} share{} of {} at ${:.2f} per share as collateral' \
            .format(self.units, 's' if self.units > 1 else '', self.stock.display_name, self.stock.stock_price)

    @property
    def cost(self):
        return self.stock.stock_price * self.units

    def get_value_in_price_range(self, price_lower, price_upper):
        return self.stock.get_value_in_price_range(price_lower, price_upper) * self.units


# Represent `units` contract of option.
class OptionLeg(Leg):
    def __init__(self, is_long, units, contract, premium_type):
        assert premium_type in ('mid', 'market')
        super().__init__(is_long, units, contract=contract)
        self.premium_type = premium_type

    @property
    def name(self):
        return ('long_' if self.is_long else 'short_') + ('call_' if self.contract.is_call else 'put_') + 'leg'

    @property
    def display_name(self):
        if self.premium_type == 'market':
            premium_name = 'ask' if self.is_long else 'bid'
        else:
            premium_name = 'mid/mark'
        return '{} {} contract{} of {} at ${:.2f}({}) per contract' \
            .format('Long' if self.is_long else 'Short', self.units,
                    's' if self.units > 1 else '', self.contract.display_name, abs(self.cost), premium_name)

    @property
    def premium_used(self):
        if self.premium_type == 'mid':
            return self.contract.mark
        else:
            return self.contract.ask if self.is_long else self.contract.bid

    @property
    def cost(self):
        return self.premium_used * 100 * (self.units if self.is_long else -self.units)

    def get_value_in_price_range(self, price_lower, price_upper):
        return self.contract.get_value_in_price_range(price_lower, price_upper) * (
            self.units if self.is_long else -self.units)
