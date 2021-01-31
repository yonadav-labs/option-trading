from tiger.core.leg import Leg, OptionLeg, CashLeg, StockLeg
from tiger.core.security import Stock

from .bear_call_spread import BearCallSpread
from .bear_put_spread import BearPutSpread
from .bull_call_spread import BullCallSpread
from .bull_put_spread import BullPutSpread
from .cash_secured_put import CashSecuredPut
from .covered_call import CoveredCall
from .long_call import LongCall
from .long_put import LongPut


class TradeFactory:
    @staticmethod
    def from_snapshot(trade_snapshot):
        stock = Stock.from_snapshot(trade_snapshot.stock_snapshot)
        legs = [Leg.from_snapshot(leg_snapshot) for leg_snapshot in trade_snapshot.leg_snapshots.all()]

        if trade_snapshot.type == 'long_call':
            trade_class = LongCall
        elif trade_snapshot.type == 'long_put':
            trade_class = LongPut
        elif trade_snapshot.type == 'covered_call':
            trade_class = CoveredCall
        elif trade_snapshot.type == 'cash_secured_put':
            trade_class = CashSecuredPut
        elif trade_snapshot.type == 'bull_call_spread':
            trade_class = BullCallSpread
        elif trade_snapshot.type == 'bear_call_spread':
            trade_class = BearCallSpread
        elif trade_snapshot.type == 'bear_put_spread':
            trade_class = BearPutSpread
        elif trade_snapshot.type == 'bull_put_spread':
            trade_class = BullPutSpread

        new_trade = trade_class(stock, legs, target_price_lower=trade_snapshot.target_price_lower,
                                target_price_upper=trade_snapshot.target_price_upper)
        return new_trade

    @staticmethod
    def build_long_call(stock, call_contract, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_call_leg = OptionLeg(True, 1, call_contract)
        new_trade = LongCall(stock, [long_call_leg], target_price_lower=target_price_lower,
                             target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_long_put(stock, put_contract, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_put_leg = OptionLeg(True, 1, put_contract)
        new_trade = LongPut(stock, [long_put_leg], target_price_lower=target_price_lower,
                            target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_covered_call(stock, call_contract, target_price_lower=None, target_price_upper=None, available_cash=None):
        long_stock_leg = StockLeg(100, stock)
        short_call_leg = OptionLeg(False, 1, call_contract)
        new_trade = CoveredCall(stock, [short_call_leg, long_stock_leg], target_price_lower=target_price_lower,
                                target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_cash_secured_put(stock, put_contract, target_price_lower=None, target_price_upper=None,
                               available_cash=None):
        short_put_leg = OptionLeg(False, 1, put_contract)
        long_cash_leg = CashLeg(100 * put_contract.strike)
        new_trade = CashSecuredPut(stock, [short_put_leg, long_cash_leg], target_price_lower=target_price_lower,
                                   target_price_upper=target_price_upper)
        if available_cash and not new_trade.max_out(available_cash):
            return None
        return new_trade

    @staticmethod
    def build_bull_call_spread(stock, call_contract_1, call_contract_2, target_price_lower=None,
                               target_price_upper=None, available_cash=None):
        if call_contract_1.strike == call_contract_2.strike or call_contract_1.expiration != call_contract_2.expiration:
            return None
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)

        long_call_leg = OptionLeg(True, 1, lower_strike_call)
        short_call_leg = OptionLeg(False, 1, higher_strike_call)
        new_trade = BullCallSpread(stock, [long_call_leg, short_call_leg], target_price_lower=target_price_lower,
                                   target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @staticmethod
    def build_bear_call_spread(stock, call_contract_1, call_contract_2, target_price_lower=None,
                               target_price_upper=None, available_cash=None):
        if call_contract_1.strike == call_contract_2.strike or call_contract_1.expiration != call_contract_2.expiration:
            return None
        lower_strike_call, higher_strike_call = (call_contract_1, call_contract_2) \
            if call_contract_1.strike < call_contract_2.strike else (call_contract_2, call_contract_1)

        long_call_leg = OptionLeg(True, 1, higher_strike_call)
        short_call_leg = OptionLeg(False, 1, lower_strike_call)
        cash_leg = CashLeg((higher_strike_call.strike - lower_strike_call.strike) * 100)
        new_trade = BearCallSpread(stock, [long_call_leg, short_call_leg, cash_leg],
                                   target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @staticmethod
    def build_bear_put_spread(stock, put_contract_1, put_contract_2, target_price_lower=None,
                              target_price_upper=None, available_cash=None):
        if put_contract_1.strike == put_contract_2.strike or put_contract_1.expiration != put_contract_2.expiration:
            return None
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)

        long_put_leg = OptionLeg(True, 1, higher_strike_put)
        short_put_leg = OptionLeg(False, 1, lower_strike_put)
        new_trade = BearPutSpread(stock, [long_put_leg, short_put_leg],
                                  target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade

    @staticmethod
    def build_bull_put_spread(stock, put_contract_1, put_contract_2, target_price_lower=None,
                              target_price_upper=None, available_cash=None):
        if put_contract_1.strike == put_contract_2.strike or put_contract_1.expiration != put_contract_2.expiration:
            return None
        lower_strike_put, higher_strike_put = (put_contract_1, put_contract_2) \
            if put_contract_1.strike < put_contract_2.strike else (put_contract_2, put_contract_1)

        long_put_leg = OptionLeg(True, 1, lower_strike_put)
        short_put_leg = OptionLeg(False, 1, higher_strike_put)
        cash_leg = CashLeg((higher_strike_put.strike - lower_strike_put.strike) * 100)
        new_trade = BullPutSpread(stock, [long_put_leg, short_put_leg, cash_leg],
                                  target_price_lower=target_price_lower, target_price_upper=target_price_upper)
        # cost could be 0 or < 0 due to wide bid/ask spread.
        if new_trade.cost <= 0.0 or (available_cash and not new_trade.max_out(available_cash)):
            return None
        return new_trade
