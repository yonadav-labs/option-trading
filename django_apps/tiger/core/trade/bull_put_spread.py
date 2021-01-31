from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class BullPutSpread(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        assert len(legs) == 3
        super().__init__('bull_put_spread', stock, legs, target_price_lower, target_price_upper)

    @property
    def display_name(self):
        long_put_leg = self.get_long_put_leg()
        short_put_leg = self.get_short_put_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_put_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Bull put spread] {} {} strike ${} / ${} at ${:.2f} net credit' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_put_leg.units) if long_put_leg.units > 1 else '',
                    expiration_date_str, long_put_leg.contract.strike, short_put_leg.contract.strike,
                    short_put_leg.contract.premium - long_put_leg.contract.premium)

    @property
    def break_even_price(self):
        return self.get_short_put_leg().contract.strike \
               - (self.get_short_put_leg().contract.premium - self.get_long_put_leg().contract.premium)

    @property
    def profit_cap_price(self):
        return self.get_short_put_leg().contract.strike