from tiger.core.leg import OptionLeg, CashLeg

from .base import Trade


class BullPutSpread(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('bull_put_spread', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 3

        long_put_leg = self.get_nth_option_leg('long', 'put', 0)
        short_put_leg = self.get_nth_option_leg('short', 'put', 0)
        assert long_put_leg.units == short_put_leg.units
        assert long_put_leg.contract.expiration == short_put_leg.contract.expiration
        # long put strike should be less than short put
        assert long_put_leg.contract.strike < short_put_leg.contract.strike
        assert self.stock.ticker.id == long_put_leg.contract.ticker.id == short_put_leg.contract.ticker.id

    @staticmethod
    def build(stock, put_contract_1, put_contract_2, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)
        long_put_leg = OptionLeg(True, 1, lower_strike_put, premium_type, broker_settings)
        short_put_leg = OptionLeg(False, 1, higher_strike_put, premium_type, broker_settings)
        cash_leg = CashLeg((higher_strike_put.strike - lower_strike_put.strike) * 100)
        new_trade = BullPutSpread(stock, [long_put_leg, short_put_leg, cash_leg], premium_type,
                                  target_price_lower, target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        new_trade.validate()
        return new_trade

    @property
    def is_bullish(self):
        return True
