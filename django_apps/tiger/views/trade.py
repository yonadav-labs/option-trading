import logging
import itertools

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from tiger.core import Stock
from tiger.core.trade import LongCall, LongPut, CoveredCall, CashSecuredPut, BullPutSpread, BullCallSpread, \
    BearCallSpread, BearPutSpread
from tiger.models import Ticker
from tiger.serializers import TradeSerializer, BrokerSerializer
from tiger.utils import days_from_timestamp
from tiger.views.utils import get_valid_contracts, get_filtered_contracts, get_broker, user_disabled_strategy

logger = logging.getLogger('console_info')


# TODO: trade.cost > 0.1 is needed for some spreads where the spread width is almost equal to cost.
def filter_and_sort_trades(input_trades):
    output_trades = list(
        filter(lambda trade: trade is not None and trade.target_price_profit > 0.0 and trade.cost > 0.1, input_trades))
    return sorted(output_trades, key=lambda trade: -trade.target_price_profit_ratio)


def save_best_trade_by_type(best_trade_dict, strategy_type, trade):
    if trade.cost < 0.1:
        return
    if strategy_type not in best_trade_dict or best_trade_dict[strategy_type].target_price_profit_ratio < trade.target_price_profit_ratio:
        best_trade_dict[strategy_type] = trade


def build_trades(stock, call_contract_lists, put_contract_lists, strategy_settings, broker_settings, user):
    premium_type = strategy_settings.get('premium_type', 'market')
    target_price_lower = strategy_settings.get('target_price_lower', None)
    target_price_upper = strategy_settings.get('target_price_upper', None)
    available_cash = strategy_settings.get('available_cash',  None)
    best_trade_dict = {}

    for calls_per_exp in call_contract_lists:
        call_pairs = itertools.combinations(calls_per_exp, 2)

        for call in calls_per_exp:
            if not user_disabled_strategy(user, 'long_call'):
                long_call = LongCall.build(stock, call, premium_type, broker_settings, target_price_lower, target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, 'long_call', long_call)

            if not user_disabled_strategy(user, 'covered_call'):
                covered_call = CoveredCall.build(stock, call, premium_type, broker_settings, target_price_lower, target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, 'covered_call', covered_call)
            
        for call1, call2 in call_pairs:
            if call1.strike < call2.strike:
                if not user_disabled_strategy(user, 'bull_call_spread'):
                    bull_call_spread = BullCallSpread.build(stock, call1, call2, premium_type, broker_settings, target_price_lower, target_price_upper, available_cash)
                    save_best_trade_by_type(best_trade_dict, 'bull_call_spread', bull_call_spread)

                if not user_disabled_strategy(user, 'bear_call_spread'):
                    bear_call_spread = BearCallSpread.build(stock, call1, call2, premium_type, broker_settings, target_price_lower, target_price_upper, available_cash)
                    save_best_trade_by_type(best_trade_dict, 'bear_call_spread', bear_call_spread)

    for puts_per_exp in put_contract_lists:
        put_pairs = itertools.combinations(puts_per_exp, 2)

        for put in puts_per_exp:
            if not user_disabled_strategy(user, 'long_put'):
                long_put = LongPut.build(stock, put, premium_type, broker_settings, target_price_lower, target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, 'long_put', long_put)
            
            if not user_disabled_strategy(user, 'cash_secured_put'):
                cash_secured_put = CashSecuredPut.build(stock, put, premium_type, broker_settings, target_price_lower, target_price_upper, available_cash)
                save_best_trade_by_type(best_trade_dict, 'cash_secured_put', cash_secured_put)

        for put1, put2 in put_pairs:
            if put1.strike < put2.strike:
                if not user_disabled_strategy(user, 'bear_put_spread'):
                    bear_put_spread = BearPutSpread.build(stock, put1, put2, premium_type, broker_settings, target_price_lower, target_price_upper, available_cash)
                    save_best_trade_by_type(best_trade_dict, 'bear_put_spread', bear_put_spread)

                if not user_disabled_strategy(user, 'bull_put_spread'):
                    bull_put_spread = BullPutSpread.build(stock, put1, put2, premium_type, broker_settings, target_price_lower, target_price_upper, available_cash)
                    save_best_trade_by_type(best_trade_dict, 'bull_put_spread', bull_put_spread)

    return list(best_trade_dict.values())


