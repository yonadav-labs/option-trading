from .base import Trade


class ProtectivePut(Trade):
    def validate(self):
        assert self.type == 'protective_put'
        assert len(self.legs) == 2

        long_put_leg = self.get_nth_option_leg('long', 'put', 0)
        stock_leg = self.stock_legs[0]
        assert stock_leg.units == 100 * long_put_leg.units
        assert self.stock.ticker.id == long_put_leg.contract.ticker.id == stock_leg.stock.ticker.id

    @property
    def is_bullish(self):
        return True
