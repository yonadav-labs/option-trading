import itertools
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import APIException

from tiger.serializers import TickerSerializer, OptionContractSerializer, TradeSerializer, TradeSnapshotSerializer
from tiger.models import Ticker, TradeSnapshot
from tiger.classes import LongCall, CoveredCall, LongPut, CashSecuredPut, OptionContract, Stock


def get_valid_contracts(ticker, request, use_as_premium, all_expiration_timestamps):
    input_expiration_timestamps = set([int(ts) for ts in request.query_params.getlist('expiration_timestamps') if
                                       int(ts) in all_expiration_timestamps])
    call_lists = []
    put_lists = []
    for ts in input_expiration_timestamps:
        calls, puts = ticker.get_call_puts(use_as_premium, ts)
        call_lists.append(calls)
        put_lists.append(puts)
    return call_lists, put_lists


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
        return Response({'quote': ticker.get_quote()[0], 'expiration_timestamps': expiration_timestamps})


@api_view(['GET'])
def contracts(request, ticker_symbol):
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')
    use_as_premium = request.query_params.get('use_as_premium', 'estimated')

    call_contract_lists, put_contract_list = get_valid_contracts(ticker, request, use_as_premium,
                                                                 all_expiration_timestamps)
    contracts = list(itertools.chain(*call_contract_lists)) + list(itertools.chain(*put_contract_list))
    return Response({'contracts': OptionContractSerializer(contracts, many=True).data})


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

    quote, cache_id = ticker.get_quote()
    stock_price = quote.get('regularMarketPrice')
    stock = Stock(stock_price, cache_id)

    all_trades = []
    call_contract_lists, put_contract_list = get_valid_contracts(ticker, request, use_as_premium,
                                                                 all_expiration_timestamps)
    for calls_per_exp in call_contract_lists:
        for call in calls_per_exp:
            all_trades.append(LongCall(stock_price, call, target_price))
            all_trades.append(CoveredCall(stock_price, stock, call, target_price=target_price))

    for puts_per_exp in put_contract_list:
        for put in puts_per_exp:
            all_trades.append(LongPut(stock_price, put, target_price))
            all_trades.append(CashSecuredPut(stock_price, put, target_price))

    all_trades = list(
        filter(lambda trade: trade.target_price_profit is not None and trade.target_price_profit > 0.0, all_trades))
    sorted(all_trades, key=lambda trade: -trade.target_price_profit_ratio)
    return Response({'trades': TradeSerializer(all_trades, many=True).data})


@api_view(['GET'])
def trade_snapshot_detail(request, pk):
    trade_snapshot = get_object_or_404(TradeSnapshot, pk=pk)

    if request.method == 'GET':
        trade_snapshot_serializer = TradeSnapshotSerializer(trade_snapshot)
        return Response(trade_snapshot_serializer.data)

    # elif request.method == 'PUT':
    #     data = JSONParser().parse(request)
    #     serializer = SnippetSerializer(snippet, data=data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return JsonResponse(serializer.data)
    #     return JsonResponse(serializer.errors, status=400)
    #
    # elif request.method == 'DELETE':
    #     snippet.delete()
    #     return HttpResponse(status=204)
