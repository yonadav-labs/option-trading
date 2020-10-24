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
