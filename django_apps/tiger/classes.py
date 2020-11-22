import math

from tiger.utils import days_from_timestamp


class OptionContract:
    def __init__(self, yh_contract_dict, current_stock_price, use_as_premium='estimated'):
        if not self.is_valid(yh_contract_dict):
            raise ValueError('invalid yh_contract_dict')

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

        # Non-contract data.
        self.current_stock_price = current_stock_price
        self.use_as_premium = use_as_premium if use_as_premium in ('bid', 'ask', 'estimated') else 'estimated'
        self.estimated_premium = self.get_estimated_premium()  # Could be None.
        self.break_even_price = self.get_break_even_price()  # Could be None.
        # Yahoo expiration time is 2 days early.
        self.days_till_expiration = days_from_timestamp(self.expiration) + 2

    @staticmethod
    def is_valid(yh_contract_dict):
        return 'strike' in yh_contract_dict and 'expiration' in yh_contract_dict \
               and 'contractSymbol' in yh_contract_dict

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

    def get_break_even_price(self):
        if self.get_estimated_premium() is None:
            return None
        return self.get_estimated_premium() + self.strike


class BuyCall(OptionContract):
    def __init__(self, yh_contract_dict, current_stock_price, target_stock_price, month_to_gain,
                 use_as_premium='estimated'):
        super().__init__(yh_contract_dict, current_stock_price, use_as_premium)

        self.target_stock_price = target_stock_price
        self.month_to_gain = month_to_gain

        self.gain = self.get_gain()
        self.gain_after_tradeoff = self.get_gain_after_tradeoff()
        self.stock_gain = self.get_stock_gain()

    # Private methods:
    # TODO: make @property work with Serializer.
    def get_gain(self):
        if self.break_even_price is None or self.estimated_premium is None:
            return None
        return (self.target_stock_price - self.break_even_price) / self.estimated_premium

    def get_gain_after_tradeoff(self):
        if self.get_gain() is None:
            return None
        return self.get_gain() + (self.days_till_expiration / 30.0) * self.month_to_gain

    def get_stock_gain(self):
        return self.target_stock_price / self.current_stock_price - 1.0


class SellCoveredCall(OptionContract):
    def __init__(self, yh_contract_dict, current_stock_price, use_as_premium='estimated'):
        super().__init__(yh_contract_dict, current_stock_price, use_as_premium)

        self.to_strike = self.get_to_strike()
        self.to_strike_ratio = self.get_to_strike_ratio()
        self.gain_cap = self.get_gain_cap()
        self.annualized_gain_cap = self.get_annualized_gain_cap()
        self.premium_gain = self.get_premium_gain()
        self.annualized_premium_gain = self.get_annualized_premium_gain()

    def get_to_strike(self):
        """Positive when current_stock_price is below strike."""
        return self.strike - self.current_stock_price

    def get_to_strike_ratio(self):
        return self.get_to_strike() / self.current_stock_price

    def get_gain_cap(self):
        if self.estimated_premium is None:
            return None
        return (self.strike + self.estimated_premium - self.current_stock_price) / self.current_stock_price

    def get_annualized_gain_cap(self):
        if self.estimated_premium is None:
            return None
        max_total = (self.strike + self.estimated_premium) / self.current_stock_price
        return math.pow(max_total, 365 / self.days_till_expiration) - 1.0

    def get_premium_gain(self):
        if self.estimated_premium is None or self.get_gain_cap() is None:
            return None
        return min(self.estimated_premium / self.current_stock_price, self.get_gain_cap())

    def get_annualized_premium_gain(self):
        if self.get_premium_gain() is None:
            return None
        return math.pow((self.get_premium_gain() + 1.0), 365 / self.days_till_expiration) - 1.0
