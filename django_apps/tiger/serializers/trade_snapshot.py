from django.db import transaction
from rest_framework import serializers

from tiger.models import StockSnapshot, OptionContractSnapshot, LegSnapshot, \
    TradeSnapshot

'''
The following serializer is for write-only!
'''


class StockSnapshotSerializer(serializers.ModelSerializer):
    ticker_id = serializers.IntegerField()
    external_cache_id = serializers.IntegerField()

    class Meta:
        model = StockSnapshot
        fields = ('ticker_id', 'external_cache_id')


class OptionContractSnapshotSerializer(serializers.ModelSerializer):
    ticker_id = serializers.IntegerField()
    external_cache_id = serializers.IntegerField()

    class Meta:
        model = OptionContractSnapshot
        fields = ('ticker_id', 'is_call', 'strike', 'expiration_timestamp', 'premium', 'external_cache_id')


class LegSnapshotSerializer(serializers.ModelSerializer):
    stock_snapshot = StockSnapshotSerializer(required=False)
    contract_snapshot = OptionContractSnapshotSerializer(required=False)

    class Meta:
        model = LegSnapshot
        fields = ('is_long', 'units', 'cash_snapshot', 'stock_snapshot', 'contract_snapshot')


def get_subdict_by_fields(adict, keys):
    return dict((k, adict[k]) for k in keys if k in adict)


# TODO: add validators.
class TradeSnapshotSerializer(serializers.ModelSerializer):
    creator_id = serializers.IntegerField()
    stock_snapshot = StockSnapshotSerializer()
    leg_snapshots = LegSnapshotSerializer(many=True)

    @transaction.atomic
    def create(self, validated_trade_snapshot):
        leg_snapshots = []
        for leg_snapshot_data in validated_trade_snapshot.get('leg_snapshots'):
            leg_snapshot_model_data = get_subdict_by_fields(leg_snapshot_data, ['is_long', 'units'])
            if leg_snapshot_data.get('contract_snapshot'):
                contract_snapshot = OptionContractSnapshot.objects.create(**leg_snapshot_data.get('contract_snapshot'))
                leg_snapshot_model_data['contract_snapshot'] = contract_snapshot
            elif leg_snapshot_data.get('stock_snapshot'):
                stock_snapshot = StockSnapshot.objects.create(**leg_snapshot_data.get('stock_snapshot'))
                leg_snapshot_model_data['stock_snapshot'] = stock_snapshot
            elif leg_snapshot_data.get('cash_snapshot'):
                leg_snapshot_model_data['cash_snapshot'] = leg_snapshot_data.get('cash_snapshot')
            leg_snapshots.append(LegSnapshot.objects.create(**leg_snapshot_model_data))

        # Trade attributes
        stock_snapshot = StockSnapshot.objects.create(**validated_trade_snapshot.get('stock_snapshot'))
        trade_snapshot_data = get_subdict_by_fields(
            validated_trade_snapshot, ['type', 'is_public', 'creator_id', 'target_price_lower', 'target_price_upper'])
        trade_snapshot_data['stock_snapshot'] = stock_snapshot
        new_trade_snapshot = TradeSnapshot.objects.create(**trade_snapshot_data)
        for leg_snapshot in leg_snapshots:
            new_trade_snapshot.leg_snapshots.add(leg_snapshot)
        new_trade_snapshot.save()
        return new_trade_snapshot

    class Meta:
        model = TradeSnapshot
        fields = ('type', 'stock_snapshot', 'leg_snapshots', 'is_public', 'creator_id', 'target_price_lower',
                  'target_price_upper')
        depth = 2
