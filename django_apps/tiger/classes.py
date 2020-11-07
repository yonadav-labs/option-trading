from tiger.utils import days_from_timestamp


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
        self.days_till_expiration = days_from_timestamp(self.expiration)

    # Premium has to be positive.
    @staticmethod
    def is_valid(yh_contract_dict):
        ask, bid = yh_contract_dict.get('ask'), yh_contract_dict.get('bid')
        return (ask is not None and ask > 0.0) or (bid is not None and bid > 0.0)

    # Returns None if both ask and bid are missing.
    def get_estimated_price(self):
        if self.ask is None or self.ask == 0.0:
            return self.bid
        elif self.bid is None or self.bid == 0.0:
            return self.ask
        else:
            return round((self.ask + self.bid) / 2.0, 2)

    def get_break_even_price(self):
        return round(self.get_estimated_price() + self.strike, 2)


class TargetPriceOptionContract(OptionContract):
    def __init__(self, yh_contract_dict, current_stock_price, target_stock_price, month_to_gain):
        super().__init__(yh_contract_dict, current_stock_price)

        # Non-contract data.
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


class TargetGainOptionContract(OptionContract):
    def __init__(self, yh_contract_dict, current_stock_price, target_gain):
        super().__init__(yh_contract_dict, current_stock_price)

        # Non-contract data.
        self.target_gain = target_gain
