from tiger.core.leg import Leg
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

