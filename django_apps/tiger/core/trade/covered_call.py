from .base import Trade


class CoveredCall(Trade):
    def validate(self):
        assert self.type == 'covered_call'
        assert len(self.legs) == 2

        short_call_leg = self.get_nth_option_leg('short', 'call', 0)
        stock_leg = self.stock_legs[0]
        assert stock_leg.units == 100 * short_call_leg.units
        assert self.stock.ticker.id == short_call_leg.contract.ticker.id == stock_leg.stock.ticker.id

    @property
    def is_bullish(self):
        return True
