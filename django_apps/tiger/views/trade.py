import itertools
import logging

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from tiger.core import Stock
from tiger.core.trade import LongCall, LongPut, CoveredCall, CashSecuredPut, BullPutSpread, BullCallSpread, \
    BearCallSpread, BearPutSpread, ProtectivePut
from tiger.models import Ticker
from tiger.serializers import TradeSerializer, BrokerSerializer
from tiger.views.utils import get_filtered_contracts, get_broker, user_disabled_or_disallowed_strategy, \
    filter_object_on_attribute

logger = logging.getLogger('console_info')


def save_best_trade_by_type(best_trade_dict, strategy_type, trade, trade_filters={}):
    if strategy_type not in best_trade_dict:
        best_trade_dict[strategy_type] = {
            'num_combinations': 0,
            'trade': None
        }

    best_trade_dict[strategy_type]['num_combinations'] += 1

    if trade is None or trade.cost < 0.1 or trade.target_price_profit <= 0.0:
        return

    for key, value in trade_filters.items():
        if not filter_object_on_attribute(trade, key, value):
            return

    if not best_trade_dict[strategy_type]['trade'] \
            or best_trade_dict[strategy_type]['trade'].target_price_profit_ratio < trade.target_price_profit_ratio:
        best_trade_dict[strategy_type]['trade'] = trade


def build_trades(stock, call_contract_lists, put_contract_lists, strategy_settings, trade_filters, broker_settings,
                 user):
    premium_type = strategy_settings.get('premium_type', 'market')
    target_price_lower = strategy_settings.get('target_price_lower', None)
    target_price_upper = strategy_settings.get('target_price_upper', None)
    available_cash = strategy_settings.get('cash_to_invest', None)
    best_trade_dict = {}

    for calls_per_exp in call_contract_lists:
        call_pairs = itertools.combinations(calls_per_exp, 2)

        for call in calls_per_exp:
            if not user_disabled_or_disallowed_strategy(user, 'long_call'):
                long_call = LongCall.build(stock, call, premium_type, broker_settings, target_price_lower,
                                           target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, 'long_call', long_call, trade_filters)

            if not user_disabled_or_disallowed_strategy(user, 'covered_call'):
                covered_call = CoveredCall.build(stock, call, premium_type, broker_settings, target_price_lower,
                                                 target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, 'covered_call', covered_call, trade_filters)

        for call1, call2 in call_pairs:
            if call1.strike < call2.strike:
                if not user_disabled_or_disallowed_strategy(user, 'bull_call_spread'):
                    bull_call_spread = BullCallSpread.build(stock, call1, call2, premium_type, broker_settings,
                                                            target_price_lower, target_price_upper, available_cash)
                    save_best_trade_by_type(best_trade_dict, 'bull_call_spread', bull_call_spread, trade_filters)

                if not user_disabled_or_disallowed_strategy(user, 'bear_call_spread'):
                    bear_call_spread = BearCallSpread.build(stock, call1, call2, premium_type, broker_settings,
                                                            target_price_lower, target_price_upper, available_cash)
                    save_best_trade_by_type(best_trade_dict, 'bear_call_spread', bear_call_spread, trade_filters)

    for puts_per_exp in put_contract_lists:
        put_pairs = itertools.combinations(puts_per_exp, 2)

        for put in puts_per_exp:
            if not user_disabled_or_disallowed_strategy(user, 'long_put'):
                long_put = LongPut.build(stock, put, premium_type, broker_settings, target_price_lower,
                                         target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, 'long_put', long_put, trade_filters)

            if not user_disabled_or_disallowed_strategy(user, 'cash_secured_put'):
                cash_secured_put = CashSecuredPut.build(stock, put, premium_type, broker_settings, target_price_lower,
                                                        target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, 'cash_secured_put', cash_secured_put, trade_filters)

            if not user_disabled_or_disallowed_strategy(user, 'protective_put'):
                protective_put = ProtectivePut.build(stock, put, premium_type, broker_settings, target_price_lower,
                                                     target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, 'protective_put', protective_put, trade_filters)

        for put1, put2 in put_pairs:
            if put1.strike < put2.strike:
                if not user_disabled_or_disallowed_strategy(user, 'bear_put_spread'):
                    bear_put_spread = BearPutSpread.build(stock, put1, put2, premium_type, broker_settings,
                                                          target_price_lower, target_price_upper, available_cash)
                    save_best_trade_by_type(best_trade_dict, 'bear_put_spread', bear_put_spread, trade_filters)

                if not user_disabled_or_disallowed_strategy(user, 'bull_put_spread'):
                    bull_put_spread = BullPutSpread.build(stock, put1, put2, premium_type, broker_settings,
                                                          target_price_lower, target_price_upper, available_cash)
                    save_best_trade_by_type(best_trade_dict, 'bull_put_spread', bull_put_spread, trade_filters)

    resp = []
    for key, val in best_trade_dict.items():
        trade = val['trade']
        if not trade:
            continue

        trade.meta = {'num_combinations': val['num_combinations']}
        resp.append(trade)

    return resp


@api_view(['POST'])
def get_top_trades(request, ticker_symbol):
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')

    try:
        expiration_timestamps = request.data.get('expiration_timestamps')
        strategy_settings = request.data.get('strategy_settings')
        contract_filters = request.data.get('contract_filters')
        trade_filters = request.data.get('trade_filters')
        assert strategy_settings['target_price_lower'] <= strategy_settings['target_price_upper']
    except Exception:
        raise APIException('Invalid request body.')

    quote, external_cache_id = ticker.get_quote()
    stock_price = quote.get('regularMarketPrice')  # This is from Yahoo.
    stock = Stock(ticker, stock_price, external_cache_id, ticker.get_latest_stats())

    call_contract_lists, put_contract_lists = get_filtered_contracts(ticker, expiration_timestamps, contract_filters)
    broker = get_broker(request.user)
    broker_settings = broker.get_broker_settings()

    all_trades = build_trades(stock, call_contract_lists, put_contract_lists, strategy_settings, trade_filters,
                              broker_settings, request.user)
    response = {
        'trades': TradeSerializer(all_trades, many=True).data,
        'broker': BrokerSerializer(broker).data
    }

    return Response(response)
