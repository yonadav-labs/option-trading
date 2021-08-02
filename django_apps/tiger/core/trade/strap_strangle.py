from .base import Trade


class StrapStrangle(Trade):
    def validate(self):
        long_call_leg = self.get_nth_option_leg('long', 'call', 0)
        long_put_leg = self.get_nth_option_leg('long', 'put', 0)

        assert self.type == 'strap_strangle'
        assert len(self.legs) == 2
        assert long_call_leg.units > long_put_leg.units
        assert long_call_leg.contract.expiration == long_put_leg.contract.expiration
        assert long_call_leg.contract.strike > long_put_leg.contract.strike
        assert self.stock.ticker.id == long_call_leg.contract.ticker.id == long_put_leg.contract.ticker.id

    @property
    def is_bullish(self):
        return True

    @property
    def net_debit_per_unit(self):
        '''Nagtive number means net credit.'''
        long_call_leg = self.get_nth_option_leg('long', 'call', 0)
        long_put_leg = self.get_nth_option_leg('long', 'put', 0)

        net_debit = 0.0
        if long_call_leg and long_put_leg:
            net_debit += long_call_leg.net_cost / long_call_leg.units * \
                         (long_call_leg.units // long_put_leg.units)
            net_debit += long_put_leg.net_cost / long_put_leg.units
        return net_debit
