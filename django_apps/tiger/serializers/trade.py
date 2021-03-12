from rest_framework import serializers

from tiger.models import Ticker
from .custom_fields import RatioDecimalField, DollarDecimalField

'''
The following serializer is for display-only!
'''


class TickerSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Ticker
        fields = ['id', 'symbol', 'full_name', ]


class StockSerializer(serializers.Serializer):
    ticker = TickerSerializer()
    external_cache_id = serializers.IntegerField(allow_null=True)
    stock_price = DollarDecimalField()
    display_name = serializers.ReadOnlyField()


class OptionContractSerializer(serializers.Serializer):
    ticker = TickerSerializer()
    external_cache_id = serializers.IntegerField(allow_null=True)
    is_call = serializers.BooleanField(allow_null=False)
    ask = DollarDecimalField()
    bid = DollarDecimalField()
    contract_symbol = serializers.CharField(max_length=100)
    expiration = serializers.IntegerField(min_value=0)
    strike = DollarDecimalField()
    change = DollarDecimalField()
    contract_size = serializers.CharField()
    currency = serializers.CharField()
    implied_volatility = RatioDecimalField()
    in_the_money = serializers.BooleanField()
    last_price = DollarDecimalField()
    last_trade_date = serializers.IntegerField(min_value=0)
    open_interest = serializers.IntegerField(min_value=0)
    percent_change = RatioDecimalField()
    volume = serializers.IntegerField(allow_null=True)
    days_till_expiration = serializers.IntegerField(min_value=0)

    high_price = DollarDecimalField()
    low_price = DollarDecimalField()
    open_price = DollarDecimalField()
    close_price = DollarDecimalField()
    time_value = DollarDecimalField()
    bid_size = serializers.IntegerField()
    ask_size = serializers.IntegerField()
    delta = RatioDecimalField()
    gamma = RatioDecimalField()
    theta = RatioDecimalField()
    vega = RatioDecimalField()
    rho = RatioDecimalField()
    theoretical_volatility = RatioDecimalField()
    theoretical_option_value = DollarDecimalField()
    quote_time = serializers.IntegerField(min_value=0)

    stock_price = DollarDecimalField()

    display_name = serializers.ReadOnlyField()
    bid_ask_spread = DollarDecimalField()
    to_strike = DollarDecimalField()
    to_strike_ratio = RatioDecimalField()
    mark = DollarDecimalField()
    break_even_price = DollarDecimalField()
    to_break_even_ratio = RatioDecimalField()


class LegSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    is_long = serializers.BooleanField()
    units = serializers.IntegerField(min_value=0)
    cash = serializers.ReadOnlyField(source='is_cash')
    stock = StockSerializer(allow_null=True)
    contract = OptionContractSerializer(allow_null=True)
    premium_type = serializers.ReadOnlyField()
    premium_used = serializers.ReadOnlyField()
    cost = DollarDecimalField()
    display_name = serializers.ReadOnlyField()


class TradeSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    type = serializers.CharField(max_length=50)
    stock = StockSerializer()  # The underlying.
    legs = LegSerializer(required=True, many=True)
    premium_type = serializers.ReadOnlyField()
    target_price_lower = DollarDecimalField()
    target_price_upper = DollarDecimalField()

    break_even_price = DollarDecimalField()
    to_break_even_ratio = RatioDecimalField()
    display_name = serializers.ReadOnlyField()
    cost = DollarDecimalField()
    min_expiration = serializers.ReadOnlyField()
    min_days_till_expiration = serializers.ReadOnlyField()
    min_last_trade_date = serializers.ReadOnlyField()
    min_open_interest = serializers.ReadOnlyField()
    min_volume = serializers.ReadOnlyField()
    max_bid_ask_spread = DollarDecimalField()
    to_target_price_lower_ratio = RatioDecimalField()
    to_target_price_upper_ratio = RatioDecimalField()
    target_price_profit = DollarDecimalField()
    target_price_profit_ratio = RatioDecimalField()
    profit_cap = DollarDecimalField()
    profit_cap_ratio = RatioDecimalField()
    graph_x_points = serializers.ListField(child=DollarDecimalField())
    graph_y_points = serializers.ListField(child=DollarDecimalField())

    # TODO: re-consider those metrics.
    # premium_profit = serializers.FloatField(allow_null=True)  # CoveredCall, CashSecuredPut only
    # premium_profit_ratio = serializers.ReadOnlyField()  # CoveredCall, CashSecuredPut only
    # cash_required = serializers.FloatField(allow_null=True, min_value=0.0)  # CashSecuredPut only
