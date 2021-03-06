from django.test import TestCase
from tiger.core import OptionContract, Leg, Stock
from tiger.core.trade.trade_factory import TradeFactory
from tiger.models import ExternalRequestCache, Ticker, OptionContractSnapshot, LegSnapshot, \
    TickerStats, StockSnapshot, User, TradeSnapshot


class LoadFromSnapshotTestCase(TestCase):
    def setUp(self):
        self.ticker = Ticker.objects.create(symbol='QQQE')
        self.ticker.tickerstats = TickerStats(self.ticker, historical_volatility=0.3)
        self.external_cache_iex_quote = ExternalRequestCache.objects.create(
            request_url='https://cloud.iexapis.com/v1/stock/ZEPP/quote?token=pk_857fc78a42ec4c35b018d6f5fb7b2f04',
            response_blob='{"symbol":"QQQE","companyName":"Direxion NASDAQ-100 Equal Weighted Index Shares",'
                          '"open":75.52,"close":75.16,"high":75.52,"low":73.25,"latestPrice":74.14,'
                          '"marketCap":378916081,"week52High":75.52,"week52Low":40.13}'
        )
        self.external_cache_td = ExternalRequestCache.objects.create(
            request_url='https://api.tdameritrade.com/v1/marketdata/chains?apikey=132&contractType=ALL&includeQuotes=TRUE&strategy=SINGLE&symbol=QQQE&fromDate=2020-12-01',
            response_blob='{"symbol":"QQQE","status":"SUCCESS","underlying":{"symbol":"QQQE","description":"Direxion NASDAQ-100 Equal Weighted Index Shares","change":-1.02,"percentChange":-1.36,"close":75.16,"quoteTime":1609795061364,"tradeTime":1609799740021,"bid":72.65,"ask":74.54,"last":74.13,"mark":74.14,"markChange":-1.02,"markPercentChange":-1.36,"bidSize":2100,"askSize":2000,"highPrice":75.52,"lowPrice":73.25,"openPrice":75.52,"totalVolume":58590,"exchangeName":"PAC","fiftyTwoWeekHigh":75.52,"fiftyTwoWeekLow":40.13,"delayed":true},"strategy":"SINGLE","interval":0.0,"isDelayed":true,"isIndex":false,"interestRate":0.1,"underlyingPrice":73.595,"volatility":29.0,"daysToExpiration":0.0,"numberOfContracts":136,'
                          '"putExpDateMap":{"2021-01-15:11":{"65.0":[{"putCall":"PUT","symbol":"QQQE_011521P65","description":"QQQE Jan 15 2021 65 Put","exchangeName":"OPR","bid":0.1,"ask":0.75,"last":0.93,"mark":0.38,"bidSize":0,"askSize":283,"bidAskSize":"0X283","lastSize":0,"highPrice":0.0,"lowPrice":0.0,"openPrice":0.0,"closePrice":0.58,"totalVolume":0,"tradeDate":null,"tradeTimeInLong":1607612099235,"quoteTimeInLong":1609783859300,"netChange":0.35,"volatility":59.48,"delta":-0.097,"gamma":0.022,"theta":-0.057,"vega":0.023,"rho":-0.002,"openInterest":1,"timeValue":0.93,"theoreticalOptionValue":0.375,"theoreticalVolatility":29.0,"optionDeliverablesList":null,"strikePrice":65.0,"expirationDate":1610744400000,"daysToExpiration":11,"expirationType":"R","lastTradingDay":1610758800000,"multiplier":100.0,"settlementType":" ","deliverableNote":"","isIndexOption":null,"percentChange":59.52,"markChange":-0.21,"markPercentChange":-35.68,"mini":false,"inTheMoney":false,"nonStandard":false}],'
                          '"66.0":[{"putCall":"PUT","symbol":"QQQE_011521P66","description":"QQQE Jan 15 2021 66 Put","exchangeName":"OPR","bid":0.0,"ask":0.25,"last":0.0,"mark":0.13,"bidSize":0,"askSize":15,"bidAskSize":"0X15","lastSize":0,"highPrice":0.0,"lowPrice":0.0,"openPrice":0.0,"closePrice":0.59,"totalVolume":0,"tradeDate":null,"tradeTimeInLong":0,"quoteTimeInLong":1609792393294,"netChange":0.0,"volatility":41.455,"delta":-0.053,"gamma":0.02,"theta":-0.025,"vega":0.014,"rho":-0.001,"openInterest":0,"timeValue":0.13,"theoreticalOptionValue":0.125,"theoreticalVolatility":29.0,"optionDeliverablesList":null,"strikePrice":66.0,"expirationDate":1610744400000,"daysToExpiration":11,"expirationType":"R","lastTradingDay":1610758800000,"multiplier":100.0,"settlementType":" ","deliverableNote":"","isIndexOption":null,"percentChange":0.0,"markChange":-0.46,"markPercentChange":-78.78,"mini":false,"inTheMoney":false,"nonStandard":false}]}}}'
        )
        self.broker_settings = {
            'open_commission': 0.65,
            'close_commission': 0.65
        }

    def testLoadStockFromSnapshot(self):
        stock_snapshot_td = StockSnapshot.objects.create(ticker=self.ticker,
                                                         external_cache=self.external_cache_iex_quote)

        stock_td = Stock.from_snapshot(stock_snapshot_td)
        self.assertEqual(stock_td.ticker, self.ticker)
        self.assertEqual(stock_td.external_cache_id, self.external_cache_iex_quote.id)
        self.assertEqual(stock_td.stock_price, 74.14)

    def testLoadContractFromSnapshot(self):
        contract_snapshot_td = OptionContractSnapshot.objects.create(ticker=self.ticker, is_call=False, strike=66.0,
                                                                     expiration_timestamp=1610744400,
                                                                     external_cache=self.external_cache_td)
        contract_td = OptionContract.from_snapshot(contract_snapshot_td, 74.13)
        self.assertEqual(contract_td.ticker, self.ticker)
        self.assertEqual(contract_td.external_cache_id, self.external_cache_td.id)
        self.assertEqual(contract_td.stock_price, 74.13)
        self.assertEqual(contract_td.is_call, False)
        self.assertEqual(contract_td.strike, 66.0)
        self.assertEqual(contract_td.mark, 0.25)
        self.assertEqual(contract_td.expiration, 1610744400)
        self.assertEqual(contract_td.ask, 0.25)

    def testLoadStockLegFromSnapshot(self):
        stock_snapshot = StockSnapshot.objects.create(ticker=self.ticker, external_cache=self.external_cache_iex_quote)
        stock_leg_snapshot = LegSnapshot.objects.create(is_long=True, units=1, stock_snapshot=stock_snapshot)
        stock_leg = Leg.from_snapshot(stock_leg_snapshot, 74.13, 'mid', self.broker_settings)
        self.assertEqual(stock_leg.name, 'long_stock_leg')
        self.assertEqual(stock_leg.is_long, True)
        self.assertEqual(stock_leg.units, 1)
        self.assertEqual(stock_leg.stock.ticker, self.ticker)
        self.assertEqual(stock_leg.stock.stock_price, 74.14)

    def testLoadContractLegFromSnapshot(self):
        contract_snapshot_td = OptionContractSnapshot.objects.create(ticker=self.ticker, is_call=False, strike=66.0,
                                                                     expiration_timestamp=1610744400,
                                                                     external_cache=self.external_cache_td)
        contract_leg_snapshot = LegSnapshot.objects.create(is_long=True, units=2,
                                                           contract_snapshot=contract_snapshot_td)
        contract_leg = Leg.from_snapshot(contract_leg_snapshot, 74.13, 'mid', self.broker_settings)
        self.assertEqual(contract_leg.name, 'long_put_leg')
        self.assertEqual(contract_leg.is_long, True)
        self.assertEqual(contract_leg.units, 2)
        self.assertEqual(contract_leg.contract.stock_price, 74.13)
        self.assertEqual(contract_leg.contract.is_call, False)
        self.assertEqual(contract_leg.contract.mark, 0.25)
        self.assertEqual(contract_leg.total_cost, 25 * 2 + 1.3)

        contract_snapshot_td2 = OptionContractSnapshot.objects.create(ticker=self.ticker, is_call=False, strike=65.0,
                                                                      expiration_timestamp=1610744400,
                                                                      external_cache=self.external_cache_td)
        contract_leg_snapshot2 = LegSnapshot.objects.create(is_long=True, units=2,
                                                            contract_snapshot=contract_snapshot_td2)
        self.assertAlmostEqual(Leg.from_snapshot(contract_leg_snapshot2, 74.13, 'mid',
                                                 self.broker_settings).total_cost, 42.5 * 2 + 1.3)
        self.assertAlmostEqual(Leg.from_snapshot(contract_leg_snapshot2, 74.13,
                                                 'market', self.broker_settings).total_cost, 75 * 2 + 1.3)

    def testLoadTradeFromSnapshot(self):
        creator = User.objects.create_user(username='testuser', password='12345')
        stock_snapshot = StockSnapshot.objects.create(ticker=self.ticker, external_cache=self.external_cache_iex_quote)
        contract_snapshot_td = OptionContractSnapshot.objects.create(ticker=self.ticker, is_call=False, strike=66.0,
                                                                     expiration_timestamp=1610744400,
                                                                     external_cache=self.external_cache_td)
        contract_leg_snapshot = LegSnapshot.objects.create(is_long=False, units=1,
                                                           contract_snapshot=contract_snapshot_td)
        cash_leg_snapshot = LegSnapshot.objects.create(is_long=True, units=7413, cash_snapshot=True)
        trade_snapshot = TradeSnapshot.objects.create(type='cash_secured_put', stock_snapshot=stock_snapshot,
                                                      creator=creator, is_public=True, target_price_lower=100,
                                                      target_price_upper=100)
        trade_snapshot.leg_snapshots.add(contract_leg_snapshot)
        trade_snapshot.leg_snapshots.add(cash_leg_snapshot)

        trade = TradeFactory.from_snapshot(trade_snapshot, self.broker_settings)
        self.assertEqual(trade.type, 'cash_secured_put')
        self.assertEqual(trade.target_price_lower, 100)
        self.assertAlmostEqual(trade.cost, 7389.3)
        self.assertAlmostEqual(trade.target_price_profit, 23.7)
        self.assertAlmostEqual(trade.best_return, 23.7)
        # strike * 100 - premium (this trade is selling a put)
        self.assertAlmostEqual(trade.worst_return, -(6600 - 23.7))
        self.assertEqual(len(trade.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(trade.break_evens[0], 65.763)
        self.assertAlmostEqual(trade.reward_to_risk_ratio, 0.00360385018)
