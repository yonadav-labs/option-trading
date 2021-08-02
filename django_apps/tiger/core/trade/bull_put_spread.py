from tiger.core.leg import OptionLeg, CashLeg

from .base import Trade


class BullPutSpread(Trade):
    def validate(self):
        assert len(self.legs) == 3
        assert self.type == 'bull_put_spread'

        long_put_leg = self.get_nth_option_leg('long', 'put', 0)
        short_put_leg = self.get_nth_option_leg('short', 'put', 0)
        assert long_put_leg.units == short_put_leg.units
        assert long_put_leg.contract.expiration == short_put_leg.contract.expiration
        # long put strike should be less than short put
        assert long_put_leg.contract.strike < short_put_leg.contract.strike
        assert self.stock.ticker.id == long_put_leg.contract.ticker.id == short_put_leg.contract.ticker.id

    @property
    def is_bullish(self):
        return True
