from tiger.core.leg import OptionLeg

from .base import Trade


class IronCondor(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower, target_price_upper):
        super().__init__('iron_condor', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 4

        long_call_leg = self.get_nth_option_leg('long', 'call', 0)
        short_call_leg = self.get_nth_option_leg('short', 'call', 0)
        long_put_leg = self.get_nth_option_leg('long', 'put', 0)
        short_put_leg = self.get_nth_option_leg('short', 'put', 0)
        assert long_call_leg.units == long_put_leg.units == short_call_leg.units == short_put_leg.units
        assert long_call_leg.contract.expiration == long_put_leg.contract.expiration == short_call_leg.contract.expiration == short_put_leg.contract.expiration
        assert long_call_leg.contract.strike > short_call_leg.contract.strike > self.stock.stock_price
        assert long_put_leg.contract.strike < short_put_leg.contract.strike < self.stock.stock_price
        assert self.stock.ticker.id == long_call_leg.contract.ticker.id == long_put_leg.contract.ticker.id == short_call_leg.contract.ticker.id == short_put_leg.contract.ticker.id

    @staticmethod
    def build(stock, call_contract_1, call_contract_2, put_contract_1, put_contract_2, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)
        long_call_leg = OptionLeg(True, 1, higher_strike_call, premium_type, broker_settings)
        long_put_leg = OptionLeg(True, 1, lower_strike_put, premium_type, broker_settings)
        short_call_leg = OptionLeg(False, 1, lower_strike_call, premium_type, broker_settings)
        short_put_leg = OptionLeg(False, 1, higher_strike_put, premium_type, broker_settings)
        new_trade = IronCondor(stock, [long_call_leg, long_put_leg, short_call_leg, short_put_leg], premium_type,
                               target_price_lower, target_price_upper)
        new_trade.validate()
        return new_trade

    @property
    def is_bullish(self):
        return False
