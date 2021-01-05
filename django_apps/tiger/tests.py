from datetime import datetime
from django.test import TestCase
from django.utils.timezone import make_aware, get_default_timezone
from unittest import mock

from tiger.classes import Stock, OptionContract, LongCall, CoveredCall, LongPut, CashSecuredPut, Leg, OptionLeg
from tiger.models import ExternalRequestCache, Ticker, StockSnapshot, OptionContractSnapshot, LegSnapshot, TradeSnapshot

MOCK_NOW_TIMESTAMP = 1609664400  # 01/03/2021


class CallTradesTestCase(TestCase):
    def setUp(self):
        self.yahoo_input = {
            "contractSymbol": "TSLA210716C00288000",
            "strike": 288.0,
            "currency": "USD",
            "lastPrice": 156.75,
            "change": -23.5,
            "percentChange": -13.037448,
            "volume": 1,
            "openInterest": 15,
            "bid": 160.25,
            "ask": 163.15,
            "contractSize": "REGULAR",
            "expiration": 1626393600,
            "lastTradeDate": 1603466039,
            "impliedVolatility": 0.6649966361999513,
            "inTheMoney": True
        }
        self.yahoo_input2 = {
            "contractSymbol": "TSLA210219P00445000",
            "strike": 445.0,
            "currency": "USD",
            "lastPrice": 74.0,
            "change": -1.0,
            "percentChange": -1.3333334,
            "volume": 1,
            "openInterest": 203,
            "bid": 75.5,
            "ask": 77.2,
            "contractSize": "REGULAR",
            "expiration": 1626393600,
            "lastTradeDate": 1603466039,
            "impliedVolatility": 0.6474034283447265,
            "inTheMoney": False
        }
        self.stock_price = 420.0
        self.stock = Stock(1, self.stock_price)

    @mock.patch('django.utils.timezone.now')
    def test_initialization(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        target_price = 600.0
        call_contract = OptionContract(1, True, self.yahoo_input, self.stock_price, 'estimated')
        long_call = LongCall(self.stock, call_contract, target_price)
        # Test contract attributes.
        self.assertEqual(call_contract.ask, 163.15)
        self.assertEqual(call_contract.bid, 160.25)
        self.assertEqual(call_contract.contract_symbol, 'TSLA210716C00288000')
        self.assertEqual(call_contract.expiration, 1626465600)  # 07/16/2021
        self.assertEqual(call_contract.strike, 288.0)
        self.assertEqual(call_contract.days_till_expiration, 195)
        self.assertAlmostEqual(call_contract.premium, 161.7)
        self.assertAlmostEqual(call_contract.to_strike, -132.0)
        self.assertAlmostEqual(call_contract.to_strike_ratio, -0.31428571428)
        # Test trade attributes.
        self.assertAlmostEqual(long_call.cost, 16170)
        self.assertAlmostEqual(long_call.target_price, 600.0)
        self.assertAlmostEqual(long_call.to_target_price_ratio, 0.42857142857)
        self.assertAlmostEqual(long_call.target_price_profit, 15030)
        self.assertAlmostEqual(long_call.target_price_profit_ratio, 0.9294990723562)
        self.assertAlmostEqual(long_call.break_even_price, 449.7)
        self.assertAlmostEqual(long_call.to_break_even_ratio, 0.07071428571)

    @mock.patch('django.utils.timezone.now')
    def test_missing_bid_or_ask(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        # Missing bid.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        call_contract = OptionContract(1, True, yahoo_input, self.stock_price)
        self.assertEqual(call_contract.ask, 163.15)
        self.assertEqual(call_contract.bid, None)
        self.assertAlmostEqual(call_contract.premium, 163.15)
        # Missing ask.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('ask', None)
        call_contract = OptionContract(1, True, yahoo_input, self.stock_price)
        self.assertEqual(call_contract.ask, None)
        self.assertEqual(call_contract.bid, 160.25)
        self.assertAlmostEqual(call_contract.premium, 160.25)
        # Missing both bid and ask but have last price.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        yahoo_input.pop('ask', None)
        call_contract = OptionContract(1, True, yahoo_input, self.stock_price)
        self.assertAlmostEqual(call_contract.premium, 156.75)
        # Missing bid, ask and last price.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        yahoo_input.pop('ask', None)
        yahoo_input.pop('lastPrice', None)
        with self.assertRaises(ValueError):
            OptionContract(1, True, yahoo_input, self.stock_price)
        # All bid, ask and last price are 0.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input['bid'] = 0.0
        yahoo_input['ask'] = 0.0
        yahoo_input['lastPrice'] = 0.0
        with self.assertRaises(ValueError):
            OptionContract(1, True, yahoo_input, self.stock_price)
        # Missing bid if use bid.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        with self.assertRaises(ValueError):
            OptionContract(1, True, yahoo_input, self.stock_price, 'bid')
        # Missing ask if use ask.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('ask', None)
        with self.assertRaises(ValueError):
            OptionContract(1, True, yahoo_input, self.stock_price, 'ask')

    @mock.patch('django.utils.timezone.now')
    def test_sell_covered_call(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())

        call_contract = OptionContract(1, True, self.yahoo_input, self.stock_price)
        sell_call = CoveredCall(self.stock, call_contract, target_price=258.3)
        self.assertEqual(call_contract.to_strike, -132.0)
        self.assertAlmostEqual(call_contract.to_strike_ratio, -0.31428571428)
        self.assertAlmostEqual(sell_call.break_even_price, 258.3)
        self.assertAlmostEqual(sell_call.profit_cap, 2970)
        self.assertAlmostEqual(sell_call.profit_cap_ratio, 0.11498257839)
        self.assertAlmostEqual(sell_call.premium_profit, 2970)
        self.assertAlmostEqual(sell_call.premium_profit_ratio, 0.11498257839)
        self.assertAlmostEqual(sell_call.target_price_profit, 0.0)

        call_contract = OptionContract(1, True, self.yahoo_input2, self.stock_price)
        sell_call = CoveredCall(self.stock, call_contract)
        self.assertEqual(call_contract.to_strike, 25.0)
        self.assertAlmostEqual(call_contract.to_strike_ratio, 0.05952380952)
        self.assertAlmostEqual(sell_call.break_even_price, 343.65)
        self.assertAlmostEqual(sell_call.profit_cap, 10135)
        self.assertAlmostEqual(sell_call.profit_cap_ratio, 0.29492215917)
        self.assertAlmostEqual(sell_call.premium_profit, 7635)
        self.assertAlmostEqual(sell_call.premium_profit_ratio, 0.22217372326)

    def test_use_as_premium(self):
        yahoo_input = dict(self.yahoo_input)
        self.assertAlmostEqual(OptionContract(1, True, yahoo_input, 100.0, 'bid').premium, 160.25)
        self.assertAlmostEqual(OptionContract(1, True, yahoo_input, 100.0, 'ask').premium, 163.15)
        self.assertAlmostEqual(OptionContract(1, True, yahoo_input, 100.0, 'estimated').premium, 161.7)


class PutTradesTestCase(TestCase):
    def setUp(self):
        self.yahoo_input = {
            "contractSymbol": "QQQE210115P00068000",
            "strike": 68.0,
            "currency": "USD",
            "lastPrice": 0.65,
            "change": 0.65,
            "volume": 3,
            "openInterest": 0,
            "bid": 0.4,
            "ask": 1.0,
            "contractSize": "REGULAR",
            "expiration": 1626393600,
            "lastTradeDate": 1603466039,
            "impliedVolatility": 0.32031929687499994,
            "inTheMoney": False
        }

        self.stock_price = 73.55
        self.stock = Stock(2, self.stock_price)

    @mock.patch('django.utils.timezone.now')
    def test_sell_put(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        put_contract = OptionContract(1, False, self.yahoo_input, self.stock_price)
        sell_put = CashSecuredPut(self.stock, put_contract, target_price=67.3)
        # Test attributes.
        self.assertEqual(put_contract.ask, 1.0)
        self.assertEqual(put_contract.bid, 0.4)
        self.assertEqual(put_contract.contract_symbol, 'QQQE210115P00068000')
        self.assertEqual(put_contract.expiration, 1626465600)  # 07/16/2021
        self.assertEqual(put_contract.strike, 68.0)
        self.assertEqual(put_contract.days_till_expiration, 195)
        self.assertAlmostEqual(put_contract.premium, 0.7)
        self.assertAlmostEqual(put_contract.to_strike, -5.55)
        self.assertAlmostEqual(put_contract.to_strike_ratio, -0.07545887151)
        # Test derived methods.
        self.assertAlmostEqual(sell_put.cost, 6730.0)
        self.assertAlmostEqual(sell_put.break_even_price, 67.3)
        self.assertAlmostEqual(sell_put.to_break_even_ratio, -0.08497620666)
        self.assertAlmostEqual(sell_put.cash_required, 6800.0)
        self.assertAlmostEqual(sell_put.premium_profit, 70)
        self.assertAlmostEqual(sell_put.premium_profit_ratio, 0.0104011887)
        self.assertAlmostEqual(sell_put.target_price_profit, 0.0)

    @mock.patch('django.utils.timezone.now')
    def test_buy_put(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        put_contract = OptionContract(1, False, self.yahoo_input, self.stock_price)
        long_put = LongPut(self.stock, put_contract, target_price=65.0)

        # Test attributes.
        self.assertEqual(put_contract.ask, 1.0)
        self.assertEqual(put_contract.bid, 0.4)
        self.assertEqual(put_contract.contract_symbol, 'QQQE210115P00068000')
        self.assertEqual(put_contract.expiration, 1626465600)  # 07/16/2021
        self.assertEqual(put_contract.strike, 68.0)
        self.assertEqual(put_contract.days_till_expiration, 195)
        self.assertAlmostEqual(put_contract.premium, 0.7)
        self.assertAlmostEqual(put_contract.to_strike, -5.55)
        self.assertAlmostEqual(put_contract.to_strike_ratio, -0.07545887151)
        # Test derived methods.
        self.assertAlmostEqual(long_put.cost, 70.0)
        self.assertAlmostEqual(long_put.break_even_price, 67.3)
        self.assertAlmostEqual(long_put.to_break_even_ratio, -0.08497620666)
        self.assertAlmostEqual(long_put.target_price_profit, 230.0)
        self.assertAlmostEqual(long_put.target_price_profit_ratio, 3.28571428571)
        self.assertAlmostEqual(long_put.to_target_price_ratio, -0.11624745071)


class TdTestCase(TestCase):
    def setUp(self):
        self.td_input = {
            "putCall": "CALL",
            "symbol": "MSFT_121820C215",
            "description": "MSFT Dec 18 2020 215 Call",
            "exchangeName": "OPR",
            "bid": 1.98,
            "ask": 2.06,
            "last": 2,
            "mark": 2.02,
            "bidSize": 22,
            "askSize": 20,
            "bidAskSize": "22X20",
            "lastSize": 0,
            "highPrice": 2.29,
            "lowPrice": 1.12,
            "openPrice": 0,
            "closePrice": 2.02,
            "totalVolume": 16151,
            "tradeDate": None,
            "tradeTimeInLong": 1607720391942,
            "quoteTimeInLong": 1607720399718,
            "netChange": -0.02,
            "volatility": 22.763,
            "delta": 0.407,
            "gamma": 0.055,
            "theta": -0.176,
            "vega": 0.12,
            "rho": 0.018,
            "openInterest": 26690,
            "timeValue": 2,
            "theoreticalOptionValue": 2.02,
            "theoreticalVolatility": 29,
            "optionDeliverablesList": None,
            "strikePrice": 215,
            "expirationDate": 1626465600000,
            "daysToExpiration": 5,
            "expirationType": "R",
            "lastTradingDay": 1608339600000,
            "multiplier": 100,
            "settlementType": " ",
            "deliverableNote": "",
            "isIndexOption": None,
            "percentChange": -0.99,
            "markChange": 0,
            "markPercentChange": 0,
            "nonStandard": False,
            "inTheMoney": False,
            "mini": False
        }
        self.stock_price = 210.0

    @mock.patch('django.utils.timezone.now')
    def test_initialization(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        contract = OptionContract(1, True, self.td_input, self.stock_price)
        # Test attributes.
        self.assertTrue(contract.is_call)
        self.assertEqual(contract.ask, 2.06)
        self.assertEqual(contract.bid, 1.98)
        self.assertEqual(contract.contract_symbol, 'MSFT_121820C215')
        self.assertEqual(contract.expiration, 1626465600)  # 07/16/2020
        self.assertEqual(contract.strike, 215.0)
        self.assertEqual(contract.change, -0.02)
        self.assertEqual(contract.contract_size, 100)
        self.assertIsNone(contract.currency)
        self.assertAlmostEqual(contract.implied_volatility, 0.22763)
        self.assertFalse(contract.in_the_money)
        self.assertEqual(contract.last_price, 2.0)
        self.assertEqual(contract.last_trade_date, 1607720391)
        self.assertEqual(contract.open_interest, 26690)
        self.assertAlmostEqual(contract.percent_change, -0.99)
        self.assertEqual(contract.volume, 16151)
        self.assertEqual(contract.mark, 2.02)
        self.assertEqual(contract.high_price, 2.29)
        self.assertEqual(contract.low_price, 1.12)
        self.assertEqual(contract.open_price, 0)
        self.assertEqual(contract.time_value, 2)
        self.assertEqual(contract.bid_size, 22)
        self.assertEqual(contract.ask_size, 20)
        self.assertEqual(contract.delta, 0.407)
        self.assertEqual(contract.gamma, 0.055)
        self.assertEqual(contract.theta, -0.176)
        self.assertEqual(contract.vega, 0.12)
        self.assertEqual(contract.rho, 0.018)

        # Test derived methods.
        self.assertEqual(contract.days_till_expiration, 195)


class LoadFromSnapshotTestCase(TestCase):
    def setUp(self):
        self.ticker = Ticker.objects.create(symbol='QQQE')
        self.external_cache = ExternalRequestCache.objects.create(
            request_url='https://query1.finance.yahoo.com/v7/finance/options/QQQE',
            response_blob='{"optionChain":{"result":[{"underlyingSymbol":"QQQE","expirationDates":[1610668800,1613692800,1616112000,1623974400],"strikes":[65.0,68.0,69.0,70.0,71.0,72.0,73.0,74.0,75.0,76.0,77.0,78.0],"hasMiniOptions":false,"quote":{"language":"en-US","region":"US","quoteType":"ETF","quoteSourceName":"Delayed Quote","triggerable":true,"currency":"USD","fiftyTwoWeekLowChange":34.01,"fiftyTwoWeekLowChangePercent":0.84749556,"fiftyTwoWeekRange":"40.13 - 75.52","fiftyTwoWeekHighChange":-1.3799973,"fiftyTwoWeekHighChangePercent":-0.01827327,"fiftyTwoWeekLow":40.13,"fiftyTwoWeekHigh":75.52,"ytdReturn":15.27,"trailingThreeMonthReturns":0.74,"trailingThreeMonthNavReturns":0.69,"fiftyDayAverage":72.69875,"fiftyDayAverageChange":1.441246,"fiftyDayAverageChangePercent":0.019824907,"twoHundredDayAverage":65.8727,"twoHundredDayAverageChange":8.267296,"twoHundredDayAverageChangePercent":0.12550412,"sourceInterval":15,"exchangeDataDelayedBy":0,"tradeable":false,"marketState":"POST","firstTradeDateMilliseconds":1332336600000,"priceHint":2,"regularMarketChange":-1.0200043,"regularMarketChangePercent":-1.3571105,"regularMarketTime":1609794000,"regularMarketPrice":74.14,"regularMarketDayHigh":75.52,"regularMarketDayRange":"73.25 - 75.52","regularMarketDayLow":73.25,"regularMarketVolume":58589,"regularMarketPreviousClose":75.16,"bid":72.65,"ask":74.54,"bidSize":10,"askSize":10,"fullExchangeName":"NYSEArca","regularMarketOpen":75.52,"averageDailyVolume3Month":45200,"averageDailyVolume10Day":41900,"exchange":"PCX","shortName":"Direxion NASDAQ-100 Equal Weigh","longName":"Direxion NASDAQ-100 Equal Weighted Index Shares","messageBoardId":"finmb_182590799","exchangeTimezoneName":"America/New_York","exchangeTimezoneShortName":"EST","gmtOffSetMilliseconds":-18000000,"market":"us_market","esgPopulated":false,"symbol":"QQQE"}}]}}'
        )
        self.external_cache_td = ExternalRequestCache.objects.create(
            request_url='https://api.tdameritrade.com/v1/marketdata/chains?apikey=132&contractType=ALL&includeQuotes=TRUE&strategy=SINGLE&symbol=QQQE&fromDate=2020-12-01',
            response_blob='{"symbol":"QQQE","status":"SUCCESS","underlying":{"symbol":"QQQE","description":"Direxion NASDAQ-100 Equal Weighted Index Shares","change":-1.02,"percentChange":-1.36,"close":75.16,"quoteTime":1609795061364,"tradeTime":1609799740021,"bid":72.65,"ask":74.54,"last":74.13,"mark":74.14,"markChange":-1.02,"markPercentChange":-1.36,"bidSize":2100,"askSize":2000,"highPrice":75.52,"lowPrice":73.25,"openPrice":75.52,"totalVolume":58590,"exchangeName":"PAC","fiftyTwoWeekHigh":75.52,"fiftyTwoWeekLow":40.13,"delayed":true},"strategy":"SINGLE","interval":0.0,"isDelayed":true,"isIndex":false,"interestRate":0.1,"underlyingPrice":73.595,"volatility":29.0,"daysToExpiration":0.0,"numberOfContracts":136,"putExpDateMap":{"2021-01-15:11":{"65.0":[{"putCall":"PUT","symbol":"QQQE_011521P65","description":"QQQE Jan 15 2021 65 Put","exchangeName":"OPR","bid":0.0,"ask":0.75,"last":0.93,"mark":0.38,"bidSize":0,"askSize":283,"bidAskSize":"0X283","lastSize":0,"highPrice":0.0,"lowPrice":0.0,"openPrice":0.0,"closePrice":0.58,"totalVolume":0,"tradeDate":null,"tradeTimeInLong":1607612099235,"quoteTimeInLong":1609783859300,"netChange":0.35,"volatility":59.48,"delta":-0.097,"gamma":0.022,"theta":-0.057,"vega":0.023,"rho":-0.002,"openInterest":1,"timeValue":0.93,"theoreticalOptionValue":0.375,"theoreticalVolatility":29.0,"optionDeliverablesList":null,"strikePrice":65.0,"expirationDate":1610744400000,"daysToExpiration":11,"expirationType":"R","lastTradingDay":1610758800000,"multiplier":100.0,"settlementType":" ","deliverableNote":"","isIndexOption":null,"percentChange":59.52,"markChange":-0.21,"markPercentChange":-35.68,"mini":false,"inTheMoney":false,"nonStandard":false}],"66.0":[{"putCall":"PUT","symbol":"QQQE_011521P66","description":"QQQE Jan 15 2021 66 Put","exchangeName":"OPR","bid":0.0,"ask":0.25,"last":0.0,"mark":0.13,"bidSize":0,"askSize":15,"bidAskSize":"0X15","lastSize":0,"highPrice":0.0,"lowPrice":0.0,"openPrice":0.0,"closePrice":0.59,"totalVolume":0,"tradeDate":null,"tradeTimeInLong":0,"quoteTimeInLong":1609792393294,"netChange":0.0,"volatility":41.455,"delta":-0.053,"gamma":0.02,"theta":-0.025,"vega":0.014,"rho":-0.001,"openInterest":0,"timeValue":0.13,"theoreticalOptionValue":0.125,"theoreticalVolatility":29.0,"optionDeliverablesList":null,"strikePrice":66.0,"expirationDate":1610744400000,"daysToExpiration":11,"expirationType":"R","lastTradingDay":1610758800000,"multiplier":100.0,"settlementType":" ","deliverableNote":"","isIndexOption":null,"percentChange":0.0,"markChange":-0.46,"markPercentChange":-78.78,"mini":false,"inTheMoney":false,"nonStandard":false}]}}}'
        )

    def testLoadStockFromSnapshot(self):
        stock_snapshot = StockSnapshot.objects.create(ticker=self.ticker, external_cache=self.external_cache)
        stock_snapshot_td = StockSnapshot.objects.create(ticker=self.ticker, external_cache=self.external_cache_td)

        stock = Stock.from_snapshot(stock_snapshot)
        self.assertEqual(stock.ticker_id, self.ticker.id)
        self.assertEqual(stock.external_cache_id, self.external_cache.id)
        self.assertEqual(stock.stock_price, 74.14)

        stock_td = Stock.from_snapshot(stock_snapshot_td)
        self.assertEqual(stock_td.ticker_id, self.ticker.id)
        self.assertEqual(stock_td.external_cache_id, self.external_cache_td.id)
        self.assertEqual(stock_td.stock_price, 74.13)

    def testLoadContractFromSnapshot(self):
        contract_snapshot_td = OptionContractSnapshot.objects.create(ticker=self.ticker, is_call=False, strike=66.0,
                                                                     expiration_timestamp=1610744400, premium=0.0,
                                                                     external_cache=self.external_cache_td)
        contract_td = OptionContract.from_snapshot(contract_snapshot_td)
        self.assertEqual(contract_td.ticker_id, self.ticker.id)
        self.assertEqual(contract_td.external_cache_id, self.external_cache_td.id)
        self.assertEqual(contract_td.stock_price, 74.13)
        self.assertEqual(contract_td.is_call, False)
        self.assertEqual(contract_td.strike, 66.0)
        self.assertEqual(contract_td.premium, 0.25)
        self.assertEqual(contract_td.expiration, 1610744400)
        self.assertEqual(contract_td.ask, 0.25)

    def testLoadStockLegFromSnapshot(self):
        stock_snapshot = StockSnapshot.objects.create(ticker=self.ticker, external_cache=self.external_cache)
        stock_leg_snapshot = LegSnapshot.objects.create(name='long_cash_leg', is_long=True, units=1,
                                                        stock_snapshot=stock_snapshot)
        stock_leg = Leg.from_snapshot(stock_leg_snapshot)
        self.assertEqual(stock_leg.name, 'long_cash_leg')
        self.assertEqual(stock_leg.is_long, True)
        self.assertEqual(stock_leg.units, 1)
        self.assertEqual(stock_leg.stock.ticker_id, self.ticker.id)
        self.assertEqual(stock_leg.stock.stock_price, 74.14)

    def testLoadContractLegFromSnapshot(self):
        contract_snapshot_td = OptionContractSnapshot.objects.create(ticker=self.ticker, is_call=False, strike=66.0,
                                                                     expiration_timestamp=1610744400, premium=0.0,
                                                                     external_cache=self.external_cache_td)
        contract_leg_snapshot = LegSnapshot.objects.create(name='long_put_leg', is_long=True, units=2,
                                                           contract_snapshot=contract_snapshot_td)
        contract_leg = Leg.from_snapshot(contract_leg_snapshot)
        self.assertEqual(contract_leg.name, 'long_put_leg')
        self.assertEqual(contract_leg.is_long, True)
        self.assertEqual(contract_leg.units, 2)
        self.assertEqual(contract_leg.contract.stock_price, 74.13)
        self.assertEqual(contract_leg.contract.is_call, False)
        self.assertEqual(contract_leg.contract.premium, 0.25)