def get_call_spreads(stock, call_contract_lists, premium_type, target_price_lower, target_price_upper, available_cash, broker_settings, user):
    bull_call_spread_trades = []
    bear_call_spread_trades = []
    for calls_per_exp in call_contract_lists:
        sampled_calls = sorted(calls_per_exp, key=lambda call: (call.volume, call.open_interest), reverse=True)
        sampled_calls = sampled_calls[:int(len(sampled_calls) * 0.8)]  # Use top 80% most liquid
        for low_strike_call in sampled_calls:
            for high_strike_call in sampled_calls:
                if low_strike_call.strike >= high_strike_call.strike:
                    continue
                if not user_disabled_strategy(user, 'bull_call_spread'):
                    bull_call_spread_trades.append(
                        BullCallSpread.build(stock, low_strike_call, high_strike_call, premium_type, broker_settings, target_price_lower,
                                             target_price_upper, available_cash=available_cash))
                if not user_disabled_strategy(user, 'bear_call_spread'):
                    bear_call_spread_trades.append(
                        BearCallSpread.build(stock, low_strike_call, high_strike_call, premium_type, broker_settings, target_price_lower,
                                             target_price_upper, available_cash=available_cash))
    bull_call_spread_trades = filter_and_sort_trades(bull_call_spread_trades)[:50]
    bear_call_spread_trades = filter_and_sort_trades(bear_call_spread_trades)[:50]

    return bull_call_spread_trades, bear_call_spread_trades


def get_put_spreads(stock, put_contract_lists, premium_type, target_price_lower, target_price_upper, available_cash, broker_settings, user):
    bear_put_spread_trades = []
    bull_put_spread_trades = []
    for puts_per_exp in put_contract_lists:
        sampled_puts = sorted(puts_per_exp, key=lambda put: (put.volume, put.open_interest), reverse=True)
        sampled_puts = sampled_puts[:int(len(sampled_puts) * 0.8)]  # Use top 80% most liquid contracts.
        for low_strike_put in sampled_puts:
            for high_strike_put in sampled_puts:
                if low_strike_put.strike >= high_strike_put.strike:
                    continue
                if not user_disabled_strategy(user, 'bear_put_spread'):
                    bear_put_spread_trades.append(
                        BearPutSpread.build(stock, low_strike_put, high_strike_put, premium_type, broker_settings, target_price_lower,
                                            target_price_upper, available_cash=available_cash))
                if not user_disabled_strategy(user, 'bull_put_spread'):
                    bull_put_spread_trades.append(
                        BullPutSpread.build(stock, low_strike_put, high_strike_put, premium_type, broker_settings, target_price_lower,
                                            target_price_upper, available_cash=available_cash))
    bear_put_spread_trades = filter_and_sort_trades(bear_put_spread_trades)[:50]
    bull_put_spread_trades = filter_and_sort_trades(bull_put_spread_trades)[:50]

    return bear_put_spread_trades, bull_put_spread_trades


