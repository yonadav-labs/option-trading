from datetime import datetime
from unittest import mock

from django.test import TestCase
from django.utils.timezone import make_aware, get_default_timezone
from tiger.core import Cash, Stock, OptionContract, OptionLeg
from tiger.core.trade import LongCall, LongPut, CoveredCall, CashSecuredPut, BullPutSpread, BullCallSpread, \
    BearCallSpread, BearPutSpread, TradeFactory
from tiger.models import Ticker, TickerStats

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
            # mid: 161.7
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
            # mid: 76.35
            "contractSize": "REGULAR",
            "expiration": 1626393600,
            "lastTradeDate": 1603466039,
            "impliedVolatility": 0.6474034283447265,
            "inTheMoney": False
        }
        self.stock_price = 420.0
        self.ticker = Ticker(id=1, symbol='TSLA')
        self.tickerstats = TickerStats(self.ticker, historical_volatility=0.8)
        self.stock = Stock(self.ticker, self.stock_price, None, self.tickerstats)
        self.broker_settings = {
            'open_commission': 0.65,
            'close_commission': 0.65
        }

    @mock.patch('django.utils.timezone.now')
    def test_initialization(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        target_price = 600.0
        call_contract = OptionContract(self.ticker, True, self.yahoo_input, self.stock_price, 'mid')
        long_call = LongCall.build(self.stock, call_contract, 'mid', self.broker_settings, target_price, target_price)
        # Test contract attributes.
        self.assertEqual(call_contract.ask, 163.15)
        self.assertEqual(call_contract.bid, 160.25)
        self.assertAlmostEqual(call_contract.bid_ask_spread, 2.9)
        self.assertEqual(call_contract.contract_symbol, 'TSLA210716C00288000')
        self.assertEqual(call_contract.expiration, 1626465600)  # 07/16/2021
        self.assertEqual(call_contract.strike, 288.0)
        self.assertEqual(call_contract.days_till_expiration, 195)
        self.assertAlmostEqual(call_contract.mark, 161.7)
        self.assertAlmostEqual(call_contract.to_strike, -132.0)
        self.assertAlmostEqual(call_contract.to_strike_ratio, -0.31428571428)
        # Test trade attributes.
        self.assertAlmostEqual(long_call.cost, 16171.3)
        self.assertAlmostEqual(long_call.target_price_lower, 600.0)
        self.assertAlmostEqual(long_call.target_price_upper, 600.0)
        self.assertAlmostEqual(long_call.to_target_price_lower_ratio, 0.42857142857)
        self.assertAlmostEqual(long_call.target_price_profit, 15028.7)
        self.assertAlmostEqual(long_call.target_price_profit_ratio, 0.92934396121)
        self.assertAlmostEqual(long_call.break_even_price, 449.7)
        self.assertAlmostEqual(long_call.to_break_even_ratio, 0.07071428571)
        self.assertAlmostEqual(long_call.stock.historical_volatility, 0.8)
        self.assertSequenceEqual(long_call.two_sigma_prices, [0.0, 918.0998518877443])
        self.assertAlmostEqual(long_call.two_sigma_profit_lower, -16171.3)

        self.assertAlmostEqual(LongCall.build(self.stock, call_contract, 'mid', self.broker_settings, 580, 620).target_price_profit,
                               15028.7)
        self.assertAlmostEqual(LongCall.build(self.stock, call_contract, 'mid', self.broker_settings, 349.7, 549.7).target_price_profit,
                               -1.3)
        self.assertAlmostEqual(LongCall.build(self.stock, call_contract, 'mid', self.broker_settings, 260, 280).target_price_profit,
                               -16171.3)

    def test_value_in_price_range(self):
        call_contract = OptionContract(self.ticker, True, self.yahoo_input, self.stock_price)
        self.assertAlmostEqual(call_contract.get_value_in_price_range(100, 102), 0.0)
        self.assertAlmostEqual(call_contract.get_value_in_price_range(300, 310), 1700.0)
        self.assertAlmostEqual(call_contract.get_value_in_price_range(278, 298), 250.0)

        long_call_leg = OptionLeg(True, 2, call_contract, 'mid', self.broker_settings)
        self.assertAlmostEqual(long_call_leg.get_value_in_price_range(100, 102), 0.0)
        self.assertAlmostEqual(long_call_leg.get_value_in_price_range(300, 310), 3400.0)
        self.assertAlmostEqual(long_call_leg.get_value_in_price_range(278, 298), 500.0)
        self.assertAlmostEqual(long_call_leg.get_profit_in_price_range(100, 102), -32341.3)
        self.assertAlmostEqual(long_call_leg.get_profit_in_price_range(300, 310), -28941.3)
        self.assertAlmostEqual(long_call_leg.get_profit_in_price_range(278, 298), -31841.3)
        self.assertAlmostEqual(long_call_leg.get_profit_in_price_range(449.7, 449.7), -1.3)

        short_call_leg = OptionLeg(False, 2, call_contract, 'mid', self.broker_settings)
        self.assertAlmostEqual(short_call_leg.get_value_in_price_range(100, 102), 0.0)
        self.assertAlmostEqual(short_call_leg.get_value_in_price_range(300, 310), -3400.0)
        self.assertAlmostEqual(short_call_leg.get_value_in_price_range(278, 298), -500.0)
        self.assertAlmostEqual(short_call_leg.get_profit_in_price_range(100, 102), 32338.7)
        self.assertAlmostEqual(short_call_leg.get_profit_in_price_range(300, 310), 28938.7)
        self.assertAlmostEqual(short_call_leg.get_profit_in_price_range(278, 298), 31838.7)

        cash = Cash()
        self.assertAlmostEqual(cash.get_value_in_price_range(10, 10000), 1.0)

        stock = Stock(self.ticker, self.stock_price)
        self.assertAlmostEqual(stock.get_value_in_price_range(10, 50), 30.0)

    @mock.patch('django.utils.timezone.now')
    def test_missing_bid_or_ask(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        # Missing bid.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        call_contract = OptionContract(self.ticker, True, yahoo_input, self.stock_price)
        self.assertEqual(call_contract.ask, 163.15)
        self.assertEqual(call_contract.bid, None)
        self.assertAlmostEqual(call_contract.mark, 163.15)
        # Missing ask.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('ask', None)
        call_contract = OptionContract(self.ticker, True, yahoo_input, self.stock_price)
        self.assertEqual(call_contract.ask, None)
        self.assertEqual(call_contract.bid, 160.25)
        self.assertAlmostEqual(call_contract.mark, 160.25)
        # Missing both bid and ask but have last price.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        yahoo_input.pop('ask', None)
        call_contract = OptionContract(self.ticker, True, yahoo_input, self.stock_price)
        self.assertAlmostEqual(call_contract.mark, 156.75)
        # Missing bid, ask and last price.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        yahoo_input.pop('ask', None)
        yahoo_input.pop('lastPrice', None)
        with self.assertRaises(ValueError):
            OptionContract(self.ticker, True, yahoo_input, self.stock_price)
        # All bid, ask and last price are 0.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input['bid'] = 0.0
        yahoo_input['ask'] = 0.0
        yahoo_input['lastPrice'] = 0.0
        with self.assertRaises(ValueError):
            OptionContract(self.ticker, True, yahoo_input, self.stock_price)

    @mock.patch('django.utils.timezone.now')
    def test_sell_covered_call(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())

        call_contract = OptionContract(self.ticker, True, self.yahoo_input, self.stock_price)
        sell_call = CoveredCall.build(self.stock, call_contract, 'mid', self.broker_settings, target_price_lower=258.3,
                                      target_price_upper=258.3)
        self.assertEqual(call_contract.to_strike, -132.0)
        self.assertAlmostEqual(call_contract.to_strike_ratio, -0.31428571428)
        self.assertAlmostEqual(sell_call.break_even_price, 258.3)
        self.assertAlmostEqual(sell_call.profit_cap, 2968.7)
        self.assertAlmostEqual(sell_call.profit_cap_ratio, 0.11492646517)
        self.assertAlmostEqual(sell_call.target_price_profit, -1.3)
        self.assertAlmostEqual(sell_call.cost, 25831.3)

        self.assertAlmostEqual(CoveredCall.build(self.stock, call_contract, 'mid', self.broker_settings, 100, 120).target_price_profit,
                               -14831.3)
        self.assertAlmostEqual(CoveredCall.build(self.stock, call_contract, 'mid', self.broker_settings, 300, 310).target_price_profit,
                               2968.7)
        self.assertAlmostEqual(CoveredCall.build(self.stock, call_contract, 'mid', self.broker_settings, 278, 298).target_price_profit,
                               2718.7)

        call_contract = OptionContract(self.ticker, True, self.yahoo_input2, self.stock_price)
        sell_call = CoveredCall.build(self.stock, call_contract, 'mid', self.broker_settings)
        self.assertEqual(call_contract.to_strike, 25.0)
        self.assertAlmostEqual(call_contract.to_strike_ratio, 0.05952380952)
        self.assertAlmostEqual(sell_call.break_even_price, 343.65)
        self.assertAlmostEqual(sell_call.profit_cap, 10133.7)
        self.assertAlmostEqual(sell_call.profit_cap_ratio, 0.29487317517)
        self.assertAlmostEqual(sell_call.min_volume, 1)
        self.assertAlmostEqual(sell_call.min_open_interest, 203)

    @mock.patch('django.utils.timezone.now')
    def test_bull_call_spread(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        call_contract_1 = OptionContract(self.ticker, True, self.yahoo_input, self.stock_price, 'mid')
        call_contract_2 = OptionContract(self.ticker, True, self.yahoo_input2, self.stock_price, 'mid')
        bull_call_spread = BullCallSpread.build(self.stock, call_contract_1, call_contract_2, 'mid',
                                                self.broker_settings, 400, 400, available_cash=10000)
        self.assertAlmostEqual(bull_call_spread.cost, 8537.6)
        self.assertAlmostEqual(bull_call_spread.break_even_price, 373.35)
        self.assertAlmostEqual(bull_call_spread.profit_cap, 7162.4)  # ((445 - 288) - 85.35) * 100
        self.assertAlmostEqual(bull_call_spread.target_price_profit, 2662.4)  # ((400 - 288) - 85.35) * 100

    @mock.patch('django.utils.timezone.now')
    def test_bear_call_spread(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        call_contract_1 = OptionContract(self.ticker, True, self.yahoo_input, self.stock_price, 'mid')
        call_contract_2 = OptionContract(self.ticker, True, self.yahoo_input2, self.stock_price, 'mid')
        bear_call_spread = BearCallSpread.build(self.stock, call_contract_1, call_contract_2, 'mid',
                                                self.broker_settings, 400, 400, available_cash=10000)
        self.assertAlmostEqual(bear_call_spread.cost, 7167.6)
        self.assertAlmostEqual(bear_call_spread.break_even_price, 373.35)
        self.assertAlmostEqual(bear_call_spread.profit_cap, 8532.4)
        self.assertAlmostEqual(bear_call_spread.target_price_profit, -2667.6)

    def test_option_leg_premium_type(self):
        call_contract = OptionContract(self.ticker, True, self.yahoo_input, self.stock_price)
        self.assertAlmostEqual(OptionLeg(True, 2, call_contract, 'mid', self.broker_settings).cost, 16170 * 2 + 1.3)
        self.assertAlmostEqual(OptionLeg(True, 2, call_contract, 'market', self.broker_settings).cost, 16315 * 2 + 1.3)
        self.assertAlmostEqual(OptionLeg(False, 2, call_contract, 'mid', self.broker_settings).cost, -16170 * 2 + 1.3)
        self.assertAlmostEqual(OptionLeg(False, 2, call_contract, 'market', self.broker_settings).cost, -16025 * 2 + 1.3)


class PutTradesTestCase(TestCase):
    def setUp(self):
        self.yahoo_input = {
            "contractSymbol": "QQQE210115P00068000",
            "strike": 68.0,
            "currency": "USD",
            "lastPrice": 0.65,
            "change": 0.65,
            "volume": 3,
            "openInterest": 10,
            "bid": 0.4,
            "ask": 1.0,
            "contractSize": "REGULAR",
            "expiration": 1626393600,
            "lastTradeDate": 1603466039,
            "impliedVolatility": 0.32031929687499994,
            "inTheMoney": False
        }

        self.yahoo_input2 = {
            "contractSymbol": "QQQE210115P00074000",
            "strike": 74.0,
            "currency": "USD",
            "lastPrice": 2.65,
            "change": 0.65,
            "volume": 3,
            "openInterest": 10,
            "bid": 2.4,
            "ask": 3.0,
            "contractSize": "REGULAR",
            "expiration": 1626393600,
            "lastTradeDate": 1603466039,
            "impliedVolatility": 0.26031929687499994,
            "inTheMoney": True
        }

        self.stock_price = 73.55
        self.ticker = Ticker(id=2, symbol='QQQE')
        self.tickerstats = TickerStats(self.ticker, historical_volatility=0.3)
        self.stock = Stock(self.ticker, self.stock_price, None, self.tickerstats)
        self.broker_settings = {
            'open_commission': 0.65,
            'close_commission': 0.65
        }

    @mock.patch('django.utils.timezone.now')
    def test_sell_put(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        put_contract = OptionContract(self.ticker, False, self.yahoo_input, self.stock_price)
        sell_put = CashSecuredPut.build(self.stock, put_contract, 'mid', self.broker_settings, target_price_lower=67.3,
                                        target_price_upper=67.3)
        # Test attributes.
        self.assertEqual(put_contract.ask, 1.0)
        self.assertEqual(put_contract.bid, 0.4)
        self.assertEqual(put_contract.contract_symbol, 'QQQE210115P00068000')
        self.assertEqual(put_contract.expiration, 1626465600)  # 07/16/2021
        self.assertEqual(put_contract.strike, 68.0)
        self.assertEqual(put_contract.days_till_expiration, 195)
        self.assertAlmostEqual(put_contract.mark, 0.7)
        self.assertAlmostEqual(put_contract.to_strike, -5.55)
        self.assertAlmostEqual(put_contract.to_strike_ratio, -0.07545887151)
        # Test derived methods.
        self.assertAlmostEqual(sell_put.cost, 6731.3)
        self.assertAlmostEqual(sell_put.break_even_price, 67.3)
        self.assertAlmostEqual(sell_put.to_break_even_ratio, -0.08497620666)
        self.assertAlmostEqual(sell_put.target_price_profit, -1.3)
        self.assertAlmostEqual(sell_put.min_volume, 3)
        self.assertAlmostEqual(sell_put.min_open_interest, 10)
        self.assertAlmostEqual(sell_put.profit_cap, 68.7)

    @mock.patch('django.utils.timezone.now')
    def test_buy_put(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        put_contract = OptionContract(self.ticker, False, self.yahoo_input, self.stock_price)
        long_put = LongPut.build(self.stock, put_contract, 'mid', self.broker_settings, target_price_lower=65.0, target_price_upper=65.0)

        # Test attributes.
        self.assertEqual(put_contract.ask, 1.0)
        self.assertEqual(put_contract.bid, 0.4)
        self.assertEqual(put_contract.contract_symbol, 'QQQE210115P00068000')
        self.assertEqual(put_contract.expiration, 1626465600)  # 07/16/2021
        self.assertEqual(put_contract.strike, 68.0)
        self.assertEqual(put_contract.days_till_expiration, 195)
        self.assertAlmostEqual(put_contract.mark, 0.7)
        self.assertAlmostEqual(put_contract.to_strike, -5.55)
        self.assertAlmostEqual(put_contract.to_strike_ratio, -0.07545887151)
        # Test derived methods.
        self.assertAlmostEqual(long_put.cost, 71.3)
        self.assertAlmostEqual(long_put.break_even_price, 67.3)
        self.assertAlmostEqual(long_put.to_break_even_ratio, -0.08497620666)
        self.assertAlmostEqual(long_put.target_price_profit, 228.7)
        self.assertAlmostEqual(long_put.target_price_profit_ratio, 3.20757363253)
        self.assertAlmostEqual(long_put.to_target_price_lower_ratio, -0.11624745071)
        self.assertAlmostEqual(long_put.profit_cap, 6728.7)

    def test_value_in_price_range(self):
        put_contract = OptionContract(self.ticker, False, self.yahoo_input, self.stock_price)
        self.assertEqual(put_contract.get_value_in_price_range(90, 102), 0.0)
        self.assertEqual(put_contract.get_value_in_price_range(55, 65), 800.0)
        self.assertEqual(put_contract.get_value_in_price_range(63, 73), 125.0)

        long_put_leg = OptionLeg(True, 2, put_contract, 'mid', self.broker_settings)
        self.assertAlmostEqual(long_put_leg.get_value_in_price_range(90, 102), 0.0)
        self.assertAlmostEqual(long_put_leg.get_value_in_price_range(55, 65), 1600.0)
        self.assertAlmostEqual(long_put_leg.get_value_in_price_range(63, 73), 250.0)
        self.assertAlmostEqual(long_put_leg.get_profit_in_price_range(90, 102), -141.3)
        self.assertAlmostEqual(long_put_leg.get_profit_in_price_range(55, 65), 1458.7)
        self.assertAlmostEqual(long_put_leg.get_profit_in_price_range(63, 73), 108.7)
        self.assertAlmostEqual(long_put_leg.get_profit_in_price_range(67.3, 67.3), -1.3)

    def test_bear_put_spread(self):
        put_contract_1 = OptionContract(self.ticker, False, self.yahoo_input, self.stock_price, 'mid')
        put_contract_2 = OptionContract(self.ticker, False, self.yahoo_input2, self.stock_price, 'mid')
        bear_put_spread = BearPutSpread.build(self.stock, put_contract_1, put_contract_2, 'mid',
                                              self.broker_settings, 70, 70)
        self.assertAlmostEqual(bear_put_spread.cost, 202.6)
        self.assertAlmostEqual(bear_put_spread.break_even_price, 72)
        self.assertAlmostEqual(bear_put_spread.profit_cap, 397.4)
        self.assertAlmostEqual(bear_put_spread.target_price_profit, 197.4)

    def test_bull_put_spread(self):
        put_contract_1 = OptionContract(self.ticker, False, self.yahoo_input, self.stock_price, 'mid')
        put_contract_2 = OptionContract(self.ticker, False, self.yahoo_input2, self.stock_price, 'mid')
        bear_put_spread = BullPutSpread.build(self.stock, put_contract_1, put_contract_2, 'mid',
                                              self.broker_settings, 70, 70)
        self.assertAlmostEqual(bear_put_spread.cost, 402.6)
        self.assertAlmostEqual(bear_put_spread.break_even_price, 72)
        self.assertAlmostEqual(bear_put_spread.profit_cap, 197.4)
        self.assertAlmostEqual(bear_put_spread.target_price_profit, -202.6)


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
        self.ticker = Ticker(id=3, symbol='MSFT')
        self.tickerstats = TickerStats(self.ticker, historical_volatility=0.4)
        self.stock = Stock(self.ticker, self.stock_price, None, self.tickerstats)

    @mock.patch('django.utils.timezone.now')
    def test_initialization(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        contract = OptionContract(self.ticker, True, self.td_input, self.stock_price)
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
