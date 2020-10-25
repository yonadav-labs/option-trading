from datetime import datetime


class OptionContract:
    def __init__(self, yh_contract_dict):
        self.ask = yh_contract_dict.get('ask')
        self.bid = yh_contract_dict.get('bid')
        self.contract_symbol = yh_contract_dict.get('contractSymbol')
        self.expiration = datetime.fromtimestamp(yh_contract_dict.get('expiration'))  # TODO: check timezone.
        self.strike = yh_contract_dict.get('strike')

        self.change = yh_contract_dict.get('change')
        self.contract_size = yh_contract_dict.get('contractSize')
        self.currency = yh_contract_dict.get('currency')
        self.implied_volatility = yh_contract_dict.get('impliedVolatility')
        self.in_the_money = yh_contract_dict.get('inTheMoney')
        self.last_price = yh_contract_dict.get('lastPrice')
        self.last_trade_date = datetime.fromtimestamp(yh_contract_dict.get('lastTradeDate'))  # TODO: check timezone.
        self.open_interest = yh_contract_dict.get('openInterest')
        self.percent_change = yh_contract_dict.get('percentChange')
        self.volume = yh_contract_dict.get('volume')  # Could be None.

        # Derived attributes:
        self.estimated_price = self.__get_estimated_price()
        self.break_even_price = self.__get_break_even_price()

    # TODO: make @property work with Serializer.
    def __get_estimated_price(self):
        if self.ask == 0:
            return self.bid
        elif self.bid == 0:
            return self.ask
        else:
            return (self.ask + self.bid) / 2.0

    def __get_break_even_price(self):
        return self.estimated_price + self.strike
