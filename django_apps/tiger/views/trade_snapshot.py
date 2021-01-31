import logging

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from tiger.core import Trade, TradeFactory
from tiger.models import TradeSnapshot
from tiger.serializers import TradeSerializer, TradeSnapshotSerializer

logger = logging.getLogger('console_info')


@api_view(['GET'])
def trade_snapshot_detail(request, pk):
    trade_snapshot = get_object_or_404(TradeSnapshot, pk=pk)

    if request.method == 'GET':
        if not trade_snapshot.is_public and trade_snapshot.creator.id != request.user.id:
            return Response(status=status.HTTP_404_NOT_FOUND)

        trade = TradeFactory.from_snapshot(trade_snapshot)
        trade_serializer = TradeSerializer(trade)
        return Response({'trade_snapshot': trade_serializer.data})


@api_view(['POST'])
def trade_snapshots(request):
    if request.method == 'POST':
        if request.user:
            request.data['creator_id'] = request.user.id
        trade_snapshot_serializer = TradeSnapshotSerializer(data=request.data)
        if trade_snapshot_serializer.is_valid():
            trade_snapshot = trade_snapshot_serializer.save()
            trade = TradeFactory.from_snapshot(trade_snapshot)
            trade_serializer = TradeSerializer(trade)
            return Response({'id': trade_snapshot.id, 'trade_snapshot': trade_serializer.data},
                            status=status.HTTP_201_CREATED)
        return Response(trade_snapshot_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
