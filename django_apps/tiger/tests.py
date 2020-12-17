from datetime import datetime
from django.test import TestCase
from django.utils.timezone import make_aware, get_default_timezone
from unittest import mock

from tiger.classes import OptionContract, BuyCall, SellCoveredCall, BuyPut, SellCashSecuredPut, Trade

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
        self.current_stock_price = 420.0

    @mock.patch('django.utils.timezone.now')
    def test_initialization(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        target_stock_price = 600.0
        month_to_gain = 0.1
        call_contract = OptionContract(True, self.yahoo_input, self.current_stock_price)
        buy_call = BuyCall(call_contract, target_stock_price, 'estimated')
        # Test attributes.
        self.assertEqual(buy_call.contract.ask, 163.15)
        self.assertEqual(buy_call.contract.bid, 160.25)
        self.assertEqual(buy_call.contract.contract_symbol, 'TSLA210716C00288000')
        self.assertEqual(buy_call.contract.expiration, 1626465600)  # 07/16/2021
        self.assertEqual(buy_call.contract.strike, 288.0)
        self.assertEqual(buy_call.contract.days_till_expiration, 195)
        # Test derived methods.
        self.assertAlmostEqual(buy_call.estimated_premium, 161.7)
        self.assertAlmostEqual(buy_call.target_stock_price, 600.0)
        self.assertAlmostEqual(buy_call.to_target_price_ratio, 0.42857142857)
        self.assertAlmostEqual(buy_call.to_target_price_ratio_annualized, 0.94959631065)
        self.assertAlmostEqual(buy_call.break_even_price, 449.7)
        self.assertAlmostEqual(buy_call.to_break_even_ratio, 0.07071428571)
        self.assertAlmostEqual(buy_call.to_break_even_ratio_annualized, 0.13643051577)
        self.assertAlmostEqual(buy_call.to_strike, -132.0)
        self.assertAlmostEqual(buy_call.to_strike_ratio, -0.31428571428)
        self.assertAlmostEqual(buy_call.to_strike_ratio_annualized, -0.50649259097)
        self.assertAlmostEqual(buy_call.gain, 0.9294990723562)
        self.assertAlmostEqual(buy_call.gain_daily, 0.00337625301)
        self.assertAlmostEqual(buy_call.gain_annualized, 2.42210783034)
        self.assertAlmostEqual(buy_call.to_target_price_ratio, 0.42857142857143)

    @mock.patch('django.utils.timezone.now')
    def test_missing_bid_or_ask(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        # Missing bid.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        trade = Trade('test_trade', OptionContract(True, yahoo_input, self.current_stock_price), 10.0)
        self.assertEqual(trade.contract.ask, 163.15)
        self.assertEqual(trade.contract.bid, None)
        self.assertAlmostEqual(trade.estimated_premium, 163.15)
        # Missing ask.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('ask', None)
        trade = Trade('test_trade', OptionContract(True, yahoo_input, self.current_stock_price), 10.0)
        self.assertEqual(trade.contract.ask, None)
        self.assertEqual(trade.contract.bid, 160.25)
        self.assertAlmostEqual(trade.estimated_premium, 160.25)
        # Missing both bid and ask but have last price.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        yahoo_input.pop('ask', None)
        trade = Trade('test_trade', OptionContract(True, yahoo_input, self.current_stock_price), 10.0)
        self.assertAlmostEqual(trade.estimated_premium, 156.75)
        # Missing bid, ask and last price.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        yahoo_input.pop('ask', None)
        yahoo_input.pop('lastPrice', None)
        trade = Trade('test_trade', OptionContract(True, yahoo_input, self.current_stock_price), 10.0)
        self.assertIsNone(trade.estimated_premium)
        # All bid, ask and last price are 0.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input['bid'] = 0.0
        yahoo_input['ask'] = 0.0
        yahoo_input['lastPrice'] = 0.0
        trade = Trade('test_trade', OptionContract(True, yahoo_input, self.current_stock_price), 10.0)
        self.assertIsNone(trade.estimated_premium)

    @mock.patch('django.utils.timezone.now')
    def test_sell_covered_call(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())

        call_contract = OptionContract(True, self.yahoo_input, self.current_stock_price)
        sell_call = SellCoveredCall(call_contract, 10.0, 'estimated')
        self.assertEqual(sell_call.to_strike, -132.0)
        self.assertAlmostEqual(sell_call.to_strike_ratio, -0.31428571428)
        self.assertAlmostEqual(sell_call.gain_cap, 0.07071428571)
        self.assertAlmostEqual(sell_call.gain_cap_annualized, 0.13643051577)
        self.assertAlmostEqual(sell_call.premium_gain, 0.07071428571)  # premium_gain is capped by gain_cap.
        self.assertAlmostEqual(sell_call.premium_gain_annualized, 0.13643051577)

        call_contract = OptionContract(True, self.yahoo_input2, self.current_stock_price)
        sell_call2 = SellCoveredCall(call_contract, 10.0, 'estimated')
        self.assertEqual(sell_call2.to_strike, 25.0)
        self.assertAlmostEqual(sell_call2.to_strike_ratio, 0.05952380952)
        self.assertAlmostEqual(sell_call2.gain_cap, 0.24130952381)
        self.assertAlmostEqual(sell_call2.gain_cap_annualized, 0.49873298736)
        self.assertAlmostEqual(sell_call2.premium_gain, 0.18178571428)
        self.assertAlmostEqual(sell_call2.premium_gain_annualized, 0.3670287040215)

    def test_use_as_premium(self):
        yahoo_input = dict(self.yahoo_input)
        self.assertAlmostEqual(
            Trade('test_trade', OptionContract(True, yahoo_input, 100.0), 10.0, 'bid').estimated_premium,
            160.25)
        self.assertAlmostEqual(
            Trade('test_trade', OptionContract(True, yahoo_input, 100.0), 10.0, 'ask').estimated_premium,
            163.15)
        self.assertAlmostEqual(
            Trade('test_trade', OptionContract(True, yahoo_input, 100.0), 10.0, 'estimated').estimated_premium, 161.7)


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

        self.current_stock_price = 73.55

    @mock.patch('django.utils.timezone.now')
    def test_sell_put(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        put_contract = OptionContract(False, self.yahoo_input, self.current_stock_price)
        trade = SellCashSecuredPut(put_contract, 10.0, 'estimated')
        # Test attributes.
        self.assertEqual(trade.contract.ask, 1.0)
        self.assertEqual(trade.contract.bid, 0.4)
        self.assertEqual(trade.contract.contract_symbol, 'QQQE210115P00068000')
        self.assertEqual(trade.contract.expiration, 1626465600)  # 07/16/2021
        self.assertEqual(trade.contract.strike, 68.0)
        self.assertEqual(trade.contract.days_till_expiration, 195)
        # Test derived methods.
        self.assertAlmostEqual(trade.estimated_premium, 0.7)
        self.assertAlmostEqual(trade.break_even_price, 67.3)
        self.assertAlmostEqual(trade.to_break_even_ratio, -0.08497620666)
        self.assertAlmostEqual(trade.to_break_even_ratio_annualized, -0.15314444614)
        self.assertAlmostEqual(trade.cash_required, 6800.0)
        self.assertAlmostEqual(trade.to_strike, -5.55)
        self.assertAlmostEqual(trade.to_strike_ratio, -0.07545887151)
        self.assertAlmostEqual(trade.to_strike_ratio_annualized, -0.13658238907)

    @mock.patch('django.utils.timezone.now')
    def test_buy_put(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        target_stock_price = 65.0
        put_contract = OptionContract(False, self.yahoo_input, self.current_stock_price)
        trade = BuyPut(put_contract, target_stock_price, 'estimated')

        # Test attributes.
        self.assertEqual(trade.contract.ask, 1.0)
        self.assertEqual(trade.contract.bid, 0.4)
        self.assertEqual(trade.contract.contract_symbol, 'QQQE210115P00068000')
        self.assertEqual(trade.contract.expiration, 1626465600)  # 07/16/2021
        self.assertEqual(trade.contract.strike, 68.0)
        self.assertEqual(trade.contract.days_till_expiration, 195)
        # Test derived methods.
        self.assertAlmostEqual(trade.estimated_premium, 0.7)
        self.assertAlmostEqual(trade.break_even_price, 67.3)
        self.assertAlmostEqual(trade.to_break_even_ratio, -0.08497620666)
        self.assertAlmostEqual(trade.to_break_even_ratio_annualized, -0.15314444614)
        self.assertAlmostEqual(trade.to_strike, -5.55)
        self.assertAlmostEqual(trade.to_strike_ratio, -0.07545887151)
        self.assertAlmostEqual(trade.to_strike_ratio_annualized, -0.13658238907)
        # Test gains
        self.assertAlmostEqual(trade.gain, 3.28571428571)
        self.assertAlmostEqual(trade.gain_daily, 0.00749092913)
        self.assertAlmostEqual(trade.gain_annualized, 14.2411526253)
        self.assertAlmostEqual(trade.to_target_price_ratio, -0.11624745071)
        self.assertAlmostEqual(trade.to_target_price_ratio_annualized, -0.20650893415)


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
        self.current_stock_price = 210.0

    @mock.patch('django.utils.timezone.now')
    def test_initialization(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        contract = OptionContract(True, self.td_input, self.current_stock_price)
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
