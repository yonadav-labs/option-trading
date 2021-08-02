from .base import Trade


class CashSecuredPut(Trade):
    def validate(self):
        assert self.type == 'cash_secured_put'
        assert len(self.legs) == 2

        short_put_leg = self.get_nth_option_leg('short', 'put', 0)
        cash_amount = self.cash_legs[0].total_cost
        assert cash_amount >= short_put_leg.contract.strike * 100 * short_put_leg.units
        assert self.stock.ticker.id == short_put_leg.contract.ticker.id

    @property
    def is_bullish(self):
        return True
