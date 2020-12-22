from abc import ABC, abstractmethod

from tiger.utils import days_from_timestamp


class Security(ABC):
    @abstractmethod
    def get_cost(self):
        pass

    @abstractmethod
    def get_value_at_target_price(self, target_price):
        pass

    def get_profit_at_target_price(self, target_price):
        return self.get_value_at_target_price(target_price) - self.get_cost()


class Cash(Security):
    def get_cost(self):
        return 1.0

    def get_value_at_target_price(self, target_price):
        return 1.0


class Stock(Security):
    def __init__(self, stock_price):
        self.stock_price = stock_price

    def get_cost(self):
        return self.stock_price

    def get_value_at_target_price(self, target_price):
        return target_price


class OptionContract:
    def __init__(self, is_call, data_dict, stock_price, use_as_premium='estimated'):
        if 'contractSymbol' in data_dict:
            # Yahoo.
            self.is_call = is_call  # There are only 2 types of options: "call" and "put".
            self.ask = data_dict.get('ask')  # Could be None.
            self.bid = data_dict.get('bid')  # Could be None.
            self.contract_symbol = data_dict.get('contractSymbol')
            # Yahool uses GMT 12AM. We advance it to 4pm EST.
            self.expiration = data_dict.get('expiration') + 72000
            self.strike = data_dict.get('strike')
            self.change = data_dict.get('change')
            self.contract_size = data_dict.get('contractSize')
            self.currency = data_dict.get('currency')
            self.implied_volatility = data_dict.get('impliedVolatility')
            self.in_the_money = data_dict.get('inTheMoney')
            self.last_price = data_dict.get('lastPrice')
            self.last_trade_date = data_dict.get('lastTradeDate')
            self.open_interest = data_dict.get('openInterest')
            self.percent_change = data_dict.get('percentChange')
            self.volume = data_dict.get('volume')  # Could be None.
        else:
            # TD.
            for key in data_dict:
                if data_dict[key] == 'NaN':
                    data_dict[key] = None
            self.is_call = is_call
            self.ask = data_dict.get('ask')
            self.bid = data_dict.get('bid')
            self.contract_symbol = data_dict.get('symbol')
            self.expiration = int(data_dict.get('expirationDate') / 1000)
            self.strike = data_dict.get('strikePrice')
            self.change = data_dict.get('netChange')
            self.contract_size = data_dict.get('multiplier')  # 100, different from 'REGULAR' of yahoo
            self.currency = None
            self.implied_volatility = data_dict.get('volatility') / 100.0 if data_dict.get(
                'volatility') is not None else None
            self.in_the_money = data_dict.get('inTheMoney')
            self.last_price = data_dict.get('last')
            self.last_trade_date = int(data_dict.get('tradeTimeInLong') / 1000)
            self.open_interest = data_dict.get('openInterest')
            self.percent_change = data_dict.get('percentChange')  # TODO: verify data is correct.
            self.volume = data_dict.get('totalVolume')

            # TD specific data.
            self.mark = data_dict.get('mark')
            self.high_price = data_dict.get('highPrice')
            self.low_price = data_dict.get('lowPrice')
            self.open_price = data_dict.get('openPrice')
            self.time_value = data_dict.get('timeValue')
            self.bid_size = data_dict.get('bidSize')
            self.ask_size = data_dict.get('askSize')
            self.delta = data_dict.get('delta')
            self.gamma = data_dict.get('gamma')
            self.theta = data_dict.get('theta')
            self.vega = data_dict.get('vega')
            self.rho = data_dict.get('rho')
            '''
            TD data not used.
            "daysToExpiration":, "closePrice", "tradeDate", "quoteTimeInLong",
            "theoreticalOptionValue", "theoreticalVolatility", "optionDeliverablesList",
            "expirationType", "lastTradingDay", "settlementType", "deliverableNote",
            "isIndexOption", "markChange", "markPercentChange", "mini", "nonStandard"
            '''

        # Non-contract data.
        self.stock_price = stock_price
        self.days_till_expiration = days_from_timestamp(self.expiration)

        # Derived
        self.to_strike = self.get_to_strike()
        self.to_strike_ratio = self.get_to_strike_ratio()
        self.use_as_premium = use_as_premium if use_as_premium in ('bid', 'ask', 'estimated') else 'estimated'
        self.premium = self.get_premium()  # Could be None.
        self.break_even_price = self.get_break_even_price()
        self.to_break_even_ratio = self.get_to_break_even_ratio()
        self.leverage = self.strike / self.premium
        self.seller_roi = self.premium / self.strike

    # TODO: 100 can be obtained from contract_size. Fix this.
    def get_cost(self):
        return self.premium * 100

    def get_value_at_target_price(self, target_price):
        if self.is_call:
            return max(0, target_price - self.strike) * 100
        else:
            return max(0, self.strike - target_price) * 100

    def get_to_strike(self):
        """Positive when stock_price is below strike."""
        return self.strike - self.stock_price

    def get_to_strike_ratio(self):
        return self.get_to_strike() / self.stock_price

    def get_premium(self):
        if self.use_as_premium == 'estimated':
            if self.bid and self.ask:
                return (self.ask + self.bid) / 2.0
            elif self.bid:
                return self.bid
            elif self.ask:
                return self.ask
            elif self.last_price:
                return self.last_price
        elif self.use_as_premium == 'bid' and self.bid:
            return self.bid
        elif self.use_as_premium == 'ask' and self.ask:
            return self.ask
        raise ValueError('missing bid ask last_price')

    def __str__(self):
        return self.contract_symbol

    def __repr__(self):
        return self.__str__()

    def get_break_even_price(self):
        if self.is_call:
            return self.strike + self.premium
        else:
            return self.strike - self.premium

    def get_to_break_even_ratio(self):
        return self.get_break_even_price() / self.stock_price - 1.0
