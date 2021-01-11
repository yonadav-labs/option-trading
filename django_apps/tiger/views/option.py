import itertools
import logging
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated

from tiger.serializers import TickerSerializer, OptionContractSerializer, TradeSerializer, TradeSnapshotSerializer
from tiger.models import Ticker, TradeSnapshot
from tiger.core import LongCall, CoveredCall, LongPut, CashSecuredPut, OptionContract, Stock, Trade, TradeFactory

logger = logging.getLogger('console_info')


def get_valid_contracts(ticker, request, use_as_premium, all_expiration_timestamps):
    input_expiration_timestamps = set([int(ts) for ts in request.query_params.getlist('expiration_timestamps') if
                                       int(ts) in all_expiration_timestamps])
    call_lists = []
    put_lists = []
    for ts in input_expiration_timestamps:
        calls, puts = ticker.get_call_puts(use_as_premium, ts)
        # filter out inactive contracts.
        call_lists.append(list(filter(lambda call: call.last_trade_date, calls)))
        put_lists.append(list(filter(lambda put: put.last_trade_date, puts)))
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
            all_trades.append(TradeFactory.build_long_call(stock, call, target_price, available_cash))
            all_trades.append(TradeFactory.build_covered_call(stock, call, target_price, available_cash))
            # TODO: enable bull call spread once we figure out the result size problem.
            # for call2 in calls_per_exp:
            #     if call2.strike > call.strike:
            #         if target_price is not None and call2.strike < target_price:
            #             # No reason to cap gain below target price.
            #             continue
            #         all_trades.append(
            #             TradeFactory.build_bull_call_spread(stock, call, call2, target_price, available_cash))

    for puts_per_exp in put_contract_list:
        for put in puts_per_exp:
            all_trades.append(TradeFactory.build_long_put(stock, put, target_price, available_cash))
            all_trades.append(TradeFactory.build_cash_secured_put(stock, put, target_price, available_cash))

    all_trades = list(filter(lambda trade: trade is not None, all_trades))
    if target_price is not None:
        all_trades = list(filter(lambda trade: trade.target_price_profit > 0.0, all_trades))
        all_trades = sorted(all_trades, key=lambda trade: -trade.target_price_profit_ratio)
    return Response({'trades': TradeSerializer(all_trades, many=True).data})


@api_view(['GET'])
def trade_snapshot_detail(request, pk):
    trade_snapshot = get_object_or_404(TradeSnapshot, pk=pk)

    if request.method == 'GET':
        if not trade_snapshot.is_public and trade_snapshot.creator.id != request.user.id:
            return Response(status=status.HTTP_404_NOT_FOUND)

        trade = Trade.from_snapshot(trade_snapshot)
        trade_serializer = TradeSerializer(trade)
        return Response({'trade_snaphost': trade_serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trade_snapshots(request):
    if request.method == 'POST':
        request.data['creator_id'] = request.user.id
        trade_snapshot_serializer = TradeSnapshotSerializer(data=request.data)
        if trade_snapshot_serializer.is_valid():
            trade_snapshot = trade_snapshot_serializer.save()
            return Response({'id': trade_snapshot.id}, status=status.HTTP_201_CREATED)
        return Response(trade_snapshot_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
