import json
import logging

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from tiger.core.trade.trade_factory import TradeFactory
from tiger.models import TradeSnapshot
from tiger.serializers import TradeSerializer, TradeSnapshotSerializer, BrokerSerializer, TradeSimpleSerializer
from tiger.views.decorators import tracking_api
from tiger.views.utils import get_current_trade, get_broker

logger = logging.getLogger('console_info')


@tracking_api()
@api_view(['GET'])
def trade_snapshot_detail(request, pk):
    trade_snapshot = get_object_or_404(TradeSnapshot, pk=pk)

    if request.method == 'GET':
        if not trade_snapshot.is_public and \
                (not trade_snapshot.creator or trade_snapshot.creator.id != request.user.id):
            return Response(status=status.HTTP_404_NOT_FOUND)

        broker = get_broker(request.user)
        broker_settings = broker.get_broker_settings()
        broker_serializer = BrokerSerializer(broker)

        trade = TradeFactory.from_snapshot(trade_snapshot, broker_settings)
        trade_serializer = TradeSerializer(trade)

        quote_response = json.loads(trade_snapshot.stock_snapshot.external_cache.response_blob)

        current_trade = get_current_trade(trade_snapshot, broker_settings)
        if current_trade:
            current_trade_serializer = TradeSerializer(current_trade)
            current_trade_snapshot = current_trade_serializer.data
        else:
            current_trade_snapshot = None

        resp = {
            'trade_snapshot': trade_serializer.data,
            'current_trade_snapshot': current_trade_snapshot,
            'quote': quote_response,
            'broker': broker_serializer.data
        }

        return Response(resp)


@tracking_api()
@api_view(['POST'])
def trade_snapshots(request):
    if request.method == 'POST':
        if request.user:
            request.data['creator_id'] = request.user.id
        trade_snapshot_serializer = TradeSnapshotSerializer(data=request.data)
        if trade_snapshot_serializer.is_valid():
            trade_snapshot = trade_snapshot_serializer.save()
            broker = get_broker(request.user)
            broker_settings = broker.get_broker_settings()
            broker_serializer = BrokerSerializer(broker)
            trade = TradeFactory.from_snapshot(trade_snapshot, broker_settings)
            trade_serializer = TradeSerializer(trade)
            response = {
                'id': trade_snapshot.id,
                'trade_snapshot': trade_serializer.data,
                'broker': broker_serializer.data
            }

            return Response(response, status=status.HTTP_201_CREATED)

        return Response(trade_snapshot_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@tracking_api()
@api_view(['POST'])
def trade_snapshots_on_the_fly(request):
    if request.method == 'POST':
        trade_snapshot_serializer = TradeSnapshotSerializer(data=request.data)
        if trade_snapshot_serializer.is_valid():
            broker = get_broker(request.user)
            broker_settings = broker.get_broker_settings()
            trade = TradeFactory.from_snapshot_dict(trade_snapshot_serializer.validated_data, broker_settings)
            trade_serializer = TradeSerializer(trade)
            return Response({'trade_snapshot': trade_serializer.data},
                            status=status.HTTP_201_CREATED)

        return Response(trade_snapshot_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@tracking_api()
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trade_snapshots_history(request):
    """
    get the latest 10 snapshots for the user
    """
    trade_snapshots = request.user.trades.all().order_by('-created_time')[:10]
    broker = get_broker(request.user)
    broker_settings = broker.get_broker_settings()

    resp = []
    for trade_snapshot in trade_snapshots:
        trade = TradeFactory.from_snapshot(trade_snapshot, broker_settings)
        trade.meta = {'snapshot_id': trade_snapshot.id}
        trade_serializer = TradeSimpleSerializer(trade)
        resp.append(trade_serializer.data)

    return Response(resp)
