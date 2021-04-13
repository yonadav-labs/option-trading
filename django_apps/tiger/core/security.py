from abc import ABC, abstractmethod

import tiger.blob_reader as blob_reader
from tiger.utils import days_from_timestamp, timestamp_to_datetime_with_default_tz
from tiger.core.black_scholes import get_itm_probability


class Security(ABC):
    def __init__(self, external_cache_id):
        self.external_cache_id = external_cache_id

    @property
    @abstractmethod
    def display_name(self):
        pass

    @abstractmethod
    def get_value_at_price(self, target_price):
        pass

    @abstractmethod
    def get_value_in_price_range(self, price_lower, price_upper):
        pass


class Cash(Security):
    def __init__(self):
        super().__init__(None)

    @property
    def display_name(self):
        return 'cash'

    def get_value_at_price(self, target_price):
        return 1.0

    def get_value_in_price_range(self, price_lower, price_upper):
        return 1.0


class Stock(Security):
    def __init__(self, ticker, stock_price, external_cache_id=None, ticker_stats=None):
        super().__init__(external_cache_id)
        self.ticker = ticker
        self.stock_price = stock_price
        self.ticker_stats_id = ticker_stats.id if ticker_stats else None
        self.historical_volatility = ticker_stats.historical_volatility if ticker_stats else None

    @classmethod
    def from_snapshot(cls, stock_snapshot):
        cache = stock_snapshot.external_cache
        if 'yahoo' in cache.request_url:
            stock_price = blob_reader.get_quote(cache.json_response, True).get('regularMarketPrice')
        else:
            stock_price = blob_reader.get_quote(cache.json_response, False).get('last')
        return cls(stock_snapshot.ticker, stock_price, stock_snapshot.external_cache_id, stock_snapshot.ticker_stats)

    @property
    def display_name(self):
        return '{} stock'.format(self.ticker.symbol)

    def get_value_at_price(self, target_price):
        return target_price

    def get_value_in_price_range(self, price_lower, price_upper):
        # TODO: upgrade from uniformed distribution.
        return (self.get_value_at_price(price_lower) + self.get_value_at_price(price_upper)) / 2.0


class OptionContract(Security):
    def __init__(self, ticker, is_call, data_dict, stock_price, external_cache_id=None):
        super().__init__(external_cache_id)
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
            if data_dict.get('volatility') is not None:
                self.implied_volatility = data_dict.get('volatility') / 100.0
            else:
                self.implied_volatility = None
            self.in_the_money = data_dict.get('inTheMoney')
            self.last_price = data_dict.get('last')
            self.last_trade_date = int(data_dict.get('tradeTimeInLong') / 1000)
            self.open_interest = data_dict.get('openInterest')
            self.percent_change = data_dict.get('percentChange')  # TODO: verify data is correct.
            self.volume = data_dict.get('totalVolume')

            # TD specific data.
            self.high_price = data_dict.get('highPrice')
            self.low_price = data_dict.get('lowPrice')
            self.open_price = data_dict.get('openPrice')
            self.close_price = data_dict.get('closePrice')
            self.time_value = data_dict.get('timeValue')
            self.bid_size = data_dict.get('bidSize')
            self.ask_size = data_dict.get('askSize')
            self.delta = data_dict.get('delta')
            self.gamma = data_dict.get('gamma')
            self.theta = data_dict.get('theta')
            self.vega = data_dict.get('vega')
            self.rho = data_dict.get('rho')
            self.theoretical_volatility = data_dict.get('theoreticalVolatility') / 100.0
            self.theoretical_option_value = data_dict.get('theoreticalOptionValue')
            self.quote_time = int(data_dict.get('quoteTimeInLong') / 1000)
            '''
            TD data not used.
            "mark", "daysToExpiration", "tradeDate", "optionDeliverablesList",
            "expirationType", "lastTradingDay", "settlementType", "deliverableNote",
            "isIndexOption", "markChange", "markPercentChange", "mini", "nonStandard"
            '''

        # Non-contract data.
        self.ticker = ticker
        self.stock_price = stock_price
        self.notional_value = stock_price * 100
        self.days_till_expiration = days_from_timestamp(self.expiration)
        # Validation.
        self.mark

    @classmethod
    def from_snapshot(cls, contract_snapshot):
        cache = contract_snapshot.external_cache
        if 'yahoo' in cache.request_url:
            stock_price = blob_reader.get_quote(cache.json_response, True).get(
                'regularMarketPrice')
            contract_data = blob_reader.get_contract(cache.json_response, True, contract_snapshot.is_call,
                                                     contract_snapshot.strike, contract_snapshot.expiration_timestamp)
        else:
            stock_price = blob_reader.get_quote(cache.json_response, False).get(
                'last')
            contract_data = blob_reader.get_contract(cache.json_response, False, contract_snapshot.is_call,
                                                     contract_snapshot.strike, contract_snapshot.expiration_timestamp)
        # TODO: set customizable premium
        return cls(contract_snapshot.ticker, contract_snapshot.is_call, contract_data, stock_price,
                   external_cache_id=cache.id)

    @property
    def display_name(self):
        expiration_date_str = timestamp_to_datetime_with_default_tz(self.expiration).strftime("%m/%d/%Y")
        strike = int(self.strike) if self.strike.is_integer() else self.strike
        return '{} {} strike ${} {}'.format(self.ticker.symbol, expiration_date_str,
                                            strike, 'call' if self.is_call else 'put')

    @property
    def to_strike(self):
        """Positive when stock_price is below strike."""
        return self.strike - self.stock_price

    @property
    def to_strike_ratio(self):
        return self.to_strike / self.stock_price

    @property
    def mark(self):
        if self.bid and self.ask:
            return (self.ask + self.bid) / 2.0
        elif self.bid:
            return self.bid
        elif self.ask:
            return self.ask
        elif self.last_price:
            return self.last_price
        raise ValueError('missing bid ask last_price')

    @property
    def bid_ask_spread(self):
        if not self.bid or not self.ask:
            return None
        return self.ask - self.bid

    @property
    def break_even_price(self):
        if self.is_call:
            return self.strike + self.mark
        else:
            return self.strike - self.mark

    @property
    def to_break_even_ratio(self):
        return self.break_even_price / self.stock_price - 1.0

    @property
    def itm_probability(self):
        return get_itm_probability(stock_price=self.stock_price, strike=self.strike,
                                   exp_years=self.days_till_expiration / 365.0, sigma=self.implied_volatility,
                                   is_call=self.is_call)

    def get_value_at_price(self, target_price):
        if self.is_call:
            return max(0, target_price - self.strike) * 100
        else:
            return max(0, self.strike - target_price) * 100

    def get_value_in_price_range(self, price_lower, price_upper):
        # TODO: upgrade from uniformed distribution.
        if self.is_call:
            if self.strike <= price_lower:
                return (self.get_value_at_price(price_lower) + self.get_value_at_price(price_upper)) / 2.0
            elif self.strike >= price_upper:
                return 0.0
            else:
                return self.get_value_at_price(price_upper) / 2.0 * \
                       ((price_upper - self.strike) / (price_upper - price_lower))
        else:
            if self.strike <= price_lower:
                return 0.0
            elif self.strike >= price_upper:
                return (self.get_value_at_price(price_lower) + self.get_value_at_price(price_upper)) / 2.0
            else:
                return self.get_value_at_price(price_lower) / 2.0 * \
                       ((self.strike - price_lower) / (price_upper - price_lower))

    def __str__(self):
        return self.contract_symbol

    def __repr__(self):
        return self.__str__()
