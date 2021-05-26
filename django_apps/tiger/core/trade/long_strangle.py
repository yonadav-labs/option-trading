from .base import Trade
from tiger.core.leg import OptionLeg


class LongStrangle(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower, target_price_upper):
        super().__init__('long_strangle', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 2

        long_call_leg = self.get_nth_option_leg('long', 'call', 0)
        long_put_leg = self.get_nth_option_leg('long', 'put', 0)
        assert long_call_leg.units == long_put_leg.units
        assert long_call_leg.contract.expiration == long_put_leg.contract.expiration
        assert long_call_leg.contract.strike > long_put_leg.contract.strike
        assert self.stock.ticker.id == long_call_leg.contract.ticker.id == long_put_leg.contract.ticker.id

    @staticmethod
    def build(stock, call_contract, put_contract, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_call_leg = OptionLeg(True, 1, call_contract, premium_type, broker_settings)
        long_put_leg = OptionLeg(True, 1, put_contract, premium_type, broker_settings)
        new_trade = LongStrangle(stock, [long_call_leg, long_put_leg], premium_type,
                                 target_price_lower, target_price_upper)
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        new_trade.validate()
        return new_trade

    @property
    def is_bullish(self):
        return False