@api_view(['GET'])
def get_best_trades(request, ticker_symbol):
    logger.info(ticker_symbol.upper())  # demo of logging.
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')

    try:
        premium_type = request.query_params.get('premium_type', 'market')
        target_price_lower = float(request.query_params.get('target_price_lower'))
        target_price_upper = float(request.query_params.get('target_price_upper'))
        available_cash = request.query_params.get('available_cash')
        if available_cash is not None:
            available_cash = float(available_cash)
        assert target_price_lower <= target_price_upper
    except Exception:
        raise APIException('Invalid query parameters.')

    quote, external_cache_id = ticker.get_quote()
    stock_price = quote.get('regularMarketPrice')  # This is from Yahoo.
    stock = Stock(ticker, stock_price, external_cache_id, ticker.get_latest_stats())

    broker = get_broker(request.user)
    broker_settings = broker.get_broker_settings()

    long_call_trades = []
    covered_call_trades = []
    call_contract_lists, put_contract_lists = get_valid_contracts(ticker, request, all_expiration_timestamps,
                                                                  filter_low_liquidity=True)
    for calls_per_exp in call_contract_lists:
        for call in calls_per_exp:
            # Reduce response size.
            if days_from_timestamp(call.last_trade_date) <= -7:
                continue
            if not user_disabled_strategy(request.user, 'long_call'):
                long_call_trades.append(
                    LongCall.build(stock, call, premium_type, broker_settings, target_price_lower, target_price_upper,
                                   available_cash=available_cash))
            if not user_disabled_strategy(request.user, 'covered_call'):
                covered_call_trades.append(
                    CoveredCall.build(stock, call, premium_type, broker_settings, target_price_lower, target_price_upper,
                                      available_cash=available_cash))
    long_call_trades = filter_and_sort_trades(long_call_trades)[:25]
    covered_call_trades = filter_and_sort_trades(covered_call_trades)[:25]

    long_put_trades = []
    cash_secured_put_trades = []
    for puts_per_exp in put_contract_lists:
        for put in puts_per_exp:
            # Reduce response size.
            if days_from_timestamp(put.last_trade_date) <= -7:
                continue
            if not user_disabled_strategy(request.user, 'long_put'):
                long_put_trades.append(
                    LongPut.build(stock, put, premium_type, broker_settings, target_price_lower, target_price_upper,
                                  available_cash=available_cash))
            if not user_disabled_strategy(request.user, 'cash_secured_put'):
                cash_secured_put_trades.append(
                    CashSecuredPut.build(stock, put, premium_type, broker_settings, target_price_lower, target_price_upper,
                                         available_cash=available_cash))
    long_put_trades = filter_and_sort_trades(long_put_trades)[:25]
    cash_secured_put_trades = filter_and_sort_trades(cash_secured_put_trades)[:25]

    # Call spreads
    # TODO: add tests.
    bull_call_spread_trades, bear_call_spread_trades = get_call_spreads(stock, call_contract_lists, premium_type,
                                                                        target_price_lower, target_price_upper,
                                                                        available_cash, broker_settings, request.user)

    bear_put_spread_trades, bull_put_spread_trades = get_put_spreads(stock, put_contract_lists, premium_type,
                                                                     target_price_lower, target_price_upper,
                                                                     available_cash, broker_settings, request.user)

    all_trades = long_call_trades + covered_call_trades + long_put_trades + cash_secured_put_trades + \
                 bull_call_spread_trades + bear_call_spread_trades + bear_put_spread_trades + bull_put_spread_trades

    response = {
                  'trades': TradeSerializer(all_trades, many=True).data,
                  'broker': BrokerSerializer(broker).data
               }

    return Response(response)


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
        assert strategy_settings['target_price_lower'] <= strategy_settings['target_price_upper']
    except Exception:
        raise APIException('Invalid request body.')

    quote, external_cache_id = ticker.get_quote()
    stock_price = quote.get('regularMarketPrice')  # This is from Yahoo.
    stock = Stock(ticker, stock_price, external_cache_id)

    call_contract_lists, put_contract_lists = get_filtered_contracts(ticker, expiration_timestamps, contract_filters)
    broker = get_broker(request.user)
    broker_settings = broker.get_broker_settings()

    all_trades = build_trades(stock, call_contract_lists, put_contract_lists, strategy_settings, broker_settings, request.user)

    response = {
                  'trades': TradeSerializer(all_trades, many=True).data,
                  'broker': BrokerSerializer(broker).data
               }

    return Response(response)
