from tiger.models import User, ExternalRequestCache, Ticker, StockSnapshot, OptionContractSnapshot, LegSnapshot, \
    TradeSnapshot
from rest_framework import serializers


class CreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id',)


class TickerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticker
        fields = ('id',)


class ExternalRequestCache(serializers.ModelSerializer):
    class Meta:
        model = ExternalRequestCache
        fields = ('id',)


class StockSnapshotSerializer(serializers.ModelSerializer):
    ticker = TickerSerializer()
    external_cache = ExternalRequestCache()

    class Meta:
        model = StockSnapshot
        fields = ('id', 'ticker', 'external_cache')


class OptionContractSnapshotSerializer(serializers.ModelSerializer):
    ticker = TickerSerializer()
    external_cache = ExternalRequestCache()

    class Meta:
        model = OptionContractSnapshot
        fields = ('id', 'ticker', 'is_call', 'strike', 'expiration_timestamp', 'premium', 'external_cache')


class LegSnapshotSerializer(serializers.ModelSerializer):
    contract_snapshot = OptionContractSnapshotSerializer()

    class Meta:
        model = LegSnapshot
        fields = ('id', 'is_long', 'units', 'cash_snapshot', 'stock_snapshot', 'contract_snapshot')


class TradeSnapshotSerializer(serializers.ModelSerializer):
    creator = CreatorSerializer()
    stock_snapshot = StockSnapshotSerializer()
    leg_snapshots = LegSnapshotSerializer(many=True)

    class Meta:
        model = TradeSnapshot
        fields = ('id', 'type', 'stock_snapshot', 'leg_snapshots', 'creator', 'is_public')
        depth = 2
