from rest_framework import serializers
from tiger.models import Ticker

from .custom_fields import ReadOnlyRatioDecimalField, ReadOnlyDollarDecimalField

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
    ticker_stats_id = serializers.IntegerField(allow_null=True)
    stock_price = ReadOnlyDollarDecimalField()
    display_name = serializers.ReadOnlyField()


class OptionContractSerializer(serializers.Serializer):
    ticker = TickerSerializer()
    external_cache_id = serializers.IntegerField(allow_null=True)
    is_call = serializers.BooleanField(allow_null=False)
    ask = ReadOnlyDollarDecimalField()
    bid = ReadOnlyDollarDecimalField()
    contract_symbol = serializers.CharField(max_length=100)
    expiration = serializers.IntegerField(min_value=0)
    strike = ReadOnlyDollarDecimalField()
    contract_size = serializers.CharField()
    implied_volatility = ReadOnlyRatioDecimalField()
    in_the_money = serializers.BooleanField()
    last_price = ReadOnlyDollarDecimalField()
    last_trade_date = serializers.IntegerField(min_value=0)
    open_interest = serializers.IntegerField(min_value=0)
    volume = serializers.IntegerField(allow_null=True)
    days_till_expiration = serializers.IntegerField(min_value=0)

    bid_size = serializers.IntegerField()
    ask_size = serializers.IntegerField()
    delta = ReadOnlyRatioDecimalField()
    gamma = ReadOnlyRatioDecimalField()
    theta = ReadOnlyRatioDecimalField()
    vega = ReadOnlyRatioDecimalField()

    stock_price = ReadOnlyDollarDecimalField()

    display_name = serializers.ReadOnlyField()
    bid_ask_spread = ReadOnlyDollarDecimalField()
    to_strike = ReadOnlyDollarDecimalField()
    to_strike_ratio = ReadOnlyRatioDecimalField()
    mark = ReadOnlyDollarDecimalField()
    intrinsic_value = ReadOnlyDollarDecimalField()
    extrinsic_value = ReadOnlyDollarDecimalField()
    break_even_price = ReadOnlyDollarDecimalField()
    to_break_even_ratio = ReadOnlyRatioDecimalField()
    notional_value = ReadOnlyDollarDecimalField()
    itm_probability = ReadOnlyRatioDecimalField()
    vol_oi = ReadOnlyRatioDecimalField()


class LegSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    is_long = serializers.BooleanField()
    units = serializers.IntegerField(min_value=0)
    cash = serializers.ReadOnlyField(source='is_cash')
    stock = StockSerializer(allow_null=True)
    contract = OptionContractSerializer(allow_null=True)
    premium_type = serializers.ReadOnlyField()
    cost_per_share = serializers.ReadOnlyField()
    total_cost = ReadOnlyDollarDecimalField()


class TradeSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    type = serializers.CharField(max_length=50)
    stock = StockSerializer()  # The underlying.
    legs = LegSerializer(required=True, many=True)
    premium_type = serializers.ReadOnlyField()
    target_price_lower = ReadOnlyDollarDecimalField()
    target_price_upper = ReadOnlyDollarDecimalField()
    meta = serializers.JSONField(required=False)

    break_evens = serializers.ListField(child=ReadOnlyDollarDecimalField())
    break_even_prices_and_ratios = serializers.JSONField(read_only=True)
    cost = ReadOnlyDollarDecimalField()
    to_target_price_lower_ratio = ReadOnlyRatioDecimalField()
    to_target_price_upper_ratio = ReadOnlyRatioDecimalField()
    target_price_profit = ReadOnlyDollarDecimalField()
    target_price_profit_ratio = ReadOnlyRatioDecimalField()
    best_return = serializers.ReadOnlyField()
    worst_return = serializers.ReadOnlyField()
    reward_to_risk_ratio = ReadOnlyRatioDecimalField()
    graph_points = serializers.JSONField(read_only=True)
    notional_value = ReadOnlyDollarDecimalField()
    leverage = ReadOnlyRatioDecimalField()
    ten_percent_best_return_price = ReadOnlyDollarDecimalField()
    ten_percent_best_return = ReadOnlyDollarDecimalField()
    ten_percent_best_return_ratio = ReadOnlyRatioDecimalField()
    ten_percent_worst_return_price = ReadOnlyDollarDecimalField()
    ten_percent_worst_return = ReadOnlyDollarDecimalField()
    ten_percent_worst_return_ratio = ReadOnlyRatioDecimalField()
    net_debit_per_unit = ReadOnlyDollarDecimalField()
    commission_cost = ReadOnlyDollarDecimalField()
    profit_prob = ReadOnlyRatioDecimalField()
    return_matrix = serializers.JSONField(required=False)

    delta = ReadOnlyRatioDecimalField()
    gamma = ReadOnlyRatioDecimalField()
    theta = ReadOnlyRatioDecimalField()
    vega = ReadOnlyRatioDecimalField()



class TradeSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    type = serializers.CharField(max_length=50)
    stock = StockSerializer()  # The underlying.
    legs = LegSerializer(required=True, many=True)
    premium_type = serializers.ReadOnlyField()
    target_price_lower = ReadOnlyDollarDecimalField()
    target_price_upper = ReadOnlyDollarDecimalField()
    meta = serializers.JSONField(required=False)

    break_evens = serializers.ListField(child=ReadOnlyDollarDecimalField())
    break_even_prices_and_ratios = serializers.JSONField(read_only=True)
    cost = ReadOnlyDollarDecimalField()
    to_target_price_lower_ratio = ReadOnlyRatioDecimalField()
    to_target_price_upper_ratio = ReadOnlyRatioDecimalField()
    target_price_profit = ReadOnlyDollarDecimalField()
    target_price_profit_ratio = ReadOnlyRatioDecimalField()
    best_return = serializers.ReadOnlyField()
    worst_return = serializers.ReadOnlyField()
    reward_to_risk_ratio = ReadOnlyRatioDecimalField()
    graph_points_simple = serializers.JSONField(read_only=True)
    notional_value = ReadOnlyDollarDecimalField()
    leverage = ReadOnlyRatioDecimalField()
    ten_percent_best_return_price = ReadOnlyDollarDecimalField()
    ten_percent_best_return = ReadOnlyDollarDecimalField()
    ten_percent_best_return_ratio = ReadOnlyRatioDecimalField()
    ten_percent_worst_return_price = ReadOnlyDollarDecimalField()
    ten_percent_worst_return = ReadOnlyDollarDecimalField()
    ten_percent_worst_return_ratio = ReadOnlyRatioDecimalField()
    net_debit_per_unit = ReadOnlyDollarDecimalField()
    commission_cost = ReadOnlyDollarDecimalField()
    profit_prob = ReadOnlyRatioDecimalField()

    delta = ReadOnlyRatioDecimalField()
    gamma = ReadOnlyRatioDecimalField()
    theta = ReadOnlyRatioDecimalField()
    vega = ReadOnlyRatioDecimalField()
