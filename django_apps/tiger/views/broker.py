from rest_framework import viewsets
from rest_framework_tracking.mixins import LoggingMixin

from tiger.models import Broker
from tiger.serializers import BrokerSerializer


class BrokerViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Broker.objects.filter(is_active=True)
    serializer_class = BrokerSerializer 
