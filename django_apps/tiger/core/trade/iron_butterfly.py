from .base import Trade


class IronButterfly(Trade):
    def validate(self):
        assert self.type == 'iron_butterfly'
        assert len(self.legs) == 4

        long_call_leg = self.get_nth_option_leg('long', 'call', 0)
        short_call_leg = self.get_nth_option_leg('short', 'call', 0)
        long_put_leg = self.get_nth_option_leg('long', 'put', 0)
        short_put_leg = self.get_nth_option_leg('short', 'put', 0)
        assert long_call_leg.units == long_put_leg.units == short_call_leg.units == short_put_leg.units
        assert long_call_leg.contract.expiration == long_put_leg.contract.expiration == short_call_leg.contract.expiration == short_put_leg.contract.expiration
        assert short_call_leg.contract.strike == short_put_leg.contract.strike
        assert long_call_leg.contract.strike > short_call_leg.contract.strike
        assert long_put_leg.contract.strike < short_put_leg.contract.strike
        assert self.stock.ticker.id == long_call_leg.contract.ticker.id == long_put_leg.contract.ticker.id == short_call_leg.contract.ticker.id == short_put_leg.contract.ticker.id

    @property
    def is_bullish(self):
        return False
