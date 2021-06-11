from rest_framework import serializers

from tiger.models import TickerStats
from .custom_fields import ReadOnlyRatioDecimalField, ReadOnlyDollarDecimalField


class TickerStatsSerializer(serializers.ModelSerializer):
    symbol = serializers.SerializerMethodField()
    pe_ratio = ReadOnlyRatioDecimalField()
    market_cap = ReadOnlyDollarDecimalField()
    dividend_payment_amount = ReadOnlyDollarDecimalField()
    market_cap = ReadOnlyDollarDecimalField()
    week52_high = ReadOnlyDollarDecimalField()
    week52_low = ReadOnlyDollarDecimalField()
    week52_high_split_adjust_only = ReadOnlyDollarDecimalField()
    week52_low_split_adjust_only = ReadOnlyDollarDecimalField()
    day200_moving_avg = ReadOnlyDollarDecimalField()
    day50_moving_avg = ReadOnlyDollarDecimalField()
    ttm_eps = ReadOnlyDollarDecimalField()
    ttm_dividend_rate = ReadOnlyRatioDecimalField()
    dividend_yield = ReadOnlyRatioDecimalField()
    beta = ReadOnlyRatioDecimalField()
    price_target_average = ReadOnlyDollarDecimalField()
    price_target_high = ReadOnlyDollarDecimalField()
    price_target_low = ReadOnlyDollarDecimalField()
    percent_change = serializers.SerializerMethodField()
    historical_volatility = ReadOnlyRatioDecimalField()

    def get_symbol(self, obj):
        return obj.ticker.symbol

    def get_percent_change(self, obj):
        try:
            return obj.percent_change
        except:
            return None

    class Meta:
        model = TickerStats
        fields = '__all__'
