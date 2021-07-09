from datetime import datetime
from unittest import mock

from django.test import TestCase
from django.utils.timezone import make_aware, get_default_timezone
from tiger.core import OptionContract
from tiger.models import Ticker

MOCK_NOW_TIMESTAMP = 1609664400  # 01/03/2021


class ContractTestCase(TestCase):
    def setUp(self):
        self.intrinio_call_input = {
            "option": {
                "code": "ZEPP210820C00015000",
                "ticker": "ZEPP",
                "expiration": "2021-08-20",
                "strike": 15.0,
                "type": "call"
            },
            "price": {
                "last": 0.15,
                "last_size": 10,
                "last_timestamp": "2021-07-06T16:03:12.097+00:00",
                "volume": 19,
                "ask": 0.2,
                "ask_size": 41,
                "ask_timestamp": "2021-07-06T17:15:33.421+00:00",
                "bid": 0.15,
                "bid_size": 1,
                "bid_timestamp": "2021-07-06T17:15:33.421+00:00",
                "open_interest": 773,
                "exercise_style": "A"
            },
            "stats": {
                "implied_volatility": 0.77175,
                "delta": 0.12004,
                "gamma": 0.07057,
                "theta": -0.00641,
                "vega": 0.00735
            }
        }
        self.intrinio_put_input = {
            "option": {
                "code": "ZEPP210820P00012500",
                "ticker": "ZEPP",
                "expiration": "2021-08-20",
                "strike": 12.5,
                "type": "put"
            },
            "price": {
                "last": 1.65,
                "last_size": 10,
                "last_timestamp": "2021-06-30T14:09:18.743+00:00",
                "volume": 10,
                "ask": 2.45,
                "ask_size": 27,
                "ask_timestamp": "2021-07-06T17:05:36.122+00:00",
                "bid": 2.25,
                "bid_size": 68,
                "bid_timestamp": "2021-07-06T17:05:36.122+00:00",
                "open_interest": 22,
                "exercise_style": "A"
            },
            "stats": {
                "implied_volatility": 0.00004,
                "delta": -1.0,
                "gamma": 0.0,
                "theta": 0.00002,
                "vega": 0.0
            }
        }

        self.stock_price = 10.72
        self.ticker = Ticker(id=5, symbol='ZEPP')

    @mock.patch('django.utils.timezone.now')
    def test_initialization(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        call_contract = OptionContract(self.ticker, True, self.intrinio_call_input, self.stock_price)
        # Test contract attributes.
        self.assertEqual(call_contract.is_call, True)
        self.assertEqual(call_contract.contract_symbol, 'ZEPP210820C00015000')
        self.assertEqual(call_contract.expiration, 1629442800)  # 2021-08-20 03:00:00 EST.
        self.assertEqual(call_contract.strike, 15.0)
        self.assertEqual(call_contract.contract_size, 100)

        self.assertEqual(call_contract.last_price, 0.15)
        self.assertEqual(call_contract.last_size, 10)
        self.assertEqual(call_contract.last_trade_date, 1625587392)
        self.assertEqual(call_contract.ask, 0.2)
        self.assertEqual(call_contract.ask_size, 41)
        self.assertEqual(call_contract.bid, 0.15)
        self.assertEqual(call_contract.bid_size, 1)
        self.assertEqual(call_contract.open_interest, 773)
        self.assertEqual(call_contract.volume, 19)
        self.assertAlmostEqual(call_contract.bid_ask_spread, 0.05)
        self.assertEqual(call_contract.days_till_expiration, 229)
        self.assertAlmostEqual(call_contract.mark, 0.175)
        self.assertAlmostEqual(call_contract.to_strike, 4.28)
        self.assertAlmostEqual(call_contract.delta, 0.12004)
        self.assertAlmostEqual(call_contract.gamma, 0.07057)
        self.assertAlmostEqual(call_contract.theta, -0.00641)
        self.assertAlmostEqual(call_contract.vega, 0.00735)
