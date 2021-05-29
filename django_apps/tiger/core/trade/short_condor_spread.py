from tiger.core.leg import OptionLeg

from .base import Trade


class ShortCondorSpread(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower, target_price_upper):
        super().__init__('short_condor_spread', stock, legs, premium_type, target_price_lower, target_price_upper)
        if self.legs[0].contract.is_call:
            self.left_wing_long = self.get_nth_option_leg('long', 'call', 0)
            self.left_wing_short = self.get_nth_option_leg('short', 'call', 0)
            self.right_wing_long = self.get_nth_option_leg('long', 'call', 1)
            self.right_wing_short = self.get_nth_option_leg('short', 'call', 1)
        else:
            self.left_wing_long = self.get_nth_option_leg('long', 'put', 0)
            self.left_wing_short = self.get_nth_option_leg('short', 'put', 0)
            self.right_wing_long = self.get_nth_option_leg('long', 'put', 1)
            self.right_wing_short = self.get_nth_option_leg('short', 'put', 1)
        self.validate()

    def validate(self):
        assert len(self.legs) == 4
        assert self.left_wing_long.units == self.right_wing_long.units == self.left_wing_short.units == self.right_wing_short.units
        assert self.left_wing_long.contract.expiration == self.right_wing_long.contract.expiration == self.left_wing_short.contract.expiration == self.right_wing_short.contract.expiration
        assert self.right_wing_short.contract.strike > self.right_wing_long.contract.strike > self.stock.stock_price
        assert self.left_wing_short.contract.strike < self.left_wing_long.contract.strike < self.stock.stock_price
        assert self.stock.ticker.id == self.left_wing_long.contract.ticker.id == self.right_wing_long.contract.ticker.id == self.left_wing_short.contract.ticker.id == self.right_wing_short.contract.ticker.id

    @staticmethod
    def build(stock, left_wing_contract_1, left_wing_contract_2, right_wing_contract_1, right_wing_contract_2,
              premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        lower_strike_left, higher_strike_left = (left_wing_contract_1, left_wing_contract_2) \
            if left_wing_contract_1.strike < left_wing_contract_2.strike else (
            left_wing_contract_2, left_wing_contract_1)
        lower_strike_right, higher_strike_right = (right_wing_contract_1, right_wing_contract_2) \
            if right_wing_contract_1.strike < right_wing_contract_2.strike else (
            right_wing_contract_2, right_wing_contract_1)
        left_wing_short = OptionLeg(True, 1, lower_strike_left, premium_type, broker_settings)
        right_wing_short = OptionLeg(True, 1, higher_strike_right, premium_type, broker_settings)
        left_wing_long = OptionLeg(False, 1, higher_strike_left, premium_type, broker_settings)
        right_wing_long = OptionLeg(False, 1, lower_strike_right, premium_type, broker_settings)
        new_trade = ShortCondorSpread(stock, [left_wing_long, right_wing_long, left_wing_short, right_wing_short],
                                      premium_type,
                                      target_price_lower, target_price_upper)
        return new_trade

    @property
    def is_bullish(self):
        return False
