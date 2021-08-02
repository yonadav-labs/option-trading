from .base import Trade


class BullCallSpread(Trade):
    def validate(self):
        assert self.type == 'bull_call_spread'
        assert len(self.legs) == 2

        long_call_leg = self.get_nth_option_leg('long', 'call', 0)
        short_call_leg = self.get_nth_option_leg('short', 'call', 0)
        assert long_call_leg.units == short_call_leg.units
        assert long_call_leg.contract.expiration == short_call_leg.contract.expiration
        # long call strike should be less than short call
        assert long_call_leg.contract.strike < short_call_leg.contract.strike
        assert self.stock.ticker.id == long_call_leg.contract.ticker.id == short_call_leg.contract.ticker.id

    @property
    def is_bullish(self):
        return True
