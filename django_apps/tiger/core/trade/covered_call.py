from tiger.core.leg import OptionLeg, StockLeg

from .base import Trade


class CoveredCall(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('covered_call', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 2

        short_call_leg = self.get_nth_option_leg('short', 'call', 0)
        stock_leg = self.stock_legs[0]
        assert stock_leg.units == 100 * short_call_leg.units
        assert self.stock.ticker.id == short_call_leg.contract.ticker.id == stock_leg.stock.ticker.id

    @staticmethod
    def build(stock, call_contract, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_stock_leg = StockLeg(100, stock)
        short_call_leg = OptionLeg(False, 1, call_contract, premium_type, broker_settings)
        new_trade = CoveredCall(stock, [short_call_leg, long_stock_leg],
                                premium_type, target_price_lower, target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        new_trade.validate()
        return new_trade

    @property
    def is_bullish(self):
        return True
