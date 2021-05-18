from abc import ABC, abstractmethod

from .security import Cash, Stock, OptionContract


class Leg(ABC):
    def __init__(self, is_long, units, cash=None, stock=None, contract=None):
        if (not cash and not stock and not contract) or (stock and contract) or (cash and contract) or (cash and stock):
            raise ValueError('Leg must have exactly 1 security.')
        # True means "long"/"buy", False means "short"/"sell".
        self.is_long = is_long
        self.units = units
        self.cash = cash
        self.stock = stock
        self.contract = contract

    @classmethod
    def from_snapshot(cls, leg_snapshot, premium_type, broker_settings):
        if leg_snapshot.cash_snapshot:
            return CashLeg(leg_snapshot.units)
        elif leg_snapshot.stock_snapshot:
            stock = Stock.from_snapshot(leg_snapshot.stock_snapshot)
            return StockLeg(leg_snapshot.units, stock)
        elif leg_snapshot.contract_snapshot:
            contract = OptionContract.from_snapshot(leg_snapshot.contract_snapshot)
            return OptionLeg(leg_snapshot.is_long, leg_snapshot.units, contract, premium_type, broker_settings)

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
    def total_cost(self):
        pass

    @property
    @abstractmethod
    def cost_per_share(self):
        pass

    @abstractmethod
    def get_value_in_price_range(self, price_lower, price_upper):
        pass

    def get_return_at_expiration(self, price_lower, price_upper):
        '''gets profit or loss of leg at expiration'''
        return self.get_value_in_price_range(price_lower, price_upper) - self.total_cost


# Represent units US dollar. Currently only long.
class CashLeg(Leg):
    def __init__(self, units):
        super().__init__(True, units, cash=Cash())

    @property
    def name(self):
        return 'long_cash_leg'

    @property
    def total_cost(self):
        return self.units

    @property
    def cost_per_share(self):
        return 1

    def get_value_in_price_range(self, price_lower, price_upper):
        return self.total_cost


# Represent `units` shares of stock. Currently only long.
class StockLeg(Leg):
    def __init__(self, units, stock):
        super().__init__(True, units, stock=stock)

    @property
    def name(self):
        return 'long_stock_leg'

    @property
    def total_cost(self):
        return self.cost_per_share * (self.units if self.is_long else -self.units)

    @property
    def cost_per_share(self):
        return self.stock.stock_price

    def get_value_in_price_range(self, price_lower, price_upper):
        return self.stock.get_value_in_price_range(price_lower, price_upper) * (self.units if self.is_long else -self.units)


# Represent `units` contract of option.
class OptionLeg(Leg):
    def __init__(self, is_long, units, contract, premium_type, broker_settings):
        assert premium_type in ('mid', 'market')
        super().__init__(is_long, units, contract=contract)
        self.use_market_price = premium_type == 'market'
        self.open_commission = broker_settings['open_commission']
        self.close_commission = broker_settings['close_commission']

    @property
    def name(self):
        return ('long_' if self.is_long else 'short_') + ('call_' if self.contract.is_call else 'put_') + 'leg'

    @property
    def cost_per_share(self):
        if self.use_market_price:
            return self.contract.ask if self.is_long else self.contract.bid
        else:
            return self.contract.mark

    @property
    def total_cost(self):
        return self.get_cost()

    @property
    def net_cost(self):
        return self.get_cost(False)

    def get_cost(self, include_commission=True):
        cost = self.cost_per_share * 100 * \
            (self.units if self.is_long else -self.units)
        if include_commission:
            cost += (self.open_commission + self.close_commission)
        return cost

    def get_value_in_price_range(self, price_lower, price_upper):
        return self.contract.get_value_in_price_range(price_lower, price_upper) * (self.units if self.is_long else -self.units)
