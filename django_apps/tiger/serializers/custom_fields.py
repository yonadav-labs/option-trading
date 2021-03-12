from rest_framework import serializers

class DollarDecimalField(serializers.FloatField):
    def to_representation(self, value):
        if value is not None:
            val_str = f'{value:.2f}'
            return float(val_str)


class RatioDecimalField(serializers.FloatField):
    def to_representation(self, value):
        if value is not None:
            val_str = f'{value:.4f}'
            return float(val_str)
