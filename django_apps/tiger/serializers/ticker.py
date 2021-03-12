from rest_framework import serializers

from tiger.models import TickerStats
from .custom_fields import RatioDecimalField, DollarDecimalField

class TickerStatsSerializer(serializers.ModelSerializer):
    symbol = serializers.SerializerMethodField()
    pe_ratio = RatioDecimalField()
    market_cap = DollarDecimalField()
    dividend_payment_amount = DollarDecimalField()
    market_cap = DollarDecimalField()
    week52_high = DollarDecimalField()
    week52_low = DollarDecimalField()
    week52_high_split_adjust_only = DollarDecimalField()
    week52_low_split_adjust_only = DollarDecimalField()
    day200_moving_avg = DollarDecimalField()
    day50_moving_avg = DollarDecimalField()
    ttm_eps = DollarDecimalField()
    ttm_dividend_rate = RatioDecimalField()
    dividend_yield = RatioDecimalField()
    beta = RatioDecimalField()
    price_target_average = DollarDecimalField()
    price_target_high = DollarDecimalField()
    price_target_low = DollarDecimalField()

    def get_symbol(self, obj):
        return obj.ticker.symbol

    class Meta:
        model = TickerStats
        fields = '__all__'
