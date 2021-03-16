from tiger.core.leg import OptionLeg
from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class LongPut(Trade):
    def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
        super().__init__('long_put', stock, legs, premium_type, target_price_lower, target_price_upper)

    def validate(self):
        assert len(self.legs) == 1

        long_put_leg = self.get_long_put_leg()

        assert long_put_leg is not None
        assert self.stock.ticker.id == long_put_leg.contract.ticker.id

    @staticmethod
    def build(stock, put_contract, premium_type, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_put_leg = OptionLeg(True, 1, put_contract, premium_type)
        new_trade = LongPut(stock, [long_put_leg], premium_type, target_price_lower=target_price_lower,
                            target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @property
    def display_name(self):
        long_put_leg = self.get_long_put_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_put_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Long put] {} {} strike ${} at ${:.2f} per contract' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_put_leg.units) if long_put_leg.units > 1 else '',
                    expiration_date_str, long_put_leg.contract.strike, long_put_leg.cost)

    @property
    def break_even_price(self):
        return self.get_long_put_leg().contract.strike - self.get_long_put_leg().premium_used

    @property
    def profit_cap_price(self):
        return 0.0
