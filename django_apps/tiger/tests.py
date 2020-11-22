from datetime import datetime
from django.test import TestCase
from django.utils.timezone import make_aware, get_default_timezone
from unittest import mock

from tiger.classes import BuyCall, SellCoveredCall

MOCK_NOW_TIMESTAMP = 1609664400  # 01/03/2021


class OptionContractTestCase(TestCase):
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
        contract = BuyCall(self.yahoo_input, self.current_stock_price, target_stock_price,
                           month_to_gain)
        # Test attributes.
        self.assertEqual(contract.ask, 163.15)
        self.assertEqual(contract.bid, 160.25)
        self.assertEqual(contract.contract_symbol, 'TSLA210716C00288000')
        self.assertEqual(contract.expiration, 1626393600)  # 07/15/2020
        self.assertEqual(contract.strike, 288.0)
        # Test derived methods.
        self.assertAlmostEqual(contract.estimated_premium, 161.7)
        self.assertAlmostEqual(contract.break_even_price, 449.7)
        self.assertEqual(contract.days_till_expiration, 195)
        self.assertAlmostEqual(contract.gain, 0.9294990723562)
        self.assertAlmostEqual(contract.gain_after_tradeoff, 1.5794990723562)
        self.assertAlmostEqual(contract.stock_gain, 0.42857142857143)

    @mock.patch('django.utils.timezone.now')
    def test_missing_bid_or_ask(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        target_stock_price = 600.0
        month_to_gain = 0.1
        # Missing bid.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        contract = BuyCall(yahoo_input, self.current_stock_price, target_stock_price, month_to_gain)
        self.assertEqual(contract.ask, 163.15)
        self.assertEqual(contract.bid, None)
        self.assertAlmostEqual(contract.estimated_premium, 163.15)
        # Missing ask.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('ask', None)
        contract = BuyCall(yahoo_input, self.current_stock_price, target_stock_price, month_to_gain)
        self.assertEqual(contract.ask, None)
        self.assertEqual(contract.bid, 160.25)
        self.assertAlmostEqual(contract.estimated_premium, 160.25)
        # Missing strike.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('strike', None)
        with self.assertRaisesMessage(ValueError, 'invalid yh_contract_dict'):
            BuyCall(yahoo_input, self.current_stock_price, target_stock_price, month_to_gain)
        # Missing both bid and ask but have last price.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        yahoo_input.pop('ask', None)
        contract = BuyCall(yahoo_input, self.current_stock_price, target_stock_price, month_to_gain)
        self.assertAlmostEqual(contract.estimated_premium, 156.75)
        # Missing bid, ask and last price.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        yahoo_input.pop('ask', None)
        yahoo_input.pop('lastPrice', None)
        contract = BuyCall(yahoo_input, self.current_stock_price, target_stock_price, month_to_gain)
        self.assertIsNone(contract.estimated_premium)
        self.assertIsNone(contract.gain_after_tradeoff)
        self.assertAlmostEqual(contract.stock_gain, 0.42857142857143)
        # All bid, ask and last price are 0.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input['bid'] = 0.0
        yahoo_input['ask'] = 0.0
        yahoo_input['lastPrice'] = 0.0
        contract = BuyCall(yahoo_input, self.current_stock_price, target_stock_price, month_to_gain)
        self.assertIsNone(contract.estimated_premium)
        self.assertIsNone(contract.gain_after_tradeoff)
        self.assertAlmostEqual(contract.stock_gain, 0.42857142857143)

    @mock.patch('django.utils.timezone.now')
    def test_sell_covered_call(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())

        contract = SellCoveredCall(self.yahoo_input, self.current_stock_price)
        self.assertEqual(contract.to_strike, -132.0)
        self.assertAlmostEqual(contract.to_strike_ratio, -0.31428571428)
        self.assertAlmostEqual(contract.gain_cap, 0.07071428571)
        self.assertAlmostEqual(contract.annualized_gain_cap, 0.13643051577)
        self.assertAlmostEqual(contract.premium_gain, 0.07071428571)  # premium_gain is capped by gain_cap.
        self.assertAlmostEqual(contract.annualized_premium_gain, 0.13643051577)

        contract2 = SellCoveredCall(self.yahoo_input2, self.current_stock_price)
        self.assertEqual(contract2.to_strike, 25.0)
        self.assertAlmostEqual(contract2.to_strike_ratio, 0.05952380952)
        self.assertAlmostEqual(contract2.gain_cap, 0.24130952381)
        self.assertAlmostEqual(contract2.annualized_gain_cap, 0.49873298736)
        self.assertAlmostEqual(contract2.premium_gain, 0.18178571428)
        self.assertAlmostEqual(contract2.annualized_premium_gain, 0.3670287040215)
