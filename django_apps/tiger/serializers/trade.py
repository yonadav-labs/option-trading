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
    change = ReadOnlyDollarDecimalField()
    contract_size = serializers.CharField()
    currency = serializers.CharField()
    implied_volatility = ReadOnlyRatioDecimalField()
    in_the_money = serializers.BooleanField()
    last_price = ReadOnlyDollarDecimalField()
    last_trade_date = serializers.IntegerField(min_value=0)
    open_interest = serializers.IntegerField(min_value=0)
    percent_change = ReadOnlyRatioDecimalField()
    volume = serializers.IntegerField(allow_null=True)
    days_till_expiration = serializers.IntegerField(min_value=0)

    high_price = ReadOnlyDollarDecimalField()
    low_price = ReadOnlyDollarDecimalField()
    open_price = ReadOnlyDollarDecimalField()
    close_price = ReadOnlyDollarDecimalField()
    time_value = ReadOnlyDollarDecimalField()
    bid_size = serializers.IntegerField()
    ask_size = serializers.IntegerField()
    delta = ReadOnlyRatioDecimalField()
    gamma = ReadOnlyRatioDecimalField()
    theta = ReadOnlyRatioDecimalField()
    vega = ReadOnlyRatioDecimalField()
    rho = ReadOnlyRatioDecimalField()
    theoretical_volatility = ReadOnlyRatioDecimalField()
    theoretical_option_value = ReadOnlyDollarDecimalField()
    quote_time = serializers.IntegerField(min_value=0)

    stock_price = ReadOnlyDollarDecimalField()

    display_name = serializers.ReadOnlyField()
    bid_ask_spread = ReadOnlyDollarDecimalField()
    to_strike = ReadOnlyDollarDecimalField()
    to_strike_ratio = ReadOnlyRatioDecimalField()
    mark = ReadOnlyDollarDecimalField()
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
    premium_used = serializers.ReadOnlyField()
    cost = ReadOnlyDollarDecimalField()
    display_name = serializers.ReadOnlyField()


class TradeSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    type = serializers.CharField(max_length=50)
    stock = StockSerializer()  # The underlying.
    legs = LegSerializer(required=True, many=True)
    premium_type = serializers.ReadOnlyField()
    target_price_lower = ReadOnlyDollarDecimalField()
    target_price_upper = ReadOnlyDollarDecimalField()

    break_even_price = ReadOnlyDollarDecimalField()
    to_break_even_ratio = ReadOnlyRatioDecimalField()
    display_name = serializers.ReadOnlyField()
    cost = ReadOnlyDollarDecimalField()
    min_expiration = serializers.ReadOnlyField()
    min_days_till_expiration = serializers.ReadOnlyField()
    min_last_trade_date = serializers.ReadOnlyField()
    min_open_interest = serializers.ReadOnlyField()
    min_volume = serializers.ReadOnlyField()
    max_bid_ask_spread = ReadOnlyDollarDecimalField()
    to_target_price_lower_ratio = ReadOnlyRatioDecimalField()
    to_target_price_upper_ratio = ReadOnlyRatioDecimalField()
    target_price_profit = ReadOnlyDollarDecimalField()
    target_price_profit_ratio = ReadOnlyRatioDecimalField()
    profit_cap = ReadOnlyDollarDecimalField()
    profit_cap_ratio = ReadOnlyRatioDecimalField()
    graph_x_points = serializers.ListField(child=ReadOnlyDollarDecimalField())
    graph_y_points = serializers.ListField(child=ReadOnlyDollarDecimalField())
    notional_value = ReadOnlyDollarDecimalField()
    leverage = ReadOnlyRatioDecimalField()
    two_sigma_prices = serializers.ListField(child=ReadOnlyDollarDecimalField())
    two_sigma_profit_lower = ReadOnlyDollarDecimalField()
    two_sigma_profit_lower_price = ReadOnlyDollarDecimalField()
    two_sigma_profit_lower_ratio = ReadOnlyRatioDecimalField()
    ten_percent_best_return_price = ReadOnlyDollarDecimalField()
    ten_percent_best_return = ReadOnlyDollarDecimalField()
    ten_percent_best_return_ratio = ReadOnlyRatioDecimalField()
    ten_percent_worst_return_price = ReadOnlyDollarDecimalField()
    ten_percent_worst_return = ReadOnlyDollarDecimalField()
    ten_percent_worst_return_ratio = ReadOnlyRatioDecimalField()
    quote_time = serializers.ReadOnlyField()
    net_debt_per_unit = ReadOnlyDollarDecimalField()
    commission_cost = ReadOnlyDollarDecimalField()
    profit_prob = ReadOnlyRatioDecimalField()
