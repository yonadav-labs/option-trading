from rest_framework import serializers

from tiger.models import Broker


class BrokerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Broker
        exclude = ('is_active',)
