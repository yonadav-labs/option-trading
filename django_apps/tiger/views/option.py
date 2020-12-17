from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import APIException

from tiger.serializers import TickerSerializer, SellCoveredCallSerializer, \
    SellCashSecuredPutSerializer, BuyCallSerializer, BuyPutSerializer, TradeSerializer
from tiger.models import Ticker
from tiger.classes import BuyCall, SellCoveredCall, BuyPut, SellCashSecuredPut, OptionContract


def get_valid_contracts(ticker, request, all_expiration_timestamps, get_calls=True):
    input_expiration_timestamps = set([int(ts) for ts in request.query_params.getlist('expiration_timestamps') if
                                       int(ts) in all_expiration_timestamps])
    valid_contracts = []
    for ts in input_expiration_timestamps:
        calls, puts = ticker.get_call_puts(ts)
        if get_calls:
            valid_contracts.append(calls)
        else:
            valid_contracts.append(puts)
    return valid_contracts


@api_view(['GET'])
def ticker_list(request, format=None):
    """
    List all tickers that have option.
    """
    if request.method == 'GET':
        tickers = Ticker.objects.filter(status="unspecified")
        serializer = TickerSerializer(tickers, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def ticker(request, ticker_symbol, format=None):
    if request.method == 'GET':
        ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
        expiration_timestamps = ticker.get_expiration_timestamps()
        if expiration_timestamps is None:
            return Response(status=500)
        return Response({'quote': ticker.get_quote(), 'expiration_timestamps': expiration_timestamps})


@api_view(['GET'])
def sell_covered_calls(request, ticker_symbol):
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')
    use_as_premium = request.query_params.get('use_as_premium', 'estimated')

    all_calls = []
    for calls_per_exp in get_valid_contracts(ticker, request, all_expiration_timestamps):
        for contract in calls_per_exp:
            # TODO: fix this 10.0.
            all_calls.append(SellCoveredCall(contract, 10.0, use_as_premium))
    return Response({'all_calls': SellCoveredCallSerializer(all_calls, many=True).data})


@api_view(['GET'])
def sell_cash_secured_puts(request, ticker_symbol):
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')
    use_as_premium = request.query_params.get('use_as_premium', 'estimated')

    all_puts = []
    for puts_per_exp in get_valid_contracts(ticker, request, all_expiration_timestamps, get_calls=False):
        for contract in puts_per_exp:
            # TODO: fix this 10.0.
            all_puts.append(SellCashSecuredPut(contract, 10.0, use_as_premium))
    return Response({'all_puts': SellCashSecuredPutSerializer(all_puts, many=True).data})


@api_view(['GET'])
def get_best_trades(request, ticker_symbol):
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')

    try:
        target_price = float(request.query_params.get('target_price'))
        use_as_premium = request.query_params.get('use_as_premium', 'estimated')
    except Exception:
        raise APIException('Invalid query parameters.')

    stock_price = ticker.get_quote().get('regularMarketPrice')

    all_trades = []

    for calls_per_exp in get_valid_contracts(ticker, request, all_expiration_timestamps):
        for call in calls_per_exp:
            # all_trades.append(SellCoveredCall(call, target_price, use_as_premium))
            if target_price > stock_price:
                all_trades.append(BuyCall(call, target_price, use_as_premium))

    for puts_per_exp in get_valid_contracts(ticker, request, all_expiration_timestamps, get_calls=False):
        for put in puts_per_exp:
            # all_trades.append(SellCashSecuredPut(put, target_price, use_as_premium))
            if target_price < stock_price:
                all_trades.append(BuyPut(put, target_price, use_as_premium))

    all_trades = list(filter(lambda trade: trade.gain is not None and trade.gain > 0.0, all_trades))
    return Response({'trades': TradeSerializer(all_trades, many=True).data})
