import math

from tiger.utils import days_from_timestamp, timedelta_from_timestamp

LAST_PRICE_VALID_SECONDS = -3 * 24 * 3600  # 3 days.


class OptionContract:
    def __init__(self, yh_contract_dict, current_stock_price):
        if not self.is_valid(yh_contract_dict):
            raise ValueError('invalid bid and ask')

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
        self.estimated_price = self.get_estimated_price()
        self.break_even_price = self.get_break_even_price()
        # Yahoo expiration time is 2 days early.
        self.days_till_expiration = days_from_timestamp(self.expiration) + 2

    # Premium has to be positive.
    @staticmethod
    def is_valid(yh_contract_dict):
        ask, bid = yh_contract_dict.get('ask'), yh_contract_dict.get('bid')
        last_price = yh_contract_dict.get('lastPrice') if timedelta_from_timestamp(yh_contract_dict.get(
            'lastTradeDate')).total_seconds() > LAST_PRICE_VALID_SECONDS else None
        return (ask is not None and ask > 0.0) or (bid is not None and bid > 0.0) or (
                last_price is not None and last_price > 0.0)

    # Returns None if both ask and bid are missing.
    def get_estimated_price(self):
        if not self.ask and not self.bid:
            return self.last_price
        elif not self.ask:
            return self.bid
        elif not self.bid:
            return self.ask
        else:
            return (self.ask + self.bid) / 2.0

    def get_break_even_price(self):
        return round(self.get_estimated_price() + self.strike, 2)


class BuyCall(OptionContract):
    def __init__(self, yh_contract_dict, current_stock_price, target_stock_price, month_to_gain):
        super().__init__(yh_contract_dict, current_stock_price)

        self.target_stock_price = target_stock_price
        self.month_to_gain = month_to_gain

        self.gain = self.__get_gain()
        self.gain_after_tradeoff = self.__get_gain_after_tradeoff()
        self.stock_gain = self.__get_stock_gain()
        self.normalized_score = 100.0

    # Private methods:
    # TODO: make @property work with Serializer.
    def __get_gain(self):
        return round((self.target_stock_price - self.break_even_price) / self.estimated_price, 4)

    def __get_gain_after_tradeoff(self):
        return round(self.gain + (self.days_till_expiration / 30.0) * self.month_to_gain, 4)

    def __get_stock_gain(self):
        return round(self.target_stock_price / self.current_stock_price - 1.0, 4)

    # Public methods:
    def save_normalized_score(self, max_gain_after_tradeoff):
        self.normalized_score = round(self.gain_after_tradeoff / max_gain_after_tradeoff * 100.0, 2)


class SellCoveredCall(OptionContract):
    def __init__(self, yh_contract_dict, current_stock_price):
        super().__init__(yh_contract_dict, current_stock_price)

        self.strike_diff_ratio = self.get_strike_diff_ratio()
        self.gain_cap = self.get_gain_cap()
        self.annualized_gain_cap = self.get_annualized_gain_cap()
        self.loss_buffer = self.get_loss_buffer()

    def get_strike_diff_ratio(self):
        """Positive when current_stock_price is below strike."""
        return (self.strike - self.current_stock_price) / self.current_stock_price

    def get_gain_cap(self):
        return (self.strike + self.estimated_price - self.current_stock_price) / self.current_stock_price

    def get_annualized_gain_cap(self):
        max_total = (self.strike + self.estimated_price) / self.current_stock_price
        return math.pow(max_total, 365 / self.days_till_expiration) - 1.0

    def get_loss_buffer(self):
        return self.estimated_price / self.current_stock_price
