from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from tiger.models import Ticker
from tiger.serializers import TickerSerializer


class TickerViewSet(viewsets.ModelViewSet):
    serializer_class = TickerSerializer
    queryset = Ticker.objects.filter(status="unspecified")
    lookup_field = 'symbol'

    @action(detail=True, methods=['GET'])
    def expire_dates(self, request, *args, **kwargs):
        ticker = self.get_object()
        expiration_timestamps = ticker.get_expiration_timestamps()

        if expiration_timestamps is None:
            return Response(status=500)

        resp = {
            'quote': ticker.get_quote()[0],
            'expiration_timestamps': expiration_timestamps
        }

        return Response(resp)
