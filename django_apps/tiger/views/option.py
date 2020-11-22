from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import APIException

from tiger.serializers import TickerSerializer, BuyCallSerializer, SellCoveredCallSerializer
from tiger.models import Ticker
from tiger.classes import BuyCall, SellCoveredCall


def get_valid_calls(ticker, request, all_expiration_timestamps):
    input_expiration_timestamps = set([int(ts) for ts in request.query_params.getlist('expiration_timestamps') if
                                       int(ts) in all_expiration_timestamps])
    valid_calls = []
    for ts in input_expiration_timestamps:
        calls, _ = ticker.get_option_contracts(ts)
        valid_calls.append(calls)
    return valid_calls


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
def calls(request, ticker_symbol):
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')

    try:
        target_price = float(request.query_params.get('target_price'))
        month_to_gain = float(request.query_params.get('month_to_percent_gain'))
        use_as_premium = request.query_params.get('use_as_premium', 'estimated')
    except Exception:
        raise APIException('Invalid query parameters.')
    if target_price < 0.0 or month_to_gain < 0.0 or month_to_gain > 1.0:
        raise APIException('Invalid query parameters.')

    all_calls = []
    for calls in get_valid_calls(ticker, request, all_expiration_timestamps):
        for call in calls:
            if not BuyCall.is_valid(call):
                continue
            all_calls.append(
                BuyCall(call, ticker.get_quote().get('regularMarketPrice'), target_price,
                        month_to_gain, use_as_premium))
    all_calls = list(filter(lambda call: call.gain is not None and call.gain > 0.0, all_calls))
    all_calls = sorted(all_calls, key=lambda call: call.gain_after_tradeoff, reverse=True)
    return Response({'all_calls': BuyCallSerializer(all_calls, many=True).data})


@api_view(['GET'])
def sell_covered_calls(request, ticker_symbol):
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')
    use_as_premium = request.query_params.get('use_as_premium', 'estimated')

    all_calls = []
    for calls in get_valid_calls(ticker, request, all_expiration_timestamps):
        for call in calls:
            if not SellCoveredCall.is_valid(call):
                continue
            all_calls.append(
                SellCoveredCall(call, ticker.get_quote().get('regularMarketPrice'), use_as_premium))
    all_calls = sorted(all_calls, key=lambda call: (call.strike, call.expiration))
    return Response({'all_calls': SellCoveredCallSerializer(all_calls, many=True).data})
