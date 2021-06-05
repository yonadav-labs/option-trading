import datetime

from django.test import TestCase
from tiger.core import OptionContract
from tiger.utils import is_market_open
from tiger.views.utils import filter_object_on_attribute


class FilterContractOnAttributeTestCase(TestCase):
    def setUp(self):
        row = {'putCall': 'CALL', 'symbol': 'TSLA_031221C50', 'description': 'TSLA Mar 12 2021 50 Call (Weekly)',
               'exchangeName': 'OPR', 'bid': 545.6, 'ask': 550.05, 'last': 640.8, 'mark': 547.83, 'bidSize': 1,
               'askSize': 1, 'bidAskSize': '1X1', 'lastSize': 0, 'highPrice': 0.0, 'lowPrice': 0.0, 'openPrice': 0.0,
               'closePrice': 547.95, 'totalVolume': 0, 'tradeDate': None, 'tradeTimeInLong': 1614712687776,
               'quoteTimeInLong': 1614977945365, 'netChange': 92.85, 'volatility': 517.163, 'delta': 1.0, 'gamma': 0.0,
               'theta': 0.0, 'vega': 0.0, 'rho': 0.0, 'openInterest': 1, 'timeValue': 92.85,
               'theoreticalOptionValue': 547.95, 'theoreticalVolatility': 29.0, 'optionDeliverablesList': None,
               'strikePrice': 50.0, 'expirationDate': 1615582800000, 'daysToExpiration': 5, 'expirationType': 'S',
               'lastTradingDay': 1615597200000, 'multiplier': 100.0, 'settlementType': ' ', 'deliverableNote': '',
               'isIndexOption': None, 'percentChange': 16.94, 'markChange': -0.13, 'markPercentChange': -0.02,
               'inTheMoney': True, 'mini': False, 'nonStandard': False}
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

    # Testing the is_market_open utils function
    def test_is_market_open(self):
        # We define a datetime for a normal weekday, a market holiday on a weekday, and a weekend day.
        weekday_normal = datetime.datetime(year=2021, month=6, day=4)
        weekday_holiday = datetime.datetime(year=2021, month=7, day=5)
        weekend = datetime.datetime(year=2021, month=6, day=5)

        # We expect market open on a normal weekday, closed on weekday market holiday and a weekend.
        self.assertTrue(is_market_open(weekday_normal))
        self.assertFalse(is_market_open(weekday_holiday))
        self.assertFalse(is_market_open(weekend))

        self.assertFalse(is_market_open(datetime.datetime(year=2021, month=8, day=1)))  # S.
        self.assertTrue(is_market_open(datetime.datetime(year=2021, month=8, day=2)))  # M.
        self.assertTrue(is_market_open(datetime.datetime(year=2021, month=8, day=3)))  # T.
        self.assertTrue(is_market_open(datetime.datetime(year=2021, month=8, day=4)))  # W.
        self.assertTrue(is_market_open(datetime.datetime(year=2021, month=8, day=5)))  # T.
        self.assertTrue(is_market_open(datetime.datetime(year=2021, month=8, day=6)))  # F.
        self.assertFalse(is_market_open(datetime.datetime(year=2021, month=8, day=7)))  # S.
        self.assertFalse(is_market_open(datetime.datetime(year=2021, month=8, day=8)))  # S.

        # https://www.nyse.com/markets/hours-calendars
        self.assertFalse(is_market_open(datetime.datetime(year=2021, month=11, day=25)))  # Thanksgiving 2021 holiday
        self.assertTrue(is_market_open(datetime.datetime(year=2021, month=11, day=26)))  # Day after thanksgiving, half day.
        self.assertFalse(is_market_open(datetime.datetime(year=2021, month=12, day=24)))  # Christmas.
        self.assertFalse(is_market_open(datetime.datetime(year=2022, month=1, day=1)))  # New year on a weekend.
        self.assertFalse(is_market_open(datetime.datetime(year=2022, month=1, day=17)))  # MLK day.
        self.assertFalse(is_market_open(datetime.datetime(year=2023, month=1, day=1)))  # New year 2023, sunday.
        self.assertFalse(is_market_open(datetime.datetime(year=2023, month=1, day=2)))  # New Year's holiday observed.
