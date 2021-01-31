from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class LongPut(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        super().__init__('long_put', stock, legs, target_price_lower, target_price_upper)

    @property
    def display_name(self):
        long_put_leg = self.get_long_put_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_put_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Long put] {} {} strike ${} at ${:.2f} per contract' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_put_leg.units) if long_put_leg.units > 1 else '',
                    expiration_date_str, long_put_leg.contract.strike, long_put_leg.contract.cost)

    @property
    def break_even_price(self):
        return self.get_long_put_leg().contract.strike - self.get_long_put_leg().contract.premium

    @property
    def profit_cap_price(self):
        return 0.0