import itertools
import logging

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from tiger.core import Stock
from tiger.core.trade import TradeFactory
from tiger.models import Ticker
from tiger.serializers import TradeSimpleSerializer, BrokerSerializer
from tiger.views.decorators import tracking_api
from tiger.views.utils import get_filtered_contracts, get_broker, get_disabled_or_disallowed_strategies, \
    filter_object_on_attribute

logger = logging.getLogger('console_info')


def save_best_trade_by_type(best_trade_dict, trade, trade_filters={}):
    strategy_type = trade.type

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

    blocked_strategies = get_disabled_or_disallowed_strategies(user)

    # TODO: refactor this, use trade class's type, and build out a unified interface for .build().
    for calls_per_exp in call_contract_lists:
        for call in calls_per_exp:
            for trade_type in set(['long_call', 'covered_call']) - blocked_strategies:
                new_trade = TradeFactory.build(trade_type, stock, [call], premium_type, broker_settings,
                                               target_price_lower, target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, new_trade, trade_filters)

        call_pairs = itertools.combinations(calls_per_exp, 2)
        for call1, call2 in call_pairs:
            if call1.strike >= call2.strike:
                continue

            for trade_type in set(['bull_call_spread', 'bear_call_spread']) - blocked_strategies:
                new_trade = TradeFactory.build(trade_type, stock, [call1, call2], premium_type,
                                               broker_settings, target_price_lower, target_price_upper,
                                               available_cash)
                save_best_trade_by_type(best_trade_dict, new_trade, trade_filters)

    for puts_per_exp in put_contract_lists:
        for put in puts_per_exp:
            for trade_type in set(['long_put', 'cash_secured_put', 'protective_put']) - blocked_strategies:
                new_trade = TradeFactory.build(trade_type, stock, [put], premium_type, broker_settings,
                                               target_price_lower, target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, new_trade, trade_filters)

        put_pairs = itertools.combinations(puts_per_exp, 2)
        for put1, put2 in put_pairs:
            if put1.strike >= put2.strike:
                continue
            for trade_type in set(['bear_put_spread', 'bull_put_spread', 'protective_put']) - blocked_strategies:
                new_trade = TradeFactory.build(trade_type, stock, [put1, put2], premium_type,
                                               broker_settings, target_price_lower, target_price_upper,
                                               available_cash)
                save_best_trade_by_type(best_trade_dict, new_trade, trade_filters)

    resp = []
    for key, val in best_trade_dict.items():
        trade = val['trade']
        if not trade:
            continue

        trade.meta = {'num_combinations': val['num_combinations']}
        resp.append(trade)

    return resp


@tracking_api()
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
    stock_price = quote.get('latestPrice')
    stock = Stock(ticker, stock_price, external_cache_id, ticker.get_latest_stats())

    call_contract_lists, put_contract_lists = get_filtered_contracts(ticker, expiration_timestamps, contract_filters)
    broker = get_broker(request.user)
    broker_settings = broker.get_broker_settings()

    all_trades = build_trades(stock, call_contract_lists, put_contract_lists, strategy_settings, trade_filters,
                              broker_settings, request.user)
    response = {
        'trades': TradeSimpleSerializer(all_trades, many=True).data,
        'broker': BrokerSerializer(broker).data
    }

    return Response(response)
