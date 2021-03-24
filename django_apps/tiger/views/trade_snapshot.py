import json
import logging

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from tiger.blob_reader import get_quote
from tiger.core.trade.trade_factory import TradeFactory
from tiger.models import TradeSnapshot
from tiger.serializers import TradeSerializer, TradeSnapshotSerializer, BrokerSerializer
from tiger.views.utils import get_current_trade, get_broker

logger = logging.getLogger('console_info')


@api_view(['GET'])
def trade_snapshot_detail(request, pk):
    trade_snapshot = get_object_or_404(TradeSnapshot, pk=pk)

    if request.method == 'GET':
        if not trade_snapshot.is_public and trade_snapshot.creator.id != request.user.id:
            return Response(status=status.HTTP_404_NOT_FOUND)

        broker = get_broker(request.user)
        broker_settings = broker.get_broker_settings()
        broker_serializer = BrokerSerializer(broker)

        trade = TradeFactory.from_snapshot(trade_snapshot, broker_settings)
        trade_serializer = TradeSerializer(trade)

        response = json.loads(trade_snapshot.stock_snapshot.external_cache.response_blob)
        quote = get_quote(response, True)

        current_trade = get_current_trade(trade_snapshot, broker_settings)
        if current_trade:
            current_trade_serializer = TradeSerializer(current_trade)
            current_trade_snapshot = current_trade_serializer.data
        else:
            current_trade_snapshot = None

        resp = {
            'trade_snapshot': trade_serializer.data,
            'current_trade_snapshot': current_trade_snapshot,
            'quote': quote,
            'broker': broker_serializer.data
        }

        return Response(resp)


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


@api_view(['POST'])
def trade_snapshots_on_the_fly(request):
    if request.method == 'POST':
        trade_snapshot_serializer = TradeSnapshotSerializer(data=request.data)
        if trade_snapshot_serializer.is_valid():
            trade = TradeFactory.from_snapshot_dict(trade_snapshot_serializer.validated_data)
            trade_serializer = TradeSerializer(trade)
            return Response({'trade_snapshot': trade_serializer.data},
                            status=status.HTTP_201_CREATED)

        return Response(trade_snapshot_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
