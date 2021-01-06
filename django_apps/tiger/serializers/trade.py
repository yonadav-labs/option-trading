from django.db import transaction
from tiger.models import Ticker
from rest_framework import serializers

'''
The following serializer is for display-only!
'''


class TickerSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Ticker
        fields = ['symbol', 'full_name', ]


class StockSerializer(serializers.Serializer):
    ticker_id = serializers.IntegerField()
    external_cache_id = serializers.IntegerField(allow_null=True)
    stock_price = serializers.FloatField(min_value=0.0)


class OptionContractSerializer(serializers.Serializer):
    ticker_id = serializers.IntegerField()
    external_cache_id = serializers.IntegerField(allow_null=True)
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

    mark = serializers.FloatField(allow_null=True, min_value=0.0)
    high_price = serializers.FloatField(allow_null=True, min_value=0.0)
    low_price = serializers.FloatField(allow_null=True, min_value=0.0)
    open_price = serializers.FloatField(allow_null=True, min_value=0.0)
    close_price = serializers.FloatField(allow_null=True, min_value=0.0)
    time_value = serializers.FloatField(allow_null=True, min_value=0.0)
    bid_size = serializers.IntegerField(allow_null=True, min_value=0)
    ask_size = serializers.IntegerField(allow_null=True, min_value=0)
    delta = serializers.FloatField(allow_null=True)
    gamma = serializers.FloatField(allow_null=True)
    theta = serializers.FloatField(allow_null=True)
    vega = serializers.FloatField(allow_null=True)
    rho = serializers.FloatField(allow_null=True)
    theoretical_volatility = serializers.FloatField(allow_null=True)
    theoretical_option_value = serializers.FloatField(allow_null=True)
    quote_time = serializers.IntegerField(min_value=0)

    stock_price = serializers.FloatField(min_value=0.0)
    use_as_premium = serializers.CharField(max_length=20)

    bid_ask_spread = serializers.ReadOnlyField()
    to_strike = serializers.ReadOnlyField()
    to_strike_ratio = serializers.ReadOnlyField()
    premium = serializers.ReadOnlyField()
    break_even_price = serializers.ReadOnlyField()
    to_break_even_ratio = serializers.ReadOnlyField()


class LegSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    is_long = serializers.BooleanField()
    units = serializers.IntegerField(min_value=0)
    stock = StockSerializer(allow_null=True)
    contract = OptionContractSerializer(allow_null=True)
    cost = serializers.ReadOnlyField()


class TradeSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    type = serializers.CharField(max_length=50)
    stock = StockSerializer()  # The underlying.
    break_even_price = serializers.ReadOnlyField()
    to_break_even_ratio = serializers.ReadOnlyField()
    cost = serializers.ReadOnlyField()
    min_expiration = serializers.ReadOnlyField()
    min_days_till_expiration = serializers.ReadOnlyField()
    min_last_trade_date = serializers.ReadOnlyField()
    min_open_interest = serializers.ReadOnlyField()
    min_volume = serializers.ReadOnlyField()
    max_bid_ask_spread = serializers.ReadOnlyField()

    target_price = serializers.FloatField(allow_null=True, min_value=0.0)
    to_target_price_ratio = serializers.ReadOnlyField()
    target_price_profit = serializers.ReadOnlyField()
    target_price_profit_ratio = serializers.ReadOnlyField()

    legs = LegSerializer(required=True, many=True)

    profit_cap = serializers.ReadOnlyField()
    profit_cap_ratio = serializers.ReadOnlyField()

    # TODO: re-consider those metrics.
    # premium_profit = serializers.FloatField(allow_null=True)  # CoveredCall, CashSecuredPut only
    # premium_profit_ratio = serializers.ReadOnlyField()  # CoveredCall, CashSecuredPut only
    # cash_required = serializers.FloatField(allow_null=True, min_value=0.0)  # CashSecuredPut only
