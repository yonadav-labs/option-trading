from rest_framework import serializers
from tiger.models import TickerStats


class TickerStatsSerializer(serializers.ModelSerializer):
    symbol = serializers.SerializerMethodField()

    def get_symbol(self, obj):
        return obj.ticker.symbol

    class Meta:
        model = TickerStats
        fields = '__all__'
