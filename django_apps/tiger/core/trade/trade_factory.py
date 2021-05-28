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
from .long_straddle import LongStraddle
from .short_strangle import ShortStrangle
from .iron_butterfly import IronButterfly
from .long_strangle import LongStrangle
from .iron_condor import IronCondor


class TradeFactory:
    @staticmethod
    def initiate_trade(trade_type, stock_snapshot, leg_snapshots, premium_type, broker_settings, target_price_lower, target_price_upper):
        stock = Stock.from_snapshot(stock_snapshot)
        legs = [Leg.from_snapshot(leg_snapshot, premium_type, broker_settings) for leg_snapshot in leg_snapshots]

        if trade_type == 'long_call':
            trade_class = LongCall
        elif trade_type == 'long_put':
            trade_class = LongPut
        elif trade_type == 'covered_call':
            trade_class = CoveredCall
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
        elif trade_type == 'short_strangle':
            trade_class = ShortStrangle
        elif trade_type == 'iron_butterfly':
            trade_class = IronButterfly
        elif trade_type == 'iron_condor':
            trade_class = IronCondor
        elif trade_type == 'long_strangle':
            trade_class = LongStrangle

        trade = trade_class(stock, legs, premium_type=premium_type,
                            target_price_lower=target_price_lower,
                            target_price_upper=target_price_upper)

        return trade

    @staticmethod
    def from_snapshot(trade_snapshot, broker_settings):
        trade = TradeFactory.initiate_trade(trade_snapshot.type,
                                            trade_snapshot.stock_snapshot,
                                            trade_snapshot.leg_snapshots.all(),
                                            trade_snapshot.premium_type,
                                            broker_settings,
                                            trade_snapshot.target_price_lower,
                                            trade_snapshot.target_price_upper)

        return trade

    @staticmethod
    def from_snapshot_dict(trade_snapshot, broker_settings):
        trade = TradeFactory.initiate_trade(trade_snapshot['type'],
                                            trade_snapshot['stock_snapshot'],
                                            trade_snapshot['leg_snapshots'],
                                            trade_snapshot['premium_type'],
                                            broker_settings,
                                            trade_snapshot.get('target_price_lower'),
                                            trade_snapshot.get('target_price_upper'))

        return trade
