from tiger.core.leg import OptionLeg, CashLeg
from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class CashSecuredPut(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('cash_secured_put', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 2

        short_put_leg = self.get_short_put_leg()
        long_cash_leg = self.get_long_cash_leg()

        assert short_put_leg is not None
        assert long_cash_leg is not None
        assert self.stock.ticker.id == short_put_leg.contract.ticker.id

    @staticmethod
    def build(stock, put_contract, premium_type, target_price_lower=None, target_price_upper=None, available_cash=None):
        short_put_leg = OptionLeg(False, 1, put_contract, premium_type)
        long_cash_leg = CashLeg(100 * put_contract.strike)
        new_trade = CashSecuredPut(stock, [short_put_leg, long_cash_leg], premium_type,
                                   target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @property
    def display_name(self):
        short_put_leg = self.get_short_put_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(short_put_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Cash secured put] {} {} strike ${} at ${:.2f} per position' \
            .format(self.stock.ticker.symbol, '{}X'.format(short_put_leg.units) if short_put_leg.units > 1 else '',
                    expiration_date_str, short_put_leg.contract.strike, short_put_leg.contract.strike,
                    self.cost / short_put_leg.units)

    @property
    def break_even_price(self):
        return self.get_short_put_leg().contract.strike - self.get_short_put_leg().premium_used

    @property
    def profit_cap_price(self):
        return self.get_short_put_leg().contract.strike
