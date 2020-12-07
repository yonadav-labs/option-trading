import math

from tiger.utils import days_from_timestamp


class OptionContract:
    def __init__(self, is_call, yh_contract_dict, current_stock_price, use_as_premium='estimated'):
        if not self.is_valid(yh_contract_dict):
            raise ValueError('invalid yh_contract_dict')

        self.is_call = is_call  # There are only 2 types of options: "call" and "put".
        self.ask = yh_contract_dict.get('ask')  # Could be None.
        self.bid = yh_contract_dict.get('bid')  # Could be None.
        self.contract_symbol = yh_contract_dict.get('contractSymbol')
        self.expiration = yh_contract_dict.get('expiration')
        self.strike = yh_contract_dict.get('strike')

        self.change = yh_contract_dict.get('change')
        self.contract_size = yh_contract_dict.get('contractSize')
        self.currency = yh_contract_dict.get('currency')
        self.implied_volatility = yh_contract_dict.get('impliedVolatility')
        self.in_the_money = yh_contract_dict.get('inTheMoney')
        self.last_price = yh_contract_dict.get('lastPrice')
        self.last_trade_date = yh_contract_dict.get('lastTradeDate')
        self.open_interest = yh_contract_dict.get('openInterest')
        self.percent_change = yh_contract_dict.get('percentChange')
        self.volume = yh_contract_dict.get('volume')  # Could be None.

        # Yahoo expiration time is 2 days early.
        self.days_till_expiration = days_from_timestamp(self.expiration) + 2

        # Non-contract data.
        self.current_stock_price = current_stock_price
        self.use_as_premium = use_as_premium if use_as_premium in ('bid', 'ask', 'estimated') else 'estimated'
        self.estimated_premium = self.get_estimated_premium()  # Could be None.
        self.break_even_price = self.get_break_even_price()  # Could be None.
        self.to_break_even_ratio = self.get_to_break_even_ratio()  # Could be None.
        self.to_break_even_ratio_annualized = self.get_to_break_even_ratio_annualized()  # Could be None.
        self.to_strike = self.get_to_strike()
        self.to_strike_ratio = self.get_to_strike_ratio()
        self.to_strike_ratio_annualized = self.get_to_strike_ratio_annualized()

    @staticmethod
    def is_valid(yh_contract_dict):
        return 'strike' in yh_contract_dict and 'expiration' in yh_contract_dict \
               and 'contractSymbol' in yh_contract_dict

    # Expect input ratio to be already -1.0.
    def get_daily_ratio(self, ratio):
        if ratio is None:
            return None
        return math.pow(ratio + 1.0, 1.0 / self.days_till_expiration) - 1.0

    # Expect input ratio to be already -1.0.
    def get_annualized_ratio(self, ratio):
        if ratio is None:
            return None
        # gain_annualized would overflow if too large
        if self.get_daily_ratio(ratio) > 0.1:
            return None
        return math.pow(ratio + 1.0, 365.0 / self.days_till_expiration) - 1.0

    # Returns None if both ask and bid are missing.
    def get_estimated_premium(self):
        if self.use_as_premium == 'estimated':
            if not self.ask and not self.bid and not self.last_price:
                return None
            if not self.ask and not self.bid:
                return self.last_price
            elif not self.ask:
                return self.bid
            elif not self.bid:
                return self.ask
            else:
                return (self.ask + self.bid) / 2.0
        elif self.use_as_premium == 'bid':
            return self.bid if self.bid else None
        elif self.use_as_premium == 'ask':
            return self.ask if self.ask else None
        else:
            return None

    # To be implemented in subclasses.
    def get_break_even_price(self):
        return None

    def get_to_break_even_ratio(self):
        if self.get_break_even_price() is None:
            return None
        return (self.get_break_even_price() - self.current_stock_price) / self.current_stock_price

    def get_to_break_even_ratio_annualized(self):
        if self.get_break_even_price() is None:
            return None
        return math.pow(self.get_break_even_price() / self.current_stock_price,
                        365.0 / self.days_till_expiration) - 1.0

    def get_to_strike(self):
        """Positive when current_stock_price is below strike."""
        return self.strike - self.current_stock_price

    def get_to_strike_ratio(self):
        return self.get_to_strike() / self.current_stock_price

    def get_to_strike_ratio_annualized(self):
        return self.get_annualized_ratio(self.get_to_strike_ratio())


