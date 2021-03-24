from django.db import transaction
from rest_framework import serializers

from tiger.core.trade.trade_factory import TradeFactory
from tiger.models import StockSnapshot, OptionContractSnapshot, LegSnapshot, \
    TradeSnapshot

'''
The following serializer is for write-only!
'''


class StockSnapshotSerializer(serializers.ModelSerializer):
    ticker_id = serializers.IntegerField()
    external_cache_id = serializers.IntegerField()
    ticker_stats_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = StockSnapshot
        fields = ('ticker_id', 'external_cache_id', 'ticker_stats_id')


class OptionContractSnapshotSerializer(serializers.ModelSerializer):
    ticker_id = serializers.IntegerField()
    external_cache_id = serializers.IntegerField()

    class Meta:
        model = OptionContractSnapshot
        fields = ('ticker_id', 'is_call', 'strike', 'expiration_timestamp', 'external_cache_id')


class LegSnapshotSerializer(serializers.ModelSerializer):
    stock_snapshot = StockSnapshotSerializer(required=False, allow_null=True)
    contract_snapshot = OptionContractSnapshotSerializer(required=False, allow_null=True)

    class Meta:
        model = LegSnapshot
        fields = ('is_long', 'units', 'cash_snapshot', 'stock_snapshot', 'contract_snapshot')


def get_subdict_by_fields(adict, keys):
    return dict((k, adict[k]) for k in keys if k in adict)


class TradeSnapshotSerializer(serializers.ModelSerializer):
    creator_id = serializers.IntegerField(required=False, allow_null=True)
    stock_snapshot = StockSnapshotSerializer()
    leg_snapshots = LegSnapshotSerializer(many=True)

    def validate(self, input_trade_data):
        from tiger.views.utils import get_broker

        stock_snapshot = StockSnapshot(**input_trade_data.get('stock_snapshot'))

        leg_snapshots = []
        for leg_snapshot_data in input_trade_data.get('leg_snapshots'):
            leg_snapshot_model_data = get_subdict_by_fields(leg_snapshot_data, ['is_long', 'units'])

            if leg_snapshot_data.get('contract_snapshot'):
                contract_snapshot = OptionContractSnapshot(**leg_snapshot_data.get('contract_snapshot'))
                leg_snapshot_model_data['contract_snapshot'] = contract_snapshot
            elif leg_snapshot_data.get('stock_snapshot'):
                stock_snapshot = StockSnapshot(**leg_snapshot_data.get('stock_snapshot'))
                leg_snapshot_model_data['stock_snapshot'] = stock_snapshot
            elif 'cash_snapshot' in leg_snapshot_data:
                leg_snapshot_model_data['cash_snapshot'] = leg_snapshot_data.get('cash_snapshot')

            leg_snapshots.append(LegSnapshot(**leg_snapshot_model_data))

        input_trade_data['stock_snapshot'] = stock_snapshot
        input_trade_data['leg_snapshots'] = leg_snapshots

        try:
            request = self.context.get('request')
            user = request.user if request else None
            broker = get_broker(user)
            broker_settings = broker.get_broker_settings()
            trade = TradeFactory.from_snapshot_dict(input_trade_data, broker_settings)
        except AssertionError:
            raise serializers.ValidationError("Invalid Trade")

        return input_trade_data

    @transaction.atomic
    def create(self, validated_trade_snapshot):
        validated_trade_snapshot.get('stock_snapshot').save()
        leg_snapshots = validated_trade_snapshot.pop('leg_snapshots')
        trade_snapshot = TradeSnapshot.objects.create(**validated_trade_snapshot)

        for leg_snapshot in leg_snapshots:
            if leg_snapshot.stock_snapshot:
                leg_snapshot.stock_snapshot.save()
            elif leg_snapshot.contract_snapshot:
                leg_snapshot.contract_snapshot.save()

            leg_snapshot.save()
            trade_snapshot.leg_snapshots.add(leg_snapshot)

        return trade_snapshot

    class Meta:
        model = TradeSnapshot
        fields = ('type', 'stock_snapshot', 'leg_snapshots', 'is_public', 'creator_id', 'premium_type',
                  'target_price_lower', 'target_price_upper')
        depth = 2
