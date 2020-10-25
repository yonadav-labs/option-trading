from tiger.models import Ticker
from rest_framework import serializers


class TickerSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Ticker
        fields = ['symbol', 'full_name', ]


class OptionContractSerializer(serializers.Serializer):
    ask = serializers.FloatField(min_value=0.0)
    bid = serializers.FloatField(min_value=0.0)
    contract_symbol = serializers.CharField(max_length=100)
    expiration = serializers.DateTimeField()
    strike = serializers.FloatField(min_value=0.0)
    estimated_price = serializers.FloatField(min_value=0.0)
    break_even_price = serializers.FloatField(min_value=0.0)