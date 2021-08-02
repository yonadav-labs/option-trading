from tiger.core.leg import OptionLeg

from .base import Trade


class BearPutSpread(Trade):
    def validate(self):
        assert self.type == 'bear_put_spread'
        assert len(self.legs) == 2

        long_put_leg = self.get_nth_option_leg('long', 'put', 0)
        short_put_leg = self.get_nth_option_leg('short', 'put', 0)
        assert long_put_leg.units == short_put_leg.units
        assert long_put_leg.contract.expiration == short_put_leg.contract.expiration
        # long put strike should be greater than short put
        assert long_put_leg.contract.strike > short_put_leg.contract.strike
        assert self.stock.ticker.id == long_put_leg.contract.ticker.id == short_put_leg.contract.ticker.id

    @property
    def is_bullish(self):
        return False
