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
    except Exception:
        raise APIException('Invalid query parameters.')

    target_price = request.query_params.get('target_price')
    if target_price is not None:
        target_price = float(target_price)

    available_cash = request.query_params.get('available_cash')
    if available_cash is not None:
        available_cash = float(available_cash)

    quote, external_cache_id = ticker.get_quote()
    stock_price = quote.get('regularMarketPrice')  # This is from Yahoo.
    stock = Stock(ticker, stock_price, external_cache_id)

    all_trades = []
    call_contract_lists, put_contract_list = get_valid_contracts(ticker, request, use_as_premium,
                                                                 all_expiration_timestamps)
    for calls_per_exp in call_contract_lists:
        for call in calls_per_exp:
            # Reduce response size.
            if days_from_timestamp(call.last_trade_date) <= -7:
                continue
            all_trades.append(TradeFactory.build_long_call(stock, call, target_price, available_cash))
            all_trades.append(TradeFactory.build_covered_call(stock, call, target_price, available_cash))

    for puts_per_exp in put_contract_list:
        for put in puts_per_exp:
            # Reduce response size.
            if days_from_timestamp(put.last_trade_date) <= -7:
                continue
            all_trades.append(TradeFactory.build_long_put(stock, put, target_price, available_cash))
            all_trades.append(TradeFactory.build_cash_secured_put(stock, put, target_price, available_cash))

    # Bull call spread
    # TODO: add tests.
    for calls_per_exp in call_contract_lists:
        # TODO: find a better way to reduce response size.
        sampled_calls = sorted(calls_per_exp, key=lambda call: (call.volume, call.open_interest), reverse=True)[:40]
        combos = ((itm_call, otm_call) for itm_call in sampled_calls for otm_call in sampled_calls)
        for itm_call, otm_call in combos:
            if not itm_call.in_the_money or otm_call.in_the_money:
                continue
            if target_price is not None and otm_call.strike < target_price:
                # No reason to cap gain below target price.
                continue
            all_trades.append(
                TradeFactory.build_bull_call_spread(stock, itm_call, otm_call, target_price, available_cash))

    all_trades = list(filter(lambda trade: trade is not None, all_trades))
    if target_price is not None:
        all_trades = list(filter(lambda trade: trade.target_price_profit > 0.0, all_trades))
        all_trades = sorted(all_trades, key=lambda trade: -trade.target_price_profit_ratio)
    return Response({'trades': TradeSerializer(all_trades, many=True).data})
