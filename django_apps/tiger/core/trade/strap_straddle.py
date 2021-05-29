from .base import Trade
from tiger.core.leg import OptionLeg


class StrapStraddle(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower, target_price_upper):
        super().__init__('strap_straddle', stock, legs, premium_type, target_price_lower, target_price_upper)
        self.long_call_leg = self.get_nth_option_leg('long', 'call', 0)
        self.long_put_leg = self.get_nth_option_leg('long', 'put', 0)
        self.validate()

    def validate(self):
        assert len(self.legs) == 2
        assert self.long_call_leg.units > self.long_put_leg.units
        assert self.long_call_leg.contract.expiration == self.long_put_leg.contract.expiration
        assert self.long_call_leg.contract.strike == self.long_put_leg.contract.strike
        assert self.stock.ticker.id == self.long_call_leg.contract.ticker.id == self.long_put_leg.contract.ticker.id

    @staticmethod
    def build(stock, call_contract, put_contract, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_call_leg = OptionLeg(True, 2, call_contract, premium_type, broker_settings)
        long_put_leg = OptionLeg(True, 1, put_contract, premium_type, broker_settings)
        new_trade = StrapStraddle(stock, [long_call_leg, long_put_leg], premium_type,
                                  target_price_lower, target_price_upper)
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @property
    def is_bullish(self):
        return True

    @property
    def net_debit_per_unit(self):
        '''Nagtive number means net credit.'''
        net_debit = 0.0
        if self.long_call_leg and self.long_put_leg:
            net_debit += self.long_call_leg.net_cost / self.long_call_leg.units * \
                (self.long_call_leg.units // self.long_put_leg.units)
            net_debit += self.long_put_leg.net_cost / self.long_put_leg.units
        return net_debit
