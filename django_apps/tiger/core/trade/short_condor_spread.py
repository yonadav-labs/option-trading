from tiger.core.leg import OptionLeg

from .base import Trade


class ShortCondorSpread(Trade):
    def __init__(self, type, stock, legs, premium_type, target_price_lower, target_price_upper):
        super().__init__(type, stock, legs, premium_type, target_price_lower, target_price_upper)
        if self.legs[0].contract.is_call:
            self.left_wing_long = self.get_nth_option_leg('long', 'call', 0)
            self.left_wing_short = self.get_nth_option_leg('short', 'call', 0)
            self.right_wing_long = self.get_nth_option_leg('long', 'call', 1)
            self.right_wing_short = self.get_nth_option_leg('short', 'call', 1)
        else:
            self.left_wing_long = self.get_nth_option_leg('long', 'put', 0)
            self.left_wing_short = self.get_nth_option_leg('short', 'put', 0)
            self.right_wing_long = self.get_nth_option_leg('long', 'put', 1)
            self.right_wing_short = self.get_nth_option_leg('short', 'put', 1)
        self.validate()

    def validate(self):
        assert self.type == 'short_condor_spread'
        assert len(self.legs) == 4
        assert self.left_wing_long.units == self.right_wing_long.units == self.left_wing_short.units == self.right_wing_short.units
        assert self.left_wing_long.contract.expiration == self.right_wing_long.contract.expiration == self.left_wing_short.contract.expiration == self.right_wing_short.contract.expiration
        assert self.right_wing_short.contract.strike > self.right_wing_long.contract.strike > self.stock.stock_price
        assert self.left_wing_short.contract.strike < self.left_wing_long.contract.strike < self.stock.stock_price
        assert self.stock.ticker.id == self.left_wing_long.contract.ticker.id == self.right_wing_long.contract.ticker.id == self.left_wing_short.contract.ticker.id == self.right_wing_short.contract.ticker.id

    @property
    def is_bullish(self):
        return False
