from .base import Trade
from tiger.core.leg import OptionLeg


class ShortStraddle(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower, target_price_upper):
        super().__init__('short_straddle', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 2

        short_call_leg = self.get_nth_option_leg('short', 'call', 0)
        short_put_leg = self.get_nth_option_leg('short', 'put', 0)
        assert short_call_leg.units == short_put_leg.units
        assert short_call_leg.contract.expiration == short_put_leg.contract.expiration
        assert short_call_leg.contract.strike == short_put_leg.contract.strike
        assert self.stock.ticker.id == short_call_leg.contract.ticker.id == short_put_leg.contract.ticker.id

    @staticmethod
    def build(stock, call_contract, put_contract, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        short_call_leg = OptionLeg(False, 1, call_contract, premium_type, broker_settings)
        short_put_leg = OptionLeg(False, 1, put_contract, premium_type, broker_settings)
        new_trade = ShortStraddle(stock, [short_call_leg, short_put_leg], premium_type,
                                  target_price_lower, target_price_upper)
        new_trade.validate()
        return new_trade

    @property
    def is_bullish(self):
        return False
