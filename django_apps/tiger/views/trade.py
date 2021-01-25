import logging

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from tiger.core import Stock, TradeFactory
from tiger.models import Ticker
from tiger.serializers import TradeSerializer
from tiger.utils import days_from_timestamp
from tiger.views.utils import get_valid_contracts

logger = logging.getLogger('console_info')


def filter_and_sort_trades(input_trades):
    output_trades = list(filter(lambda trade: trade is not None and trade.target_price_profit > 0.0, input_trades))
    return sorted(output_trades, key=lambda trade: -trade.target_price_profit_ratio)


@api_view(['GET'])
def get_best_trades(request, ticker_symbol):
    logger.info(ticker_symbol.upper())  # demo of logging.
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')

    try:
        use_as_premium = request.query_params.get('use_as_premium', 'estimated')
        target_price_lower = float(request.query_params.get('target_price_lower'))
        target_price_upper = float(request.query_params.get('target_price_upper'))
        assert target_price_lower <= target_price_upper
    except Exception:
        raise APIException('Invalid query parameters.')

    available_cash = request.query_params.get('available_cash')
    if available_cash is not None:
        available_cash = float(available_cash)

    quote, external_cache_id = ticker.get_quote()
    stock_price = quote.get('regularMarketPrice')  # This is from Yahoo.
    stock = Stock(ticker, stock_price, external_cache_id)

    all_trades = []
    call_contract_lists, put_contract_list = get_valid_contracts(
        ticker, request, use_as_premium, all_expiration_timestamps, filter_low_liquidity=True)
    for calls_per_exp in call_contract_lists:
        for call in calls_per_exp:
            # Reduce response size.
            if days_from_timestamp(call.last_trade_date) <= -7:
                continue
            all_trades.append(
                TradeFactory.build_long_call(stock, call, target_price_lower, target_price_upper,
                                             available_cash=available_cash))
            all_trades.append(
                TradeFactory.build_covered_call(stock, call, target_price_lower, target_price_upper,
                                                available_cash=available_cash))

    for puts_per_exp in put_contract_list:
        for put in puts_per_exp:
            # Reduce response size.
            if days_from_timestamp(put.last_trade_date) <= -7:
                continue
            all_trades.append(
                TradeFactory.build_long_put(stock, put, target_price_lower, target_price_upper,
                                            available_cash=available_cash))
            all_trades.append(
                TradeFactory.build_cash_secured_put(stock, put, target_price_lower, target_price_upper,
                                                    available_cash=available_cash))

    # Bull call spread
    # TODO: add tests.
    bull_call_spread_trades = []
    for calls_per_exp in call_contract_lists:
        sampled_calls = sorted(calls_per_exp, key=lambda call: (call.volume, call.open_interest), reverse=True)[:100]
        for low_strike_call in sampled_calls:
            for high_strike_call in sampled_calls:
                if low_strike_call.strike >= high_strike_call.strike:
                    continue
                bull_call_spread_trades.append(
                    TradeFactory.build_bull_call_spread(stock, low_strike_call, high_strike_call, target_price_lower,
                                                        target_price_upper, available_cash=available_cash))
    bull_call_spread_trades = filter_and_sort_trades(bull_call_spread_trades)[:100]

    all_trades = all_trades + bull_call_spread_trades
    all_trades = filter_and_sort_trades(all_trades)
    return Response({'trades': TradeSerializer(all_trades, many=True).data})