class CallContract(OptionContract):
    def __init__(self, yh_contract_dict, current_stock_price, use_as_premium='estimated'):
        super().__init__(True, yh_contract_dict, current_stock_price, use_as_premium)

    def get_break_even_price(self):
        if self.get_estimated_premium() is None:
            return None
        return self.get_estimated_premium() + self.strike


class PutContract(OptionContract):
    def __init__(self, yh_contract_dict, current_stock_price, use_as_premium='estimated'):
        super().__init__(False, yh_contract_dict, current_stock_price, use_as_premium)

    def get_break_even_price(self):
        if self.get_estimated_premium() is None:
            return None
        return self.strike - self.get_estimated_premium()


# TODO: refactor into Trades classes.
class BuyCall(CallContract):
    def __init__(self, yh_contract_dict, current_stock_price, target_stock_price, month_to_gain,
                 use_as_premium='estimated'):
        super().__init__(yh_contract_dict, current_stock_price, use_as_premium)

        self.target_stock_price = target_stock_price
        self.month_to_gain = month_to_gain

        self.gain = self.get_gain()
        self.gain_annualized = self.get_gain_annualized()
        self.gain_daily = self.get_gain_daily()
        self.gain_after_tradeoff = self.get_gain_after_tradeoff()
        self.to_target_price_ratio = self.get_to_target_price_ratio()
        self.to_target_price_ratio_annualized = self.get_to_target_price_ratio_annualized()

    # Private methods:
    # TODO: make @property work with Serializer.
    def get_gain(self):
        if self.break_even_price is None or self.estimated_premium is None:
            return None
        return max(-1.0, (self.target_stock_price - self.break_even_price) / self.estimated_premium)

    def get_gain_daily(self):
        return self.get_daily_ratio(self.get_gain())

    def get_gain_annualized(self):
        return self.get_annualized_ratio(self.get_gain())

    # Not used.
    def get_gain_after_tradeoff(self):
        if self.get_gain() is None:
            return None
        return self.get_gain() + (self.days_till_expiration / 30.0) * self.month_to_gain

    def get_to_target_price_ratio(self):
        return self.target_stock_price / self.current_stock_price - 1.0

    def get_to_target_price_ratio_annualized(self):
        return self.get_annualized_ratio(self.get_to_target_price_ratio())


# TODO: refactor into Trades classes.
class SellCoveredCall(CallContract):
    def __init__(self, yh_contract_dict, current_stock_price, use_as_premium='estimated'):
        super().__init__(yh_contract_dict, current_stock_price, use_as_premium)

        self.gain_cap = self.get_gain_cap()
        self.gain_cap_annualized = self.get_gain_cap_annualized()
        self.premium_gain = self.get_premium_gain()
        self.premium_gain_annualized = self.get_premium_gain_annualized()

    def get_gain_cap(self):
        if self.estimated_premium is None:
            return None
        return (self.strike + self.estimated_premium - self.current_stock_price) / self.current_stock_price

    def get_gain_cap_annualized(self):
        return self.get_annualized_ratio(self.get_gain_cap())

    def get_premium_gain(self):
        if self.estimated_premium is None or self.get_gain_cap() is None:
            return None
        return min(self.estimated_premium / self.current_stock_price, self.get_gain_cap())

    def get_premium_gain_annualized(self):
        return self.get_annualized_ratio(self.get_premium_gain())


# TODO: refactor into Trades classes.
class SellCashSecuredPut(PutContract):
    def __init__(self, yh_contract_dict, current_stock_price, use_as_premium='estimated'):
        super().__init__(yh_contract_dict, current_stock_price, use_as_premium)

        self.premium_gain = self.get_premium_gain()
        self.premium_gain_annualized = self.get_premium_gain_annualized()

    def get_premium_gain(self):
        if self.estimated_premium is None:
            return None
        return self.estimated_premium / self.current_stock_price

    def get_premium_gain_annualized(self):
        return self.get_annualized_ratio(self.get_premium_gain())
