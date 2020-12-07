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

    estimated_premium = serializers.FloatField(min_value=0.0, allow_null=True)
    break_even_price = serializers.FloatField(min_value=0.0, allow_null=True)
    to_break_even_ratio = serializers.FloatField(allow_null=True)
    to_break_even_ratio_annualized = serializers.FloatField(allow_null=True)
    days_till_expiration = serializers.IntegerField(min_value=0)
    current_stock_price = serializers.FloatField(min_value=0.0)
    to_strike = serializers.FloatField()
    to_strike_ratio = serializers.FloatField()
    to_strike_ratio_annualized = serializers.FloatField()


class BuyCallSerializer(OptionContractSerializer):
    target_stock_price = serializers.FloatField(min_value=0.0)
    gain = serializers.FloatField(allow_null=True)
    gain_annualized = serializers.FloatField(allow_null=True)
    gain_daily = serializers.FloatField(allow_null=True)
    gain_after_tradeoff = serializers.FloatField(allow_null=True)
    to_target_price_ratio = serializers.FloatField()
    to_target_price_ratio_annualized = serializers.FloatField()


class SellCoveredCallSerializer(OptionContractSerializer):
    gain_cap = serializers.FloatField(allow_null=True)
    gain_cap_annualized = serializers.FloatField(allow_null=True)
    premium_gain = serializers.FloatField(allow_null=True)
    premium_gain_annualized = serializers.FloatField(allow_null=True)


class SellCashSecuredPutSerializer(OptionContractSerializer):
    premium_gain = serializers.FloatField(allow_null=True)
    premium_gain_annualized = serializers.FloatField(allow_null=True)
    cash_required = serializers.FloatField(allow_null=True, min_value=0.0)
