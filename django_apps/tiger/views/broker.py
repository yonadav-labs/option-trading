from rest_framework import viewsets

from tiger.models import Broker
from tiger.serializers import BrokerSerializer


class BrokerViewSet(viewsets.ModelViewSet):
    queryset = Broker.objects.filter(is_active=True)
    serializer_class = BrokerSerializer 
