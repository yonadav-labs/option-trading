from tiger.core.leg import OptionLeg, StockLeg
from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class CoveredCall(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('covered_call', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 2

        short_call_leg = self.get_short_call_leg()
        long_stock_leg = self.get_long_stock_leg()

        assert short_call_leg is not None
        assert long_stock_leg is not None

        assert self.stock.ticker.id == long_stock_leg.stock.ticker.id == short_call_leg.contract.ticker.id

    @staticmethod
    def build(stock, call_contract, premium_type, broker_settings, target_price_lower=None, target_price_upper=None,
              available_cash=None):
        long_stock_leg = StockLeg(100, stock)
        short_call_leg = OptionLeg(False, 1, call_contract, premium_type, broker_settings)
        new_trade = CoveredCall(stock, [short_call_leg, long_stock_leg], premium_type,
                                target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @property
    def display_name(self):
        short_call_leg = self.get_short_call_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(short_call_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Covered call] {} {} strike ${} at ${:.2f} per position' \
            .format(self.stock.ticker.symbol, '{}X'.format(short_call_leg.units) if short_call_leg.units > 1 else '',
                    expiration_date_str, short_call_leg.contract.strike, self.cost / short_call_leg.units)

    @property
    def break_even_price(self):
        return self.stock.stock_price - self.get_short_call_leg().premium_used

    @property
    def profit_cap_price(self):
        return self.get_short_call_leg().contract.strike

    @property
    def is_bullish(self):
        return True
