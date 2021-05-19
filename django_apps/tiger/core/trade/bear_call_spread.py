from tiger.core.leg import OptionLeg, CashLeg
from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class BearCallSpread(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('bear_call_spread', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 3

        long_call_leg = self.get_long_call_leg()
        short_call_leg = self.get_short_call_leg()
        long_cash_leg = self.get_long_cash_leg()

        assert long_call_leg is not None
        assert short_call_leg is not None
        assert long_cash_leg is not None
        assert long_call_leg.contract.expiration == short_call_leg.contract.expiration
        assert long_call_leg.contract.strike > short_call_leg.contract.strike
        assert self.stock.ticker.id == long_call_leg.contract.ticker.id == short_call_leg.contract.ticker.id

    @staticmethod
    def build(stock, call_contract_1, call_contract_2, premium_type, broker_settings, target_price_lower=None,
              target_price_upper=None,
              available_cash=None):
        if call_contract_1.strike == call_contract_2.strike or call_contract_1.expiration != call_contract_2.expiration:
            return None
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)

        long_call_leg = OptionLeg(True, 1, higher_strike_call, premium_type, broker_settings)
        short_call_leg = OptionLeg(False, 1, lower_strike_call, premium_type, broker_settings)
        cash_leg = CashLeg((higher_strike_call.strike - lower_strike_call.strike) * 100)
        new_trade = BearCallSpread(stock, [long_call_leg, short_call_leg, cash_leg], premium_type,
                                   target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @property
    def is_bullish(self):
        return False
