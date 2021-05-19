from tiger.core.leg import OptionLeg
from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class LongCall(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('long_call', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 1

        long_call_leg = self.get_long_call_leg()

        assert long_call_leg is not None
        assert self.stock.ticker.id == long_call_leg.contract.ticker.id

    @staticmethod
    def build(stock, call_contract, premium_type, broker_settings, target_price_lower=None, target_price_upper=None,
              available_cash=None):
        long_call_leg = OptionLeg(True, 1, call_contract, premium_type, broker_settings)
        new_trade = LongCall(stock, [long_call_leg], premium_type,
                             target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @property
    def is_bullish(self):
        return True
