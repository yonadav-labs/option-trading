from rest_framework import serializers
from tiger.models import User

from .subscription import SubscriptionSerializer
from .broker import BrokerSerializer


class UserSerializer(serializers.ModelSerializer):
    subscription = serializers.SerializerMethodField()    
    brokers = BrokerSerializer(many=True)

    def get_subscription(self, obj):
        subscription = obj.get_subscription()
        if subscription:
            serializer = SubscriptionSerializer(subscription)
            return serializer.data

    class Meta:
        model = User
        fields = ('username', 'email', 'id', 'okta_id', 'subscription', 'brokers')
