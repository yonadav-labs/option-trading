from datetime import datetime
from django.test import TestCase
from unittest import mock

from tiger.classes import OptionContract


class StubDatetime(datetime):
    pass


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

    @mock.patch('tiger.utils.datetime', StubDatetime)
    def test_initialization(self):
        StubDatetime.now = classmethod(lambda cls: datetime(2021, 1, 1))
        current_stock_price = 420.0
        target_stock_price = 600.0
        month_to_gain = 0.1
        contract = OptionContract(self.yahoo_input, current_stock_price, target_stock_price, month_to_gain)
        # Test attributes.
        self.assertEqual(contract.ask, 163.15)
        self.assertEqual(contract.bid, 160.25)
        self.assertEqual(contract.contract_symbol, 'TSLA210716C00288000')
        self.assertEqual(contract.expiration, 1626393600)  # 07/15/2020
        self.assertEqual(contract.strike, 288.0)
        # Test derived methods.
        self.assertAlmostEqual(contract.estimated_price, 161.7)
        self.assertAlmostEqual(contract.break_even_price, 449.7)
        self.assertEqual(contract.days_till_expiration, 195)
        self.assertAlmostEqual(contract.gain, 0.9295)
        self.assertAlmostEqual(contract.gain_after_tradeoff, 1.5795)
        self.assertAlmostEqual(contract.stock_gain, 0.4286)
        # Test methods.
        contract.save_normalized_score(2.0)
        self.assertAlmostEqual(contract.normalized_score, 78.97)

    def test_missing_bid_or_ask(self):
        current_stock_price = 420.0
        target_stock_price = 600.0
        month_to_gain = 0.1
        # Missing bid.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('bid', None)
        contract = OptionContract(yahoo_input, current_stock_price, target_stock_price, month_to_gain)
        self.assertEqual(contract.ask, 163.15)
        self.assertEqual(contract.bid, None)
        self.assertAlmostEqual(contract.estimated_price, 163.15)
        # Missing ask.
        yahoo_input = dict(self.yahoo_input)
        yahoo_input.pop('ask', None)
        contract = OptionContract(yahoo_input, current_stock_price, target_stock_price, month_to_gain)
        self.assertEqual(contract.ask, None)
        self.assertEqual(contract.bid, 160.25)
        self.assertAlmostEqual(contract.estimated_price, 160.25)
