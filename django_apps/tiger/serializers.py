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
    expiration = serializers.IntegerField(min_value=0)
    strike = serializers.FloatField(min_value=0.0)
    estimated_price = serializers.FloatField(min_value=0.0)
    break_even_price = serializers.FloatField(min_value=0.0)
    days_till_expiration = serializers.IntegerField(min_value=0)
    current_stock_price = serializers.FloatField(min_value=0.0)


class BuyCallSerializer(OptionContractSerializer):
    gain = serializers.FloatField()
    gain_after_tradeoff = serializers.FloatField()
    stock_gain = serializers.FloatField()
    normalized_score = serializers.FloatField()


class SellCoveredCallSerializer(OptionContractSerializer):
    strike_diff_ratio = serializers.FloatField()
    gain_cap = serializers.FloatField()
    annualized_gain_cap = serializers.FloatField()
    loss_buffer = serializers.FloatField()
