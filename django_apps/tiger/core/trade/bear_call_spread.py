from tiger.core.leg import OptionLeg, CashLeg
from tiger.utils import timestamp_to_datetime_with_default_tz

from .base import Trade


class BearCallSpread(Trade):
    def __init__(self, stock, legs, target_price_lower=None, target_price_upper=None):
        # TODO: add validation.
        assert len(legs) == 3
        super().__init__('bear_call_spread', stock, legs, target_price_lower, target_price_upper)

    @staticmethod
    def build(stock, call_contract_1, call_contract_2, target_price_lower=None, target_price_upper=None,
              available_cash=None):
        if call_contract_1.strike == call_contract_2.strike or call_contract_1.expiration != call_contract_2.expiration:
            return None
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)

        long_call_leg = OptionLeg(True, 1, higher_strike_call)
        short_call_leg = OptionLeg(False, 1, lower_strike_call)
        cash_leg = CashLeg((higher_strike_call.strike - lower_strike_call.strike) * 100)
        new_trade = BearCallSpread(stock, [long_call_leg, short_call_leg, cash_leg],
                                   target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @property
    def display_name(self):
        long_call_leg = self.get_long_call_leg()
        short_call_leg = self.get_short_call_leg()
        expiration_date_str = timestamp_to_datetime_with_default_tz(long_call_leg.contract.expiration) \
            .strftime("%m/%d/%Y")
        return '[{}][Bear call spread] {} {} strike ${} / ${} at ${:.2f} net credit per spread' \
            .format(self.stock.ticker.symbol, '{}X'.format(long_call_leg.units) if long_call_leg.units > 1 else '',
                    expiration_date_str, long_call_leg.contract.strike, short_call_leg.contract.strike,
                    abs(short_call_leg.cost + long_call_leg.cost))

    @property
    def break_even_price(self):
        return self.get_short_call_leg().contract.strike \
               + (self.get_short_call_leg().contract.premium - self.get_long_call_leg().contract.premium)

    @property
    def profit_cap_price(self):
        return self.get_short_call_leg().contract.strike
