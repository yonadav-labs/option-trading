from tiger.core.leg import OptionLeg

from .base import Trade


class ShortPut(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('short_put', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 1

        leg = self.get_nth_option_leg('short', 'put', 0)
        assert self.stock.ticker.id == leg.contract.ticker.id

    @staticmethod
    def build(stock, put_contract, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        short_put_leg = OptionLeg(False, 1, put_contract, premium_type, broker_settings)
        new_trade = ShortPut(stock, [short_put_leg], premium_type, target_price_lower, target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        new_trade.validate()
        return new_trade

    @property
    def is_bullish(self):
        return True
