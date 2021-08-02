from tiger.core.leg import Leg, OptionLeg, CashLeg, StockLeg
from tiger.core.security import Stock

from .bear_call_spread import BearCallSpread
from .bear_put_spread import BearPutSpread
from .bull_call_spread import BullCallSpread
from .bull_put_spread import BullPutSpread
from .cash_secured_put import CashSecuredPut
from .covered_call import CoveredCall
from .iron_butterfly import IronButterfly
from .iron_condor import IronCondor
from .long_butterfly_spread import LongButterflySpread
from .long_call import LongCall
from .long_condor_spread import LongCondorSpread
from .long_put import LongPut
from .long_straddle import LongStraddle
from .long_strangle import LongStrangle
from .protective_put import ProtectivePut
from .short_butterfly_spread import ShortButterflySpread
from .short_call import ShortCall
from .short_condor_spread import ShortCondorSpread
from .short_put import ShortPut
from .short_straddle import ShortStraddle
from .short_strangle import ShortStrangle
from .strap_straddle import StrapStraddle
from .strap_strangle import StrapStrangle


class TradeFactory:
    @staticmethod
    def init_from_snapshot(trade_type, stock_snapshot, leg_snapshots, premium_type, broker_settings,
                           target_price_lower, target_price_upper):
        stock = Stock.from_snapshot(stock_snapshot)
        legs = [Leg.from_snapshot(leg_snapshot, stock.stock_price, premium_type, broker_settings) for leg_snapshot in
                leg_snapshots]

        if trade_type == 'long_call':
            trade_class = LongCall
        elif trade_type == 'short_call':
            trade_class = ShortCall
        elif trade_type == 'long_put':
            trade_class = LongPut
        elif trade_type == 'short_put':
            trade_class = ShortPut
        elif trade_type == 'covered_call':
            trade_class = CoveredCall
        elif trade_type == 'protective_put':
            trade_class = ProtectivePut
        elif trade_type == 'cash_secured_put':
            trade_class = CashSecuredPut
        elif trade_type == 'bull_call_spread':
            trade_class = BullCallSpread
        elif trade_type == 'bear_call_spread':
            trade_class = BearCallSpread
        elif trade_type == 'bear_put_spread':
            trade_class = BearPutSpread
        elif trade_type == 'bull_put_spread':
            trade_class = BullPutSpread
        elif trade_type == 'long_straddle':
            trade_class = LongStraddle
        elif trade_type == 'long_butterfly_spread':
            trade_class = LongButterflySpread
        elif trade_type == 'short_butterfly_spread':
            trade_class = ShortButterflySpread
        elif trade_type == 'long_condor_spread':
            trade_class = LongCondorSpread
        elif trade_type == 'short_condor_spread':
            trade_class = ShortCondorSpread
        elif trade_type == 'short_straddle':
            trade_class = ShortStraddle
        elif trade_type == 'short_strangle':
            trade_class = ShortStrangle
        elif trade_type == 'iron_butterfly':
            trade_class = IronButterfly
        elif trade_type == 'iron_condor':
            trade_class = IronCondor
        elif trade_type == 'long_strangle':
            trade_class = LongStrangle
        elif trade_type == 'strap_straddle':
            trade_class = StrapStraddle
        elif trade_type == 'strap_strangle':
            trade_class = StrapStrangle

        trade = trade_class(trade_type, stock, legs, premium_type=premium_type,
                            target_price_lower=target_price_lower,
                            target_price_upper=target_price_upper)

        return trade

    @staticmethod
    def from_snapshot(trade_snapshot, broker_settings):
        trade = TradeFactory.init_from_snapshot(trade_snapshot.type,
                                                trade_snapshot.stock_snapshot,
                                                trade_snapshot.leg_snapshots.all(),
                                                trade_snapshot.premium_type,
                                                broker_settings,
                                                trade_snapshot.target_price_lower,
                                                trade_snapshot.target_price_upper)

        return trade

    @staticmethod
    def from_snapshot_dict(trade_snapshot, broker_settings):
        trade = TradeFactory.init_from_snapshot(trade_snapshot['type'],
                                                trade_snapshot['stock_snapshot'],
                                                trade_snapshot['leg_snapshots'],
                                                trade_snapshot['premium_type'],
                                                broker_settings,
                                                trade_snapshot.get('target_price_lower'),
                                                trade_snapshot.get('target_price_upper'))

        return trade

    @staticmethod
    def build(type, stock, contracts, premium_type, broker_settings, target_price_lower=None,
              target_price_upper=None, available_cash=None):
        if type == 'long_call':
            return TradeFactory.build_long_call(type, stock, contracts, premium_type, broker_settings,
                                                target_price_lower, target_price_upper, available_cash)
        elif type == 'long_put':
            return TradeFactory.build_long_put(type, stock, contracts, premium_type, broker_settings,
                                               target_price_lower, target_price_upper, available_cash)
        elif type == 'bear_call_spread':
            return TradeFactory.build_bear_call_spread(type, stock, contracts, premium_type, broker_settings,
                                                       target_price_lower, target_price_upper, available_cash)
        elif type == 'bear_put_spread':
            return TradeFactory.build_bear_put_spread(type, stock, contracts, premium_type, broker_settings,
                                                      target_price_lower, target_price_upper, available_cash)
        elif type == 'bull_call_spread':
            return TradeFactory.build_bull_call_spread(type, stock, contracts, premium_type, broker_settings,
                                                       target_price_lower, target_price_upper, available_cash)
        elif type == 'bull_put_spread':
            return TradeFactory.build_bull_put_spread(type, stock, contracts, premium_type, broker_settings,
                                                      target_price_lower, target_price_upper, available_cash)
        elif type == 'cash_secured_put':
            return TradeFactory.build_cash_secured_put(type, stock, contracts, premium_type, broker_settings,
                                                       target_price_lower, target_price_upper, available_cash)
        elif type == 'covered_call':
            return TradeFactory.build_covered_call(type, stock, contracts, premium_type, broker_settings,
                                                   target_price_lower, target_price_upper, available_cash)
        elif type == 'long_straddle':
            return TradeFactory.build_long_straddle(type, stock, contracts, premium_type, broker_settings,
                                                    target_price_lower, target_price_upper, available_cash)
        elif type == 'long_strangle':
            return TradeFactory.build_long_strangle(type, stock, contracts, premium_type, broker_settings,
                                                    target_price_lower, target_price_upper, available_cash)
        elif type == 'iron_butterfly':
            return TradeFactory.build_iron_butterfly(type, stock, contracts, premium_type, broker_settings,
                                                     target_price_lower, target_price_upper, available_cash)
        elif type == 'iron_condor':
            return TradeFactory.build_iron_condor(type, stock, contracts, premium_type, broker_settings,
                                                  target_price_lower, target_price_upper, available_cash)
        elif type == 'long_butterfly_spread':
            return TradeFactory.build_long_butterfly_spread(type, stock, contracts, premium_type, broker_settings,
                                                            target_price_lower, target_price_upper, available_cash)
        elif type == 'long_condor_spread':
            return TradeFactory.build_long_condor_spread(type, stock, contracts, premium_type, broker_settings,
                                                         target_price_lower, target_price_upper, available_cash)
        elif type == 'protective_put':
            return TradeFactory.build_protective_put(type, stock, contracts, premium_type, broker_settings,
                                                     target_price_lower, target_price_upper, available_cash)
        elif type == 'short_butterfly_spread':
            return TradeFactory.build_short_butterfly_spread(type, stock, contracts, premium_type, broker_settings,
                                                             target_price_lower, target_price_upper, available_cash)
        elif type == 'short_call':
            return TradeFactory.build_short_call(type, stock, contracts, premium_type, broker_settings,
                                                 target_price_lower, target_price_upper, available_cash)
        elif type == 'short_condor_spread':
            return TradeFactory.build_short_condor_spread(type, stock, contracts, premium_type, broker_settings,
                                                          target_price_lower, target_price_upper, available_cash)
        elif type == 'short_put':
            return TradeFactory.build_short_put(type, stock, contracts, premium_type, broker_settings,
                                                target_price_lower, target_price_upper, available_cash)
        elif type == 'short_straddle':
            return TradeFactory.build_short_straddle(type, stock, contracts, premium_type, broker_settings,
                                                     target_price_lower, target_price_upper, available_cash)
        elif type == 'short_strangle':
            return TradeFactory.build_short_strangle(type, stock, contracts, premium_type, broker_settings,
                                                     target_price_lower, target_price_upper, available_cash)
        elif type == 'strap_straddle':
            return TradeFactory.build_strap_straddle(type, stock, contracts, premium_type, broker_settings,
                                                     target_price_lower, target_price_upper, available_cash)
        elif type == 'strap_strangle':
            return TradeFactory.build_strap_strangle(type, stock, contracts, premium_type, broker_settings,
                                                     target_price_lower, target_price_upper, available_cash)

        return None

    @staticmethod
    def build_long_call(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                        target_price_upper, available_cash):
        long_call_leg = OptionLeg(True, 1, contracts[0], premium_type, broker_settings)
        new_trade = LongCall(type, stock, [long_call_leg], premium_type, target_price_lower, target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_long_put(type, stock, contracts, premium_type, broker_settings, target_price_lower, target_price_upper,
                       available_cash):
        long_put_leg = OptionLeg(True, 1, contracts[0], premium_type, broker_settings)
        new_trade = LongPut(type, stock, [long_put_leg], premium_type, target_price_lower, target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_bear_call_spread(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                               target_price_upper, available_cash):
        call_contract_1, call_contract_2 = contracts[0], contracts[1]
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)
        long_call_leg = OptionLeg(True, 1, higher_strike_call, premium_type, broker_settings)
        short_call_leg = OptionLeg(False, 1, lower_strike_call, premium_type, broker_settings)
        cash_leg = CashLeg((higher_strike_call.strike - lower_strike_call.strike) * 100)
        new_trade = BearCallSpread(type, stock, [long_call_leg, short_call_leg, cash_leg], premium_type,
                                   target_price_lower, target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_bear_put_spread(type, stock, contracts, premium_type, broker_settings,
                              target_price_lower, target_price_upper, available_cash):
        put_contract_1, put_contract_2 = contracts[0], contracts[1]
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)
        long_put_leg = OptionLeg(True, 1, higher_strike_put, premium_type, broker_settings)
        short_put_leg = OptionLeg(False, 1, lower_strike_put, premium_type, broker_settings)
        new_trade = BearPutSpread(type, stock, [long_put_leg, short_put_leg], premium_type,
                                  target_price_lower, target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_bull_call_spread(type, stock, contracts, premium_type, broker_settings,
                               target_price_lower, target_price_upper, available_cash):
        call_contract_1, call_contract_2 = contracts[0], contracts[1]
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)
        long_call_leg = OptionLeg(True, 1, lower_strike_call, premium_type, broker_settings)
        short_call_leg = OptionLeg(False, 1, higher_strike_call, premium_type, broker_settings)
        new_trade = BullCallSpread(type, stock, [long_call_leg, short_call_leg],
                                   premium_type, target_price_lower, target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_bull_put_spread(type, stock, contracts, premium_type, broker_settings,
                              target_price_lower, target_price_upper, available_cash):
        put_contract_1, put_contract_2 = contracts[0], contracts[1]
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)
        long_put_leg = OptionLeg(True, 1, lower_strike_put, premium_type, broker_settings)
        short_put_leg = OptionLeg(False, 1, higher_strike_put, premium_type, broker_settings)
        cash_leg = CashLeg((higher_strike_put.strike - lower_strike_put.strike) * 100)
        new_trade = BullPutSpread(type, stock, [long_put_leg, short_put_leg, cash_leg], premium_type,
                                  target_price_lower, target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_cash_secured_put(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                               target_price_upper, available_cash):
        put_contract = contracts[0]
        short_put_leg = OptionLeg(False, 1, put_contract, premium_type, broker_settings)
        long_cash_leg = CashLeg(100 * put_contract.strike)
        new_trade = CashSecuredPut(type, stock, [short_put_leg, long_cash_leg],
                                   premium_type, target_price_lower, target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_covered_call(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                           target_price_upper, available_cash):
        long_stock_leg = StockLeg(100, stock)
        short_call_leg = OptionLeg(False, 1, contracts[0], premium_type, broker_settings)
        new_trade = CoveredCall(type, stock, [short_call_leg, long_stock_leg],
                                premium_type, target_price_lower, target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_long_straddle(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                            target_price_upper, available_cash):
        call_contract, put_contract = contracts[0], contracts[1]
        long_call_leg = OptionLeg(True, 1, call_contract, premium_type, broker_settings)
        long_put_leg = OptionLeg(True, 1, put_contract, premium_type, broker_settings)
        new_trade = LongStraddle(type, stock, [long_call_leg, long_put_leg], premium_type,
                                 target_price_lower, target_price_upper)
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_iron_butterfly(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                             target_price_upper, available_cash):
        call_contract_1, call_contract_2, put_contract_1, put_contract_2 = contracts[0], contracts[1], contracts[2], \
                                                                           contracts[3]
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)
        long_call_leg = OptionLeg(True, 1, higher_strike_call, premium_type, broker_settings)
        long_put_leg = OptionLeg(True, 1, lower_strike_put, premium_type, broker_settings)
        short_call_leg = OptionLeg(False, 1, lower_strike_call, premium_type, broker_settings)
        short_put_leg = OptionLeg(False, 1, higher_strike_put, premium_type, broker_settings)
        new_trade = IronButterfly(type, stock, [long_call_leg, long_put_leg, short_call_leg, short_put_leg],
                                  premium_type, target_price_lower, target_price_upper)
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_iron_condor(type, stock, contracts, premium_type, broker_settings, target_price_lower, target_price_upper,
                          available_cash):
        call_contract_1, call_contract_2, put_contract_1, put_contract_2 = contracts[0], contracts[1], contracts[2], \
                                                                           contracts[3]
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)
        long_call_leg = OptionLeg(True, 1, higher_strike_call, premium_type, broker_settings)
        long_put_leg = OptionLeg(True, 1, lower_strike_put, premium_type, broker_settings)
        short_call_leg = OptionLeg(False, 1, lower_strike_call, premium_type, broker_settings)
        short_put_leg = OptionLeg(False, 1, higher_strike_put, premium_type, broker_settings)
        new_trade = IronCondor(type, stock, [long_call_leg, long_put_leg, short_call_leg, short_put_leg], premium_type,
                               target_price_lower, target_price_upper)
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_long_butterfly_spread(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                                    target_price_upper, available_cash):
        long_contract_1, long_contract_2, short_contract = contracts[0], contracts[1], contracts[2]
        lower_strike_contract, higher_strike_contract = (long_contract_1, long_contract_2) \
            if long_contract_1.strike < long_contract_2.strike else (long_contract_2, long_contract_1)

        long_leg_upper = OptionLeg(True, 1, higher_strike_contract, premium_type, broker_settings)
        long_leg_lower = OptionLeg(True, 1, lower_strike_contract, premium_type, broker_settings)
        short_leg = OptionLeg(False, 2, short_contract, premium_type, broker_settings)
        new_trade = LongButterflySpread(type, stock, [long_leg_lower, long_leg_upper, short_leg],
                                        premium_type, target_price_lower, target_price_upper)
        # it is possible to build a long butterfly spread with a negative cost (unbalanced or broken wing butterfly)
        if new_trade.cost > 0.0 and available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_long_condor_spread(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                                 target_price_upper, available_cash):
        left_wing_contract_1, left_wing_contract_2, right_wing_contract_1, right_wing_contract_2 = contracts[0], \
                                                                                                   contracts[1], \
                                                                                                   contracts[2], \
                                                                                                   contracts[3]

        lower_strike_left, higher_strike_left = (left_wing_contract_1, left_wing_contract_2) \
            if left_wing_contract_1.strike < left_wing_contract_2.strike else (
            left_wing_contract_2, left_wing_contract_1)
        lower_strike_right, higher_strike_right = (right_wing_contract_1, right_wing_contract_2) \
            if right_wing_contract_1.strike < right_wing_contract_2.strike else (
            right_wing_contract_2, right_wing_contract_1)
        left_wing_long = OptionLeg(True, 1, lower_strike_left, premium_type, broker_settings)
        right_wing_long = OptionLeg(True, 1, higher_strike_right, premium_type, broker_settings)
        left_wing_short = OptionLeg(False, 1, higher_strike_left, premium_type, broker_settings)
        right_wing_short = OptionLeg(False, 1, lower_strike_right, premium_type, broker_settings)
        new_trade = LongCondorSpread(type, stock, [left_wing_long, right_wing_long, left_wing_short, right_wing_short],
                                     premium_type,
                                     target_price_lower, target_price_upper)
        return new_trade

    @staticmethod
    def build_long_strangle(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                            target_price_upper, available_cash):
        call_contract, put_contract = contracts[0], contracts[1]
        long_call_leg = OptionLeg(True, 1, call_contract, premium_type, broker_settings)
        long_put_leg = OptionLeg(True, 1, put_contract, premium_type, broker_settings)
        new_trade = LongStrangle(type, stock, [long_call_leg, long_put_leg], premium_type,
                                 target_price_lower, target_price_upper)
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_protective_put(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                             target_price_upper, available_cash):
        put_contract = contracts[0]
        long_stock_leg = StockLeg(100, stock)
        long_put_leg = OptionLeg(True, 1, put_contract, premium_type, broker_settings)
        new_trade = ProtectivePut(type, stock, [long_put_leg, long_stock_leg],
                                  premium_type, target_price_lower, target_price_upper)
        if new_trade.cost <= 0.0 or available_cash and not new_trade.max_out(available_cash):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_short_butterfly_spread(type, stock, contracts, premium_type, broker_settings,
                                     target_price_lower, target_price_upper, available_cash):
        long_contract_1, long_contract_2, short_contract = contracts[0], contracts[1], contracts[2]
        lower_strike_contract, higher_strike_contract = (long_contract_1, long_contract_2) \
            if long_contract_1.strike < long_contract_2.strike else (long_contract_2, long_contract_1)

        short_leg_upper = OptionLeg(False, 1, higher_strike_contract, premium_type, broker_settings)
        short_leg_lower = OptionLeg(False, 1, lower_strike_contract, premium_type, broker_settings)
        long_leg = OptionLeg(True, 2, short_contract, premium_type, broker_settings)
        new_trade = ShortButterflySpread(type, stock, [short_leg_lower, short_leg_upper, long_leg],
                                         premium_type, target_price_lower, target_price_upper)
        return new_trade

    @staticmethod
    def build_short_call(type, stock, contracts, premium_type, broker_settings, target_price_lower, target_price_upper,
                         available_cash):
        call_contract = contracts[0]
        short_call_leg = OptionLeg(False, 1, call_contract, premium_type, broker_settings)
        new_trade = ShortCall(type, stock, [short_call_leg], premium_type, target_price_lower, target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_short_condor_spread(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                                  target_price_upper, available_cash):
        left_wing_contract_1, left_wing_contract_2, right_wing_contract_1, right_wing_contract_2 = contracts[0], \
                                                                                                   contracts[1], \
                                                                                                   contracts[2], \
                                                                                                   contracts[3]
        lower_strike_left, higher_strike_left = (left_wing_contract_1, left_wing_contract_2) \
            if left_wing_contract_1.strike < left_wing_contract_2.strike else (
            left_wing_contract_2, left_wing_contract_1)
        lower_strike_right, higher_strike_right = (right_wing_contract_1, right_wing_contract_2) \
            if right_wing_contract_1.strike < right_wing_contract_2.strike else (
            right_wing_contract_2, right_wing_contract_1)
        left_wing_short = OptionLeg(True, 1, lower_strike_left, premium_type, broker_settings)
        right_wing_short = OptionLeg(True, 1, higher_strike_right, premium_type, broker_settings)
        left_wing_long = OptionLeg(False, 1, higher_strike_left, premium_type, broker_settings)
        right_wing_long = OptionLeg(False, 1, lower_strike_right, premium_type, broker_settings)
        new_trade = ShortCondorSpread(type, stock, [left_wing_long, right_wing_long, left_wing_short, right_wing_short],
                                      premium_type,
                                      target_price_lower, target_price_upper)
        return new_trade

    @staticmethod
    def build_short_put(type, stock, contracts, premium_type, broker_settings, target_price_lower, target_price_upper,
                        available_cash):
        put_contract = contracts[0]
        short_put_leg = OptionLeg(False, 1, put_contract, premium_type, broker_settings)
        new_trade = ShortPut(type, stock, [short_put_leg], premium_type, target_price_lower, target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_short_straddle(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                             target_price_upper, available_cash):
        call_contract, put_contract = contracts[0], contracts[1]
        short_call_leg = OptionLeg(False, 1, call_contract, premium_type, broker_settings)
        short_put_leg = OptionLeg(False, 1, put_contract, premium_type, broker_settings)
        new_trade = ShortStraddle(type, stock, [short_call_leg, short_put_leg], premium_type,
                                  target_price_lower, target_price_upper)
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_short_strangle(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                             target_price_upper, available_cash):
        call_contract, put_contract = contracts[0], contracts[1]
        short_call_leg = OptionLeg(False, 1, call_contract, premium_type, broker_settings)
        short_put_leg = OptionLeg(False, 1, put_contract, premium_type, broker_settings)
        new_trade = ShortStrangle(type, stock, [short_call_leg, short_put_leg], premium_type,
                                  target_price_lower, target_price_upper)
        new_trade.validate()
        return new_trade

    @staticmethod
    def build_strap_straddle(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                             target_price_upper, available_cash):
        call_contract, put_contract = contracts[0], contracts[1]
        long_call_leg = OptionLeg(True, 2, call_contract, premium_type, broker_settings)
        long_put_leg = OptionLeg(True, 1, put_contract, premium_type, broker_settings)
        new_trade = StrapStraddle(type, stock, [long_call_leg, long_put_leg], premium_type,
                                  target_price_lower, target_price_upper)
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @staticmethod
    def build_strap_strangle(type, stock, contracts, premium_type, broker_settings, target_price_lower,
                             target_price_upper, available_cash):
        call_contract, put_contract = contracts[0], contracts[1]
        long_call_leg = OptionLeg(True, 2, call_contract, premium_type, broker_settings)
        long_put_leg = OptionLeg(True, 1, put_contract, premium_type, broker_settings)
        new_trade = StrapStrangle(type, stock, [long_call_leg, long_put_leg], premium_type,
                                  target_price_lower, target_price_upper)
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        new_trade.validate()
        return new_trade
