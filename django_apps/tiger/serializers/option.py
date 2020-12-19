from tiger.models import Ticker
from rest_framework import serializers


class TickerSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Ticker
        fields = ['symbol', 'full_name', ]


class OptionContractSerializer(serializers.Serializer):
    is_call = serializers.BooleanField(allow_null=False)
    ask = serializers.FloatField(min_value=0.0, allow_null=True)
    bid = serializers.FloatField(min_value=0.0, allow_null=True)
    contract_symbol = serializers.CharField(max_length=100)
    expiration = serializers.IntegerField(min_value=0)
    strike = serializers.FloatField(min_value=0.0)
    change = serializers.FloatField()
    contract_size = serializers.CharField()
    currency = serializers.CharField()
    implied_volatility = serializers.FloatField()
    in_the_money = serializers.BooleanField()
    last_price = serializers.FloatField(min_value=0.0, allow_null=True)
    last_trade_date = serializers.IntegerField(min_value=0)
    open_interest = serializers.IntegerField(min_value=0)
    percent_change = serializers.FloatField()
    volume = serializers.IntegerField(allow_null=True)

    days_till_expiration = serializers.IntegerField(min_value=0)
    stock_price = serializers.FloatField(min_value=0.0)


class TradeSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    contract = OptionContractSerializer()
    estimated_premium = serializers.FloatField(min_value=0.0, allow_null=True)

    target_price = serializers.FloatField(min_value=0.0)
    to_target_price_ratio = serializers.FloatField()
    target_price_profit = serializers.FloatField(allow_null=True)

    break_even_price = serializers.FloatField(min_value=0.0, allow_null=True)
    to_break_even_ratio = serializers.FloatField(allow_null=True)

    to_strike = serializers.FloatField()
    to_strike_ratio = serializers.FloatField()


class BuyCallSerializer(TradeSerializer):
    pass


class BuyPutSerializer(TradeSerializer):
    pass


class SellCoveredCallSerializer(TradeSerializer):
    profit_cap = serializers.FloatField(allow_null=True)
    premium_profit = serializers.FloatField(allow_null=True)


class SellCashSecuredPutSerializer(TradeSerializer):
    premium_profit = serializers.FloatField(allow_null=True)
    cash_required = serializers.FloatField(allow_null=True, min_value=0.0)
