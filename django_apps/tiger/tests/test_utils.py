from django.test import TestCase
from tiger.views.utils import filter_object_on_attribute
from tiger.core import OptionContract

class FilterContractOnAttributeTestCase(TestCase):
    def setUp(self):
        row = {'putCall': 'CALL', 'symbol': 'TSLA_031221C50', 'description': 'TSLA Mar 12 2021 50 Call (Weekly)', 'exchangeName': 'OPR', 'bid': 545.6, 'ask': 550.05, 'last': 640.8, 'mark': 547.83, 'bidSize': 1, 'askSize': 1, 'bidAskSize': '1X1', 'lastSize': 0, 'highPrice': 0.0, 'lowPrice': 0.0, 'openPrice': 0.0, 'closePrice': 547.95, 'totalVolume': 0, 'tradeDate': None, 'tradeTimeInLong': 1614712687776, 'quoteTimeInLong': 1614977945365, 'netChange': 92.85, 'volatility': 517.163, 'delta': 1.0, 'gamma': 0.0, 'theta': 0.0, 'vega': 0.0, 'rho': 0.0, 'openInterest': 1, 'timeValue': 92.85, 'theoreticalOptionValue': 547.95, 'theoreticalVolatility': 29.0, 'optionDeliverablesList': None, 'strikePrice': 50.0, 'expirationDate': 1615582800000, 'daysToExpiration': 5, 'expirationType': 'S', 'lastTradingDay': 1615597200000, 'multiplier': 100.0, 'settlementType': ' ', 'deliverableNote': '', 'isIndexOption': None, 'percentChange': 16.94, 'markChange': -0.13, 'markPercentChange': -0.02, 'inTheMoney': True, 'mini': False, 'nonStandard': False }
        self.contract = OptionContract('TSLA', True, row, 600.3, 0)
    
    def test_filter_is(self):
        # valid calls
        self.assertTrue(filter_object_on_attribute(self.contract, 'eq.strike', 50.0))
        self.assertFalse(filter_object_on_attribute(self.contract, 'eq.strike', '50'))
        self.assertFalse(filter_object_on_attribute(self.contract, 'eq.strike', 5.0))
        self.assertFalse(filter_object_on_attribute(self.contract, 'eq.strike', ''))
        # invalid calls
        self.assertTrue(filter_object_on_attribute(self.contract, 'eq.asdf', ''))
        self.assertTrue(filter_object_on_attribute(self.contract, 'eq.asdf', 123))
    
    def test_filter_min(self):
        # valid calls
        self.assertTrue(filter_object_on_attribute(self.contract, 'min.bid', 500.0))
        self.assertTrue(filter_object_on_attribute(self.contract, 'min.open_interest', 0.0))
        self.assertFalse(filter_object_on_attribute(self.contract, 'min.bid', 700.0))
        self.assertFalse(filter_object_on_attribute(self.contract, 'min.open_interest', 10))
        with self.assertRaises(AssertionError):
            filter_object_on_attribute(self.contract, 'min.bid', '500')
        with self.assertRaises(AssertionError):
            filter_object_on_attribute(self.contract, 'min.bid', '')
        # invalid calls
        self.assertTrue(filter_object_on_attribute(self.contract, 'min.asdf', ''))
        self.assertTrue(filter_object_on_attribute(self.contract, 'min.asdf', 123))

    def test_filter_max(self):
        # valid calls
        self.assertTrue(filter_object_on_attribute(self.contract, 'max.ask', 600.0))
        self.assertTrue(filter_object_on_attribute(self.contract, 'max.open_interest', 10))
        self.assertFalse(filter_object_on_attribute(self.contract, 'max.ask', 400.0))
        with self.assertRaises(AssertionError):
            filter_object_on_attribute(self.contract, 'max.ask', '600')
        with self.assertRaises(AssertionError):
            filter_object_on_attribute(self.contract, 'max.ask', '')
        # invalid calls
        self.assertTrue(filter_object_on_attribute(self.contract, 'max.asdf', ''))
        self.assertTrue(filter_object_on_attribute(self.contract, 'max.asdf', 123))

    def test_filter_unknown(self):
        self.assertTrue(filter_object_on_attribute(self.contract, 'another.random.string', ''))
        self.assertTrue(filter_object_on_attribute(self.contract, 'another.random.string', 0))
        with self.assertRaises(AssertionError):
            filter_object_on_attribute(self.contract, 'random string', '')
        with self.assertRaises(AssertionError):
            filter_object_on_attribute(self.contract, 'random string', 0)
        with self.assertRaises(AssertionError):
            filter_object_on_attribute(self.contract, 123, '')
        with self.assertRaises(AssertionError):
            filter_object_on_attribute(self.contract, None, None)
        