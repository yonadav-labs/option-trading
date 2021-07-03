from datetime import datetime, timedelta
from unittest import mock

from django.test import TestCase
from django.utils.timezone import make_aware, get_default_timezone
from tiger.core import Cash, Stock, OptionContract, OptionLeg, CashLeg, StockLeg
from tiger.core.trade import LongCall, LongPut, CoveredCall, CashSecuredPut, BullPutSpread, BullCallSpread, \
    BearCallSpread, BearPutSpread, Trade, LongStraddle, LongStrangle, IronCondor, IronButterfly, ShortStrangle, \
    ShortStraddle, LongButterflySpread, ShortButterflySpread, LongCondorSpread, ShortCondorSpread, StrapStraddle, \
    StrapStrangle, ProtectivePut
from tiger.models import Ticker, TickerStats

MOCK_NOW_TIMESTAMP = 1609664400  # 01/03/2021


class CallTradesTestCase(TestCase):
    def setUp(self):
        self.td_input = {
            "symbol": "TSLA210716C00288000",
            "strikePrice": 288.0,
            "last": 156.75,
            "netChange": -23.5,
            "percentChange": -13.037448,
            "totalVolume": 1,
            "openInterest": 15,
            "bid": 160.25,
            "ask": 163.15,
            # mid: 161.7
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 66.49966361999513,
            "inTheMoney": True
        }
        self.td_input2 = {
            "symbol": "TSLA210219P00445000",
            "strikePrice": 445.0,
            "last": 74.0,
            "netChange": -1.0,
            "percentChange": -1.3333334,
            "totalVolume": 1,
            "openInterest": 203,
            "bid": 75.5,
            "ask": 77.2,
            # mid: 76.35
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 64.74034283447265,
            "inTheMoney": False
        }
        self.td_input3 = {
            "symbol": "TSLA210219P00445000",
            "strikePrice": 324.0,
            "last": 74.0,
            "netChange": -1.0,
            "percentChange": -1.3333334,
            "totalVolume": 1,
            "openInterest": 203,
            "bid": 75.5,
            "ask": 77.2,
            # mid: 76.35
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 64.74034283447265,
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
        call_contract = OptionContract(self.ticker, True, self.td_input, self.stock_price, 'mid')
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
        self.assertAlmostEqual(long_call.stock.historical_volatility, 0.8)
        self.assertAlmostEqual(long_call.sigma, 0.5941513889707513)
        self.assertSequenceEqual(long_call.get_ten_percent_prices_and_returns(is_profit=True),
                                 [739.8029699365054, 45157.93222438325])
        self.assertSequenceEqual(long_call.get_ten_percent_prices_and_returns(is_profit=False),
                                 [100.19703006349465, -16171.299999999997])
        self.assertAlmostEqual(long_call.ten_percent_best_return_price, 739.8029699365054)
        self.assertAlmostEqual(long_call.ten_percent_best_return, 45157.93222438325)
        self.assertAlmostEqual(long_call.ten_percent_best_return_ratio, 2.7924738409641314)
        self.assertAlmostEqual(long_call.ten_percent_worst_return_price, 100.19703006349465)
        self.assertAlmostEqual(long_call.ten_percent_worst_return, -16171.3)
        self.assertAlmostEqual(long_call.ten_percent_worst_return_ratio, -1.0)

        self.assertAlmostEqual(
            LongCall.build(self.stock, call_contract, 'mid', self.broker_settings, 580, 620).target_price_profit,
            15028.7)
        self.assertAlmostEqual(
            LongCall.build(self.stock, call_contract, 'mid', self.broker_settings, 349.7, 549.7).target_price_profit,
            -1.3)
        self.assertAlmostEqual(
            LongCall.build(self.stock, call_contract, 'mid', self.broker_settings, 260, 280).target_price_profit,
            -16171.3)
        self.assertAlmostEqual(long_call.best_return, 'infinite')
        self.assertAlmostEqual(long_call.worst_return, -16171.3)
        self.assertEqual(len(long_call.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(long_call.break_evens[0], 449.713)
        self.assertAlmostEqual(long_call.break_even_prices_and_ratios[0]['ratio'], 0.07074523809523801)
        self.assertIsNone(long_call.reward_to_risk_ratio)

    def test_organized_option_legs(self):
        call_contract_1 = OptionContract(self.ticker, True, self.td_input, self.stock_price, 'mid')
        call_contract_2 = OptionContract(self.ticker, True, self.td_input2, self.stock_price, 'mid')
        call_contract_3 = OptionContract(self.ticker, True, self.td_input3, self.stock_price, 'mid')
        put_contract_1 = OptionContract(self.ticker, False, self.td_input, self.stock_price, 'mid')
        put_contract_2 = OptionContract(self.ticker, False, self.td_input2, self.stock_price, 'mid')
        # long call 1626393600 $288
        call_leg_1 = OptionLeg(True, 1, call_contract_1, 'mid', self.broker_settings)
        # long call 1626393600 $445
        call_leg_2 = OptionLeg(True, 1, call_contract_2, 'mid', self.broker_settings)
        # short call 1626393600 $288
        call_leg_3 = OptionLeg(False, 1, call_contract_1, 'mid', self.broker_settings)
        # short call 1626393600 $445
        call_leg_4 = OptionLeg(False, 1, call_contract_2, 'mid', self.broker_settings)
        # short call 1626374800 $324
        call_leg_5 = OptionLeg(False, 1, call_contract_3, 'mid', self.broker_settings)
        # long put 1626393600 $288
        put_leg_1 = OptionLeg(True, 1, put_contract_1, 'mid', self.broker_settings)
        # long put 1626393600 $445
        put_leg_2 = OptionLeg(True, 1, put_contract_2, 'mid', self.broker_settings)
        # short put 1626393600 $288
        put_leg_3 = OptionLeg(False, 1, put_contract_1, 'mid', self.broker_settings)
        # short put 1626393600 $445
        put_leg_4 = OptionLeg(False, 1, put_contract_2, 'mid', self.broker_settings)

        class CustomTrade(Trade):
            def __init__(self, stock, legs, premium_type, target_price_lower=None, target_price_upper=None):
                super().__init__('custom', stock, legs, premium_type, target_price_lower, target_price_upper)

            def validate(self):
                pass

            @property
            def is_bullish(self):
                return False

        new_trade = CustomTrade(self.stock, [call_leg_1, call_leg_2, call_leg_3,
                                             call_leg_4, call_leg_5, put_leg_1, put_leg_2, put_leg_3, put_leg_4], 'mid')
        # should be 3 short calls
        self.assertEqual(len(new_trade.organized_option_legs['short']['call']), 3)
        # should be 2 long calls
        self.assertEqual(len(new_trade.organized_option_legs['long']['call']), 2)
        # should be 2 short puts
        self.assertEqual(len(new_trade.organized_option_legs['short']['put']), 2)
        # should be 2 long puts
        self.assertEqual(len(new_trade.organized_option_legs['long']['put']), 2)
        # expirations should be ordered
        self.assertLessEqual(new_trade.get_nth_option_leg('short', 'call', 0).contract.expiration,
                             new_trade.get_nth_option_leg('short', 'call', 1).contract.expiration)
        # strikes should be ordered
        self.assertLessEqual(new_trade.get_nth_option_leg('long', 'call', 0).contract.strike,
                             new_trade.get_nth_option_leg('long', 'call', 1).contract.strike)
        # 3rd short call should be call_leg_3 since they are sorted by expiration then strike
        self.assertEqual(new_trade.get_nth_option_leg('short', 'call', 2).contract.contract_symbol,
                         call_leg_4.contract.contract_symbol)

    def test_value_in_price_range(self):
        call_contract = OptionContract(self.ticker, True, self.td_input, self.stock_price)
        self.assertAlmostEqual(call_contract.get_value_in_price_range(100, 102), 0.0)
        self.assertAlmostEqual(call_contract.get_value_in_price_range(300, 310), 1700.0)
        self.assertAlmostEqual(call_contract.get_value_in_price_range(278, 298), 250.0)

        long_call_leg = OptionLeg(True, 2, call_contract, 'mid', self.broker_settings)
        self.assertAlmostEqual(long_call_leg.get_value_in_price_range(100, 102), 0.0)
        self.assertAlmostEqual(long_call_leg.get_value_in_price_range(300, 310), 3400.0)
        self.assertAlmostEqual(long_call_leg.get_value_in_price_range(278, 298), 500.0)
        self.assertAlmostEqual(long_call_leg.get_return_at_expiration(100, 102), -32341.3)
        self.assertAlmostEqual(long_call_leg.get_return_at_expiration(300, 310), -28941.3)
        self.assertAlmostEqual(long_call_leg.get_return_at_expiration(278, 298), -31841.3)
        self.assertAlmostEqual(long_call_leg.get_return_at_expiration(449.7, 449.7), -1.3)

        short_call_leg = OptionLeg(False, 2, call_contract, 'mid', self.broker_settings)
        self.assertAlmostEqual(short_call_leg.get_value_in_price_range(100, 102), 0.0)
        self.assertAlmostEqual(short_call_leg.get_value_in_price_range(300, 310), -3400.0)
        self.assertAlmostEqual(short_call_leg.get_value_in_price_range(278, 298), -500.0)
        self.assertAlmostEqual(short_call_leg.get_return_at_expiration(100, 102), 32338.7)
        self.assertAlmostEqual(short_call_leg.get_return_at_expiration(300, 310), 28938.7)
        self.assertAlmostEqual(short_call_leg.get_return_at_expiration(278, 298), 31838.7)

        cash = Cash()
        self.assertAlmostEqual(cash.get_value_in_price_range(10, 10000), 1.0)

        stock = Stock(self.ticker, self.stock_price)
        self.assertAlmostEqual(stock.get_value_in_price_range(10, 50), 30.0)

    @mock.patch('django.utils.timezone.now')
    def test_missing_bid_or_ask(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        # Missing bid.
        td_input = dict(self.td_input)
        td_input.pop('bid', None)
        call_contract = OptionContract(self.ticker, True, td_input, self.stock_price)
        self.assertEqual(call_contract.ask, 163.15)
        self.assertEqual(call_contract.bid, None)
        self.assertAlmostEqual(call_contract.mark, 163.15)
        # Missing ask.
        td_input = dict(self.td_input)
        td_input.pop('ask', None)
        call_contract = OptionContract(self.ticker, True, td_input, self.stock_price)
        self.assertEqual(call_contract.ask, None)
        self.assertEqual(call_contract.bid, 160.25)
        self.assertAlmostEqual(call_contract.mark, 160.25)
        # Missing both bid and ask but have last price.
        td_input = dict(self.td_input)
        td_input.pop('bid', None)
        td_input.pop('ask', None)
        call_contract = OptionContract(self.ticker, True, td_input, self.stock_price)
        self.assertAlmostEqual(call_contract.mark, 156.75)
        # Missing bid, ask and last price.
        td_input = dict(self.td_input)
        td_input.pop('bid', None)
        td_input.pop('ask', None)
        td_input.pop('last', None)
        with self.assertRaises(ValueError):
            OptionContract(self.ticker, True, td_input, self.stock_price)
        # All bid, ask and last price are 0.
        td_input = dict(self.td_input)
        td_input['bid'] = 0.0
        td_input['ask'] = 0.0
        td_input['last'] = 0.0
        with self.assertRaises(ValueError):
            OptionContract(self.ticker, True, td_input, self.stock_price)

    @mock.patch('django.utils.timezone.now')
    def test_sell_covered_call(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())

        call_contract = OptionContract(self.ticker, True, self.td_input, self.stock_price)
        sell_call = CoveredCall.build(self.stock, call_contract, 'mid', self.broker_settings, target_price_lower=258.3,
                                      target_price_upper=258.3)
        self.assertEqual(call_contract.to_strike, -132.0)
        self.assertAlmostEqual(call_contract.to_strike_ratio, -0.31428571428)
        self.assertAlmostEqual(sell_call.best_return, 2968.7)
        self.assertAlmostEqual(sell_call.target_price_profit, -1.3)
        self.assertAlmostEqual(sell_call.cost, 25831.3)
        self.assertAlmostEqual(sell_call.worst_return, -sell_call.cost)
        self.assertEqual(len(sell_call.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(sell_call.break_evens[0], 258.313)
        self.assertAlmostEqual(sell_call.reward_to_risk_ratio, 0.11492646517)

        self.assertAlmostEqual(
            CoveredCall.build(self.stock, call_contract, 'mid', self.broker_settings, 100, 120).target_price_profit,
            -14831.3)
        self.assertAlmostEqual(
            CoveredCall.build(self.stock, call_contract, 'mid', self.broker_settings, 300, 310).target_price_profit,
            2968.7)
        self.assertAlmostEqual(
            CoveredCall.build(self.stock, call_contract, 'mid', self.broker_settings, 278, 298).target_price_profit,
            2718.7)

        call_contract = OptionContract(self.ticker, True, self.td_input2, self.stock_price)
        sell_call = CoveredCall.build(self.stock, call_contract, 'mid', self.broker_settings)
        self.assertEqual(call_contract.to_strike, 25.0)
        self.assertAlmostEqual(call_contract.to_strike_ratio, 0.05952380952)
        self.assertAlmostEqual(sell_call.best_return, 10133.7)
        self.assertAlmostEqual(sell_call.worst_return, -sell_call.cost)
        self.assertEqual(len(sell_call.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(sell_call.break_evens[0], 343.663)
        self.assertAlmostEqual(sell_call.reward_to_risk_ratio, 0.29487317517)

    @mock.patch('django.utils.timezone.now')
    def test_bull_call_spread(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        call_contract_1 = OptionContract(self.ticker, True, self.td_input, self.stock_price, 'mid')
        call_contract_2 = OptionContract(self.ticker, True, self.td_input2, self.stock_price, 'mid')
        bull_call_spread = BullCallSpread.build(self.stock, call_contract_1, call_contract_2, 'mid',
                                                self.broker_settings, 400, 400, available_cash=10000)
        self.assertAlmostEqual(bull_call_spread.cost, 8537.6)
        self.assertAlmostEqual(bull_call_spread.best_return, 7162.4)  # ((445 - 288) - 85.35) * 100
        self.assertAlmostEqual(bull_call_spread.target_price_profit, 2662.4)  # ((400 - 288) - 85.35) * 100
        self.assertAlmostEqual(bull_call_spread.worst_return, -bull_call_spread.cost)
        self.assertEqual(len(bull_call_spread.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(bull_call_spread.break_evens[0], 373.376)
        self.assertAlmostEqual(bull_call_spread.reward_to_risk_ratio, 0.83892428785)

    @mock.patch('django.utils.timezone.now')
    def test_bear_call_spread(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        call_contract_1 = OptionContract(self.ticker, True, self.td_input, self.stock_price, 'mid')
        call_contract_2 = OptionContract(self.ticker, True, self.td_input2, self.stock_price, 'mid')
        bear_call_spread = BearCallSpread.build(self.stock, call_contract_1, call_contract_2, 'mid',
                                                self.broker_settings, 400, 400, available_cash=10000)
        self.assertAlmostEqual(bear_call_spread.cost, 7167.6)
        self.assertAlmostEqual(bear_call_spread.best_return, 8532.4)
        self.assertAlmostEqual(bear_call_spread.target_price_profit, -2667.6)
        self.assertAlmostEqual(bear_call_spread.worst_return, -bear_call_spread.cost)
        self.assertEqual(len(bear_call_spread.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(bear_call_spread.break_evens[0], 373.324)
        self.assertAlmostEqual(bear_call_spread.reward_to_risk_ratio, 1.19041241140)

    def test_option_leg_premium_type(self):
        call_contract = OptionContract(self.ticker, True, self.td_input, self.stock_price)
        self.assertAlmostEqual(OptionLeg(True, 2, call_contract, 'mid',
                                         self.broker_settings).total_cost, 16170 * 2 + 1.3)
        self.assertAlmostEqual(OptionLeg(True, 2, call_contract, 'market',
                                         self.broker_settings).total_cost, 16315 * 2 + 1.3)
        self.assertAlmostEqual(OptionLeg(False, 2, call_contract, 'mid',
                                         self.broker_settings).total_cost, -16170 * 2 + 1.3)
        self.assertAlmostEqual(OptionLeg(False, 2, call_contract, 'market',
                                         self.broker_settings).total_cost, -16025 * 2 + 1.3)


class PutTradesTestCase(TestCase):
    def setUp(self):
        self.td_input = {
            "symbol": "QQQE210115P00068000",
            "strikePrice": 68.0,
            "last": 0.65,
            "netChange": 0.65,
            "totalVolume": 3,
            "openInterest": 10,
            "bid": 0.4,
            "ask": 1.0,
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 32.031929687499994,
            "inTheMoney": False
        }

        self.td_input2 = {
            "symbol": "QQQE210115P00074000",
            "strikePrice": 74.0,
            "last": 2.65,
            "netChange": 0.65,
            "totalVolume": 3,
            "openInterest": 10,
            "bid": 2.4,
            "ask": 3.0,
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 26.031929687499994,
            "inTheMoney": True
        }

        self.td_input3 = {
            "symbol": "QQQE210115P00074000",
            "strikePrice": 68.0,
            "last": 2.65,
            "netChange": 0.65,
            "totalVolume": 3,
            "openInterest": 10,
            "bid": 2.4,
            "ask": 3.0,
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 26.031929687499994,
            "inTheMoney": True
        }

        self.td_input4 = {
            "symbol": "QQQE210115P00068000",
            "strikePrice": 77.0,
            "last": 0.65,
            "netChange": 0.65,
            "totalVolume": 3,
            "openInterest": 10,
            "bid": 0.4,
            "ask": 1.0,
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 32.031929687499994,
            "inTheMoney": False
        }

        self.td_input5 = {
            "symbol": "QQQE210115P00068000",
            "strikePrice": 63.0,
            "last": 0.65,
            "netChange": 0.65,
            "totalVolume": 3,
            "openInterest": 10,
            "bid": 0.1,
            "ask": 0.5,
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 32.031929687499994,
            "inTheMoney": False
        }

        self.td_input6 = {
            "symbol": "QQQE210115P00068000",
            "strikePrice": 77.0,
            "last": 0.65,
            "netChange": 0.65,
            "totalVolume": 3,
            "openInterest": 10,
            "bid": 0.9,
            "ask": 1.0,
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 32.031929687499994,
            "inTheMoney": False
        }

        self.td_input7 = {
            "symbol": "QQQE210115P00068000",
            "strikePrice": 70.0,
            "last": 0.65,
            "netChange": 0.65,
            "totalVolume": 3,
            "openInterest": 10,
            "bid": 0.3,
            "ask": 0.8,
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 32.031929687499994,
            "inTheMoney": False
        }

        self.td_input8 = {
            "symbol": "QQQE210115P00068000",
            "strikePrice": 80.0,
            "last": 0.65,
            "netChange": 0.65,
            "totalVolume": 3,
            "openInterest": 10,
            "bid": 0.3,
            "ask": 0.4,
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 32.031929687499994,
            "inTheMoney": False
        }

        self.td_input9 = {
            "symbol": "QQQE210115P00068000",
            "strikePrice": 65.0,
            "last": 0.65,
            "netChange": 0.65,
            "totalVolume": 3,
            "openInterest": 10,
            "bid": 2.1,
            "ask": 2.8,
            "multiplier": 100,
            "expirationDate": 1626465600000,
            "tradeTimeInLong": 1626393600000,
            "volatility": 32.031929687499994,
            "inTheMoney": False
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
        put_contract = OptionContract(self.ticker, False, self.td_input, self.stock_price)
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
        self.assertAlmostEqual(sell_put.target_price_profit, -1.3)
        self.assertAlmostEqual(sell_put.best_return, 68.7)
        self.assertAlmostEqual(sell_put.worst_return, -sell_put.cost)
        self.assertEqual(len(sell_put.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(sell_put.break_evens[0], 67.313)
        self.assertAlmostEqual(sell_put.break_even_prices_and_ratios[0]['ratio'], -0.0847994561522773)
        self.assertAlmostEqual(sell_put.reward_to_risk_ratio, 0.01020605232)

    @mock.patch('django.utils.timezone.now')
    def test_buy_put(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())
        put_contract = OptionContract(self.ticker, False, self.td_input, self.stock_price)
        long_put = LongPut.build(self.stock, put_contract, 'mid', self.broker_settings, target_price_lower=65.0,
                                 target_price_upper=65.0)

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
        self.assertAlmostEqual(long_put.target_price_profit, 228.7)
        self.assertAlmostEqual(long_put.target_price_profit_ratio, 3.20757363253)
        self.assertAlmostEqual(long_put.to_target_price_lower_ratio, -0.11624745071)
        self.assertAlmostEqual(long_put.best_return, 6728.7)
        self.assertAlmostEqual(long_put.worst_return, -long_put.cost)
        self.assertEqual(len(long_put.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(long_put.break_evens[0], 67.287)
        self.assertAlmostEqual(long_put.break_even_prices_and_ratios[0]['ratio'], -0.08515295717199192)
        self.assertAlmostEqual(long_put.reward_to_risk_ratio, 94.3716690042)

    def test_value_in_price_range(self):
        put_contract = OptionContract(self.ticker, False, self.td_input, self.stock_price)
        self.assertEqual(put_contract.get_value_in_price_range(90, 102), 0.0)
        self.assertEqual(put_contract.get_value_in_price_range(55, 65), 800.0)
        self.assertEqual(put_contract.get_value_in_price_range(63, 73), 125.0)

        long_put_leg = OptionLeg(True, 2, put_contract, 'mid', self.broker_settings)
        self.assertAlmostEqual(long_put_leg.get_value_in_price_range(90, 102), 0.0)
        self.assertAlmostEqual(long_put_leg.get_value_in_price_range(55, 65), 1600.0)
        self.assertAlmostEqual(long_put_leg.get_value_in_price_range(63, 73), 250.0)
        self.assertAlmostEqual(long_put_leg.get_return_at_expiration(90, 102), -141.3)
        self.assertAlmostEqual(long_put_leg.get_return_at_expiration(55, 65), 1458.7)
        self.assertAlmostEqual(long_put_leg.get_return_at_expiration(63, 73), 108.7)
        self.assertAlmostEqual(long_put_leg.get_return_at_expiration(67.3, 67.3), -1.3)

    def test_bear_put_spread(self):
        put_contract_1 = OptionContract(self.ticker, False, self.td_input, self.stock_price, 'mid')
        put_contract_2 = OptionContract(self.ticker, False, self.td_input2, self.stock_price, 'mid')
        bear_put_spread = BearPutSpread.build(self.stock, put_contract_1, put_contract_2, 'mid',
                                              self.broker_settings, 70, 70)
        self.assertAlmostEqual(bear_put_spread.cost, 202.6)
        self.assertAlmostEqual(bear_put_spread.best_return, 397.4)
        self.assertAlmostEqual(bear_put_spread.target_price_profit, 197.4)
        self.assertAlmostEqual(bear_put_spread.worst_return, -bear_put_spread.cost)
        self.assertEqual(len(bear_put_spread.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(bear_put_spread.break_evens[0], 71.974)
        self.assertAlmostEqual(bear_put_spread.reward_to_risk_ratio, 1.96150049358)

    def test_bull_put_spread(self):
        put_contract_1 = OptionContract(self.ticker, False, self.td_input, self.stock_price, 'mid')
        put_contract_2 = OptionContract(self.ticker, False, self.td_input2, self.stock_price, 'mid')
        bull_put_spread = BullPutSpread.build(self.stock, put_contract_1, put_contract_2, 'mid',
                                              self.broker_settings, 70, 70)
        self.assertAlmostEqual(bull_put_spread.cost, 402.6)
        self.assertAlmostEqual(bull_put_spread.best_return, 197.4)
        self.assertAlmostEqual(bull_put_spread.target_price_profit, -202.6)
        self.assertAlmostEqual(bull_put_spread.worst_return, -bull_put_spread.cost)
        self.assertEqual(len(bull_put_spread.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(bull_put_spread.break_evens[0], 72.026)
        self.assertAlmostEqual(bull_put_spread.reward_to_risk_ratio, 0.49031296572)

    def test_long_straddle(self):
        call_contract = OptionContract(self.ticker, True, self.td_input3, self.stock_price, 'mid')
        put_contract = OptionContract(self.ticker, False, self.td_input, self.stock_price, 'mid')
        long_straddle = LongStraddle.build(self.stock, call_contract, put_contract, 'mid', self.broker_settings, 75, 75)
        self.assertAlmostEqual(long_straddle.cost, 342.6)
        self.assertEqual(long_straddle.best_return, 'infinite')
        self.assertAlmostEqual(long_straddle.target_price_profit, 357.4)
        self.assertAlmostEqual(long_straddle.worst_return, -long_straddle.cost)
        self.assertEqual(len(long_straddle.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(long_straddle.break_evens[0], 64.574)
        self.assertAlmostEqual(long_straddle.break_evens[1], 71.426)
        self.assertEqual(long_straddle.reward_to_risk_ratio, None)

    def test_long_butterfly_spread(self):
        call_contract = OptionContract(self.ticker, True, self.td_input, self.stock_price, 'mid')
        call_contract2 = OptionContract(self.ticker, True, self.td_input6, self.stock_price, 'mid')
        call_contract3 = OptionContract(self.ticker, True, self.td_input7, self.stock_price, 'mid')
        long_butterfly_spread = LongButterflySpread.build(
            self.stock, call_contract, call_contract2, call_contract3, 'mid', self.broker_settings, 73.55, 73.55)
        self.assertAlmostEqual(long_butterfly_spread.cost, 58.9)
        self.assertAlmostEqual(long_butterfly_spread.best_return, 141.1)
        self.assertAlmostEqual(long_butterfly_spread.target_price_profit, -213.9)
        self.assertAlmostEqual(long_butterfly_spread.worst_return, -558.9)
        self.assertEqual(len(long_butterfly_spread.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(long_butterfly_spread.break_evens[0], 68.589)
        self.assertAlmostEqual(long_butterfly_spread.break_evens[1], 71.411)
        self.assertAlmostEqual(long_butterfly_spread.reward_to_risk_ratio, 0.2524601896582573)

    def test_short_butterfly_spread(self):
        call_contract = OptionContract(self.ticker, True, self.td_input, self.stock_price, 'mid')
        call_contract2 = OptionContract(self.ticker, True, self.td_input6, self.stock_price, 'mid')
        call_contract3 = OptionContract(self.ticker, True, self.td_input7, self.stock_price, 'mid')
        short_butterfly_spread = ShortButterflySpread.build(
            self.stock, call_contract, call_contract2, call_contract3, 'mid', self.broker_settings, 73.55, 73.55)
        self.assertAlmostEqual(short_butterfly_spread.cost, -51.1)
        self.assertAlmostEqual(short_butterfly_spread.best_return, 551.1)
        self.assertAlmostEqual(short_butterfly_spread.target_price_profit, 206.1)
        self.assertAlmostEqual(short_butterfly_spread.worst_return, -148.9)
        self.assertEqual(len(short_butterfly_spread.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(short_butterfly_spread.break_evens[0], 68.511)
        self.assertAlmostEqual(short_butterfly_spread.break_evens[1], 71.489)
        self.assertAlmostEqual(short_butterfly_spread.reward_to_risk_ratio, 3.701141705842848)

    def test_short_straddle(self):
        call_contract = OptionContract(self.ticker, True, self.td_input3, self.stock_price, 'mid')
        put_contract = OptionContract(self.ticker, False, self.td_input, self.stock_price, 'mid')
        short_straddle = ShortStraddle.build(self.stock, call_contract, put_contract,
                                             'mid', self.broker_settings, 68, 68)
        self.assertAlmostEqual(short_straddle.cost, -337.4)
        self.assertAlmostEqual(short_straddle.best_return, -short_straddle.cost)
        self.assertAlmostEqual(short_straddle.target_price_profit, 337.4)
        self.assertEqual(short_straddle.worst_return, 'infinite')
        self.assertEqual(len(short_straddle.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(short_straddle.break_evens[0], 64.626)
        self.assertAlmostEqual(short_straddle.break_evens[1], 71.374)
        self.assertEqual(short_straddle.reward_to_risk_ratio, None)

    def test_short_strangle(self):
        call_contract = OptionContract(self.ticker, True, self.td_input2, self.stock_price, 'mid')
        put_contract = OptionContract(self.ticker, False, self.td_input, self.stock_price, 'mid')
        short_strangle = ShortStrangle.build(self.stock, call_contract, put_contract,
                                             'mid', self.broker_settings, 69, 69)
        self.assertAlmostEqual(short_strangle.cost, -337.4)
        self.assertEqual(short_strangle.best_return, -short_strangle.cost)
        self.assertAlmostEqual(short_strangle.target_price_profit, 337.4)
        self.assertAlmostEqual(short_strangle.worst_return, 'infinite')
        self.assertEqual(len(short_strangle.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(short_strangle.break_evens[0], 64.626)
        self.assertAlmostEqual(short_strangle.break_evens[1], 77.374)
        self.assertEqual(short_strangle.reward_to_risk_ratio, None)

    def test_iron_butterfly(self):
        call_contract = OptionContract(self.ticker, True, self.td_input4, self.stock_price, 'mid')
        call_contract2 = OptionContract(self.ticker, True, self.td_input, self.stock_price, 'mid')
        put_contract = OptionContract(self.ticker, False, self.td_input5, self.stock_price, 'mid')
        put_contract2 = OptionContract(self.ticker, False, self.td_input3, self.stock_price, 'mid')
        iron_butterfly = IronButterfly.build(self.stock, call_contract, call_contract2,
                                             put_contract, put_contract2, 'mid', self.broker_settings, 70, 70)
        self.assertAlmostEqual(iron_butterfly.cost, -234.8)
        self.assertAlmostEqual(iron_butterfly.best_return, -iron_butterfly.cost)
        self.assertAlmostEqual(iron_butterfly.target_price_profit, 34.8)
        self.assertAlmostEqual(iron_butterfly.worst_return, -665.2)
        self.assertEqual(len(iron_butterfly.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(iron_butterfly.break_evens[0], 65.652)
        self.assertAlmostEqual(iron_butterfly.break_evens[1], 70.348)
        self.assertEqual(iron_butterfly.reward_to_risk_ratio, 0.3529765484064943)

    def test_iron_condor(self):
        call_contract = OptionContract(self.ticker, True, self.td_input4, self.stock_price, 'mid')
        call_contract2 = OptionContract(self.ticker, True, self.td_input2, self.stock_price, 'mid')
        put_contract = OptionContract(self.ticker, False, self.td_input5, self.stock_price, 'mid')
        put_contract2 = OptionContract(self.ticker, False, self.td_input, self.stock_price, 'mid')
        iron_condor = IronCondor.build(self.stock, call_contract, call_contract2,
                                       put_contract, put_contract2, 'mid', self.broker_settings, 70, 70)
        self.assertAlmostEqual(iron_condor.cost, -234.8)
        self.assertAlmostEqual(iron_condor.best_return, -iron_condor.cost)
        self.assertAlmostEqual(iron_condor.target_price_profit, 234.8)
        self.assertAlmostEqual(iron_condor.worst_return, -265.2)
        self.assertEqual(len(iron_condor.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(iron_condor.break_evens[0], 65.652)
        self.assertAlmostEqual(iron_condor.break_evens[1], 76.348)
        self.assertEqual(iron_condor.reward_to_risk_ratio, 0.8853695324283536)

    def test_long_strangle(self):
        call_contract = OptionContract(self.ticker, True, self.td_input2, self.stock_price, 'mid')
        put_contract = OptionContract(self.ticker, False, self.td_input, self.stock_price, 'mid')
        long_strangle = LongStrangle.build(self.stock, call_contract, put_contract, 'mid', self.broker_settings, 85, 85)
        self.assertAlmostEqual(long_strangle.cost, 342.6)
        self.assertEqual(long_strangle.best_return, 'infinite')
        self.assertAlmostEqual(long_strangle.target_price_profit, 757.4)
        self.assertAlmostEqual(long_strangle.worst_return, -long_strangle.cost)
        self.assertEqual(len(long_strangle.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(long_strangle.break_evens[0], 64.574)
        self.assertAlmostEqual(long_strangle.break_evens[1], 77.426)
        self.assertEqual(long_strangle.reward_to_risk_ratio, None)

    def test_long_condor_spread(self):
        left_put_contract = OptionContract(self.ticker, False, self.td_input7, self.stock_price, 'mid')
        left_put_contract2 = OptionContract(self.ticker, False, self.td_input9, self.stock_price, 'mid')
        right_put_contract = OptionContract(self.ticker, False, self.td_input6, self.stock_price, 'mid')
        right_put_contract2 = OptionContract(self.ticker, False, self.td_input8, self.stock_price, 'mid')
        long_condor_spread = LongCondorSpread.build(self.stock, left_put_contract, left_put_contract2,
                                                    right_put_contract, right_put_contract2, 'mid',
                                                    self.broker_settings, 70, 70)
        self.assertAlmostEqual(long_condor_spread.cost, 135.2)
        self.assertAlmostEqual(long_condor_spread.best_return, 164.8)
        self.assertAlmostEqual(long_condor_spread.target_price_profit, 164.8)
        self.assertAlmostEqual(long_condor_spread.worst_return, -335.2)
        self.assertEqual(len(long_condor_spread.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(long_condor_spread.break_evens[0], 68.352)
        self.assertAlmostEqual(long_condor_spread.break_evens[1], 78.648)
        self.assertAlmostEqual(long_condor_spread.reward_to_risk_ratio, 0.4916467780429594)

    def test_short_condor_spread(self):
        left_put_contract = OptionContract(self.ticker, False, self.td_input6, self.stock_price, 'mid')
        left_put_contract2 = OptionContract(self.ticker, False, self.td_input8, self.stock_price, 'mid')
        right_put_contract = OptionContract(self.ticker, False, self.td_input7, self.stock_price, 'mid')
        right_put_contract2 = OptionContract(self.ticker, False, self.td_input9, self.stock_price, 'mid')
        short_condor_spread = ShortCondorSpread.build(self.stock, left_put_contract, left_put_contract2,
                                                      right_put_contract, right_put_contract2, 'mid',
                                                      self.broker_settings, 100, 100)
        self.assertAlmostEqual(short_condor_spread.cost, -124.8)
        self.assertAlmostEqual(short_condor_spread.best_return, 324.8)
        self.assertAlmostEqual(short_condor_spread.target_price_profit, -short_condor_spread.cost)
        self.assertAlmostEqual(short_condor_spread.worst_return, -175.2)
        self.assertEqual(len(short_condor_spread.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(short_condor_spread.break_evens[0], 68.248)
        self.assertAlmostEqual(short_condor_spread.break_evens[1], 78.752)
        self.assertAlmostEqual(short_condor_spread.reward_to_risk_ratio, 1.853881278538813)

    def test_strap_straddle(self):
        call_contract = OptionContract(self.ticker, True, self.td_input3, self.stock_price, 'mid')
        put_contract = OptionContract(self.ticker, False, self.td_input, self.stock_price, 'mid')
        strap_straddle = StrapStraddle.build(self.stock, call_contract, put_contract,
                                             'mid', self.broker_settings, 75, 75)
        self.assertAlmostEqual(strap_straddle.cost, 612.6)
        self.assertEqual(strap_straddle.best_return, 'infinite')
        self.assertAlmostEqual(strap_straddle.target_price_profit, 787.4)
        self.assertAlmostEqual(strap_straddle.worst_return, -strap_straddle.cost)
        self.assertEqual(len(strap_straddle.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(strap_straddle.break_evens[0], 61.874)
        self.assertAlmostEqual(strap_straddle.break_evens[1], 71.063)
        self.assertEqual(strap_straddle.reward_to_risk_ratio, None)

    def test_strap_strangle(self):
        call_contract = OptionContract(self.ticker, True, self.td_input2, self.stock_price, 'mid')
        put_contract = OptionContract(self.ticker, False, self.td_input, self.stock_price, 'mid')
        strap_strangle = StrapStrangle.build(self.stock, call_contract, put_contract,
                                             'mid', self.broker_settings, 85, 85)
        self.assertAlmostEqual(strap_strangle.cost, 612.6)
        self.assertEqual(strap_strangle.best_return, 'infinite')
        self.assertAlmostEqual(strap_strangle.target_price_profit, 1587.4)
        self.assertAlmostEqual(strap_strangle.worst_return, -strap_strangle.cost)
        self.assertEqual(len(strap_strangle.break_evens), 2)
        # includes commission cost
        self.assertAlmostEqual(strap_strangle.break_evens[0], 61.874)
        self.assertAlmostEqual(strap_strangle.break_evens[1], 77.063)
        self.assertEqual(strap_strangle.reward_to_risk_ratio, None)

    def test_protective_put(self):
        put_contract = OptionContract(self.ticker, False, self.td_input, self.stock_price)
        protective_put = ProtectivePut.build(self.stock, put_contract, 'mid', self.broker_settings,
                                             target_price_lower=258.3,
                                             target_price_upper=258.3)
        self.assertAlmostEqual(protective_put.cost, 7426.3)
        self.assertEqual(protective_put.best_return, 'infinite')
        self.assertAlmostEqual(protective_put.target_price_profit, 18403.7)
        self.assertAlmostEqual(protective_put.worst_return, -626.3)
        self.assertEqual(len(protective_put.break_evens), 1)
        # includes commission cost
        self.assertAlmostEqual(protective_put.break_evens[0], 74.263)
        self.assertEqual(protective_put.reward_to_risk_ratio, None)


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
        self.assertAlmostEqual(contract.implied_volatility, 0.22763)
        self.assertFalse(contract.in_the_money)
        self.assertEqual(contract.last_price, 2.0)
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


class OptionValueTestCase(TestCase):
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
            "expirationDate": 1626393600000,  # 07/16/2021
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
        self.stock_price = 420.0
        self.ticker = Ticker(id=1, symbol='TSLA')
        self.tickerstats = TickerStats(self.ticker, historical_volatility=0.8)
        self.cash = Cash()
        self.stock = Stock(self.ticker, self.stock_price, None, self.tickerstats)

        self.broker_settings = {
            'open_commission': 0.65,
            'close_commission': 0.65
        }

        base_date = datetime(year=2021, month=5, day=13)
        expiry_date = datetime(year=2021, month=6, day=18)
        self.calculation_dates = [base_date + timedelta(days=i) for i in range((expiry_date - base_date).days + 1)]
        self.underlying_prices = [(380.0 + i * 5.0) for i in range(13)]

    def test_cash_get_value_matrix(self):
        matrix = self.cash.get_value_matrix(self.calculation_dates, self.underlying_prices)
        self.assertEqual(len(matrix), len(self.calculation_dates))
        self.assertEqual(len(matrix[0]), len(self.underlying_prices))
        self.assertEqual(matrix[0][0], 1)
        self.assertEqual(matrix[-1][-1], 1)

    def test_stock_get_value_matrix(self):
        matrix = self.stock.get_value_matrix(self.calculation_dates, self.underlying_prices)
        self.assertEqual(len(matrix), len(self.calculation_dates))
        self.assertEqual(len(matrix[0]), len(self.underlying_prices))
        self.assertEqual(matrix[0][0], self.underlying_prices[0])
        self.assertEqual(matrix[-1][-1], self.underlying_prices[-1])

    def test_longcall_trade_get_value_matrix(self):
        contract = OptionContract(self.ticker, True, self.td_input, self.stock_price, 'mid')

        matrix = contract.get_value_matrix(self.calculation_dates, self.underlying_prices)
        self.assertEqual(len(matrix), len(self.calculation_dates))
        self.assertEqual(len(matrix[self.calculation_dates[0]]), len(self.underlying_prices))
        self.assertEqual(matrix[self.calculation_dates[0]][2][0], 390)
        self.assertAlmostEqual(matrix[self.calculation_dates[0]][2][1], 175.3707, places=3)
        self.assertEqual(matrix[self.calculation_dates[-1]][3][0], 395)
        self.assertAlmostEqual(matrix[self.calculation_dates[-1]][3][1], 180.1589, places=3)

    def test_cash_leg_get_value_matrix(self):
        cash_leg = CashLeg(50)
        matrix = cash_leg.get_value_matrix(self.calculation_dates, self.underlying_prices)
        self.assertEqual(matrix.shape, (len(self.calculation_dates), len(self.underlying_prices)))
        self.assertEqual(matrix.item((0, 0)), 50)
        self.assertEqual(matrix.item((-1, -1)), 50)

    def test_stock_leg_get_value_matrix(self):
        leg = StockLeg(100, self.stock)
        matrix = leg.get_value_matrix(self.calculation_dates, self.underlying_prices)
        self.assertEqual(matrix.shape, (len(self.calculation_dates), len(self.underlying_prices)))
        self.assertEqual(matrix.item((0, 0)), self.underlying_prices[0] * 100)
        self.assertEqual(matrix.item((-1, -1)), self.underlying_prices[-1] * 100)

    def test_option_leg_get_value_matrix(self):
        contract = OptionContract(self.ticker, True, self.td_input, self.stock_price, 'mid')
        leg = OptionLeg(True, 1, contract, 'mid', self.broker_settings)
        matrix = leg.get_value_matrix(self.calculation_dates, self.underlying_prices)
        self.assertEqual(matrix.shape, (len(self.calculation_dates), len(self.underlying_prices)))
        self.assertAlmostEqual(matrix.item((0, 0)), 16537.0772, places=3)
        self.assertAlmostEqual(matrix.item((-1, -1)), 22515.8981, places=3)

        leg = OptionLeg(False, 1, contract, 'mid', self.broker_settings)
        matrix = leg.get_value_matrix(self.calculation_dates, self.underlying_prices)
        self.assertEqual(matrix.shape, (len(self.calculation_dates), len(self.underlying_prices)))
        self.assertAlmostEqual(matrix.item((0, 0)), -16537.0772, places=3)
        self.assertAlmostEqual(matrix.item((-1, -1)), -22515.8981, places=3)
