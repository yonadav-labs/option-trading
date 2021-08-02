from .base import Trade


class ShortStrangle(Trade):
    def validate(self):
        assert self.type == 'short_strangle'
        assert len(self.legs) == 2

        short_call_leg = self.get_nth_option_leg('short', 'call', 0)
        short_put_leg = self.get_nth_option_leg('short', 'put', 0)
        assert short_call_leg.units == short_put_leg.units
        assert short_call_leg.contract.expiration == short_put_leg.contract.expiration
        assert short_call_leg.contract.strike > short_put_leg.contract.strike
        assert self.stock.ticker.id == short_call_leg.contract.ticker.id == short_put_leg.contract.ticker.id

    @property
    def is_bullish(self):
        return False
