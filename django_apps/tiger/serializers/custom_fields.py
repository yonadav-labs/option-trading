from rest_framework import serializers


class ReadOnlyDollarDecimalField(serializers.ReadOnlyField):
    def to_representation(self, value):
        if value is not None:
            val_str = f'{value:.2f}'
            return float(val_str)


class ReadOnlyRatioDecimalField(serializers.ReadOnlyField):
    def to_representation(self, value):
        if value is not None:
            val_str = f'{value:.4f}'
            return float(val_str)
