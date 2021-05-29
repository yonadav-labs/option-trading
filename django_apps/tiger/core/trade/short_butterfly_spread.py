from tiger.core.leg import OptionLeg

from .base import Trade


class ShortButterflySpread(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower, target_price_upper):
        super().__init__('short_butterfly_spread', stock, legs, premium_type, target_price_lower, target_price_upper)
        if self.legs[0].contract.is_call:
            self.short_leg_lower = self.get_nth_option_leg('short', 'call', 0)
            self.short_leg_upper = self.get_nth_option_leg('short', 'call', 1)
            self.long_leg = self.get_nth_option_leg('long', 'call', 0)
        else:
            self.short_leg_lower = self.get_nth_option_leg('short', 'put', 0)
            self.short_leg_upper = self.get_nth_option_leg('short', 'put', 1)
            self.long_leg = self.get_nth_option_leg('long', 'put', 0)
        self.validate()

    def validate(self):
        assert len(self.legs) == 3
        assert self.short_leg_lower.units == self.short_leg_upper.units
        assert self.long_leg.units == self.short_leg_upper.units * 2
        assert self.short_leg_lower.contract.expiration == self.short_leg_upper.contract.expiration == self.long_leg.contract.expiration
        assert self.short_leg_lower.contract.strike < self.long_leg.contract.strike < self.short_leg_upper.contract.strike
        assert self.stock.ticker.id == self.short_leg_lower.contract.ticker.id == self.short_leg_upper.contract.ticker.id == self.long_leg.contract.ticker.id

    @staticmethod
    def build(stock, long_contract_1, long_contract_2, short_contract, premium_type, broker_settings,
              target_price_lower=None, target_price_upper=None, available_cash=None):
        lower_strike_contract, higher_strike_contract = (long_contract_1, long_contract_2) \
            if long_contract_1.strike < long_contract_2.strike else (long_contract_2, long_contract_1)

        short_leg_upper = OptionLeg(False, 1, higher_strike_contract, premium_type, broker_settings)
        short_leg_lower = OptionLeg(False, 1, lower_strike_contract, premium_type, broker_settings)
        long_leg = OptionLeg(True, 2, short_contract, premium_type, broker_settings)
        new_trade = ShortButterflySpread(stock, [short_leg_lower, short_leg_upper, long_leg],
                                         premium_type, target_price_lower, target_price_upper)
        return new_trade

    @property
    def is_bullish(self):
        return False

    @property
    def net_debit_per_unit(self):
        '''Nagtive number means net credit.'''
        net_debit = 0.0
        if self.short_leg_lower is not None and self.short_leg_upper is not None and self.long_leg is not None:
            net_debit += self.short_leg_lower.net_cost / self.short_leg_lower.units
            net_debit += self.short_leg_upper.net_cost / self.short_leg_upper.units
            net_debit += self.long_leg.net_cost / self.long_leg.units * 2
        return net_debit
