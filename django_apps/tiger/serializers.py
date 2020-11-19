from tiger.models import Ticker, User
from rest_framework import serializers


class TickerSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Ticker
        fields = ['symbol', 'full_name', ]


class OptionContractSerializer(serializers.Serializer):
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

    estimated_premium = serializers.FloatField(min_value=0.0, allow_null=True)
    break_even_price = serializers.FloatField(min_value=0.0, allow_null=True)
    days_till_expiration = serializers.IntegerField(min_value=0)
    current_stock_price = serializers.FloatField(min_value=0.0)


class BuyCallSerializer(OptionContractSerializer):
    gain = serializers.FloatField(allow_null=True)
    gain_after_tradeoff = serializers.FloatField(allow_null=True)
    stock_gain = serializers.FloatField()
    normalized_score = serializers.FloatField()


class SellCoveredCallSerializer(OptionContractSerializer):
    to_strike = serializers.FloatField()
    to_strike_ratio = serializers.FloatField()
    gain_cap = serializers.FloatField(allow_null=True)
    annualized_gain_cap = serializers.FloatField(allow_null=True)
    premium_gain = serializers.FloatField(allow_null=True)
    annualized_premium_gain = serializers.FloatField(allow_null=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'id', 'okta_id', 'is_subscriber', 'first_name', 'last_name', 'is_superuser',
                  'is_staff', 'is_active', 'watchlist')
