from tiger.core.leg import OptionLeg
from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class LongPut(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('long_put', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 1

        long_put_leg = self.get_long_put_leg()

        assert long_put_leg is not None
        assert self.stock.ticker.id == long_put_leg.contract.ticker.id

    @staticmethod
    def build(stock, put_contract, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_put_leg = OptionLeg(True, 1, put_contract, premium_type, broker_settings)
        new_trade = LongPut(stock, [long_put_leg], premium_type,
                            target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @property
    def is_bullish(self):
        return False
