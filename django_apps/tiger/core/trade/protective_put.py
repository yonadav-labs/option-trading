from tiger.core.leg import OptionLeg, StockLeg

from .base import Trade


class ProtectivePut(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('protective_put', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 2

        long_put_leg = self.get_nth_option_leg('long', 'put', 0)
        stock_leg = self.stock_legs[0]
        assert stock_leg.units == 100 * long_put_leg.units
        assert self.stock.ticker.id == long_put_leg.contract.ticker.id == stock_leg.stock.ticker.id

    @staticmethod
    def build(stock, put_contract, premium_type, broker_settings, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_stock_leg = StockLeg(100, stock)
        long_put_leg = OptionLeg(True, 1, put_contract, premium_type, broker_settings)
        new_trade = ProtectivePut(stock, [long_put_leg, long_stock_leg],
                                  premium_type, target_price_lower, target_price_upper)
        if new_trade.cost <= 0.0 or available_cash and not new_trade.max_out(available_cash):
            return None
        new_trade.validate()
        return new_trade

    @property
    def is_bullish(self):
        return True
