from .base import Trade


class LongCall(Trade):
    def validate(self):
        assert self.type == 'long_call'
        assert len(self.legs) == 1

        leg = self.get_nth_option_leg('long', 'call', 0)
        assert self.stock.ticker.id == leg.contract.ticker.id

    @property
    def is_bullish(self):
        return True
