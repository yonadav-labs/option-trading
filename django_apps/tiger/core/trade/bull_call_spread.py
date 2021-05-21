from tiger.core.leg import OptionLeg

from .base import Trade


class BullCallSpread(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('bull_call_spread', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 2

        long_call_leg = self.get_nth_option_leg('long', 'call', 0)
        short_call_leg = self.get_nth_option_leg('short', 'call', 0)
        assert long_call_leg.units == short_call_leg.units
        assert long_call_leg.contract.expiration == short_call_leg.contract.expiration
        # long call strike should be less than short call
        assert long_call_leg.contract.strike < short_call_leg.contract.strike
        assert self.stock.ticker.id == long_call_leg.contract.ticker.id == short_call_leg.contract.ticker.id

    @staticmethod
    def build(stock, call_contract_1, call_contract_2, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)
        long_call_leg = OptionLeg(True, 1, lower_strike_call, premium_type, broker_settings)
        short_call_leg = OptionLeg(False, 1, higher_strike_call, premium_type, broker_settings)
        new_trade = BullCallSpread(stock, [long_call_leg, short_call_leg],
                                   premium_type, target_price_lower, target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        new_trade.validate()
        return new_trade

    @property
    def is_bullish(self):
        return True
