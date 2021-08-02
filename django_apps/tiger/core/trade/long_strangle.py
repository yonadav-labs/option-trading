from .base import Trade


class LongStrangle(Trade):
    def validate(self):
        assert self.type == 'long_strangle'
        assert len(self.legs) == 2

        long_call_leg = self.get_nth_option_leg('long', 'call', 0)
        long_put_leg = self.get_nth_option_leg('long', 'put', 0)
        assert long_call_leg.units == long_put_leg.units
        assert long_call_leg.contract.expiration == long_put_leg.contract.expiration
        assert long_call_leg.contract.strike > long_put_leg.contract.strike
        assert self.stock.ticker.id == long_call_leg.contract.ticker.id == long_put_leg.contract.ticker.id

    @property
    def is_bullish(self):
        return False
