from tiger.core.leg import OptionLeg
from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class BearPutSpread(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        assert len(legs) == 2
        super().__init__('bear_put_spread', stock, legs, target_price_lower, target_price_upper)

    @staticmethod
    def build(stock, put_contract_1, put_contract_2, target_price_lower=None, target_price_upper=None,
              available_cash=None):
        if put_contract_1.strike == put_contract_2.strike or put_contract_1.expiration != put_contract_2.expiration:
            return None
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)

        long_put_leg = OptionLeg(True, 1, higher_strike_put)
        short_put_leg = OptionLeg(False, 1, lower_strike_put)
        new_trade = BearPutSpread(stock, [long_put_leg, short_put_leg],
                                  target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @property
    def display_name(self):
        long_put_leg = self.get_long_put_leg()
        short_put_leg = self.get_short_put_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_put_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Bear put spread] {} {} strike ${} / ${} at ${:.2f} net debit' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_put_leg.units) if long_put_leg.units > 1 else '',
                    expiration_date_str, short_put_leg.contract.strike, long_put_leg.contract.strike,
                    long_put_leg.contract.premium - short_put_leg.contract.premium)

    @property
    def break_even_price(self):
        return self.get_long_put_leg().contract.strike \
               - (self.get_long_put_leg().contract.premium - self.get_short_put_leg().contract.premium)

    @property
    def profit_cap_price(self):
        return self.get_short_put_leg().contract.strike
