from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from tiger.serializers import UserSerializer
from tiger.models import Broker


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_brokers(request):
    broker_ids = request.data.get('brokers')
    request.user.brokers.clear()

    for broker_id in broker_ids:
        broker = get_object_or_404(Broker, pk=broker_id)
        request.user.brokers.add(broker)

    return Response('success')
