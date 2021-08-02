from tiger.core.leg import OptionLeg

from .base import Trade


class LongButterflySpread(Trade):
    def __init__(self, type, stock, legs, premium_type, target_price_lower, target_price_upper):
        super().__init__(type, stock, legs, premium_type, target_price_lower, target_price_upper)
        if self.legs[0].contract.is_call:
            self.long_leg_lower = self.get_nth_option_leg('long', 'call', 0)
            self.long_leg_upper = self.get_nth_option_leg('long', 'call', 1)
            self.short_leg = self.get_nth_option_leg('short', 'call', 0)
        else:
            self.long_leg_lower = self.get_nth_option_leg('long', 'put', 0)
            self.long_leg_upper = self.get_nth_option_leg('long', 'put', 1)
            self.short_leg = self.get_nth_option_leg('short', 'put', 0)
        self.validate()

    def validate(self):
        assert self.type == 'long_butterfly_spread'
        assert len(self.legs) == 3
        assert self.long_leg_lower.units == self.long_leg_upper.units
        assert self.short_leg.units == self.long_leg_upper.units * 2
        assert self.long_leg_lower.contract.expiration == self.long_leg_upper.contract.expiration == self.short_leg.contract.expiration
        assert self.long_leg_lower.contract.strike < self.short_leg.contract.strike < self.long_leg_upper.contract.strike
        assert self.stock.ticker.id == self.long_leg_lower.contract.ticker.id == self.long_leg_upper.contract.ticker.id == self.short_leg.contract.ticker.id

    @property
    def is_bullish(self):
        return False

    @property
    def net_debit_per_unit(self):
        '''Nagtive number means net credit.'''
        net_debit = 0.0
        if self.long_leg_lower and self.long_leg_upper and self.short_leg:
            net_debit += self.long_leg_lower.net_cost / self.long_leg_lower.units
            net_debit += self.long_leg_upper.net_cost / self.long_leg_upper.units
            net_debit += self.short_leg.net_cost / self.short_leg.units * 2
        return net_debit
