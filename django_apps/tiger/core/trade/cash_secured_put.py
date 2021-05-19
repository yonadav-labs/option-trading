from tiger.core.leg import OptionLeg, CashLeg
from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class CashSecuredPut(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('cash_secured_put', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 2

        short_put_leg = self.get_short_put_leg()
        long_cash_leg = self.get_long_cash_leg()

        assert short_put_leg is not None
        assert long_cash_leg is not None
        assert self.stock.ticker.id == short_put_leg.contract.ticker.id

    @staticmethod
    def build(stock, put_contract, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        short_put_leg = OptionLeg(False, 1, put_contract, premium_type, broker_settings)
        long_cash_leg = CashLeg(100 * put_contract.strike)
        new_trade = CashSecuredPut(stock, [short_put_leg, long_cash_leg], premium_type,
                                   target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @property
    def is_bullish(self):
        return True
