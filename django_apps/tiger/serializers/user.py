from rest_framework import serializers
from tiger.models import User

from .broker import BrokerSerializer
from .subscription import SubscriptionSerializer


class UserSerializer(serializers.ModelSerializer):
    subscription = serializers.SerializerMethodField()
    brokers_detail = serializers.SerializerMethodField()
    referral_link = serializers.SerializerMethodField()
    disallowed_strategies = serializers.SerializerMethodField()

    def get_subscription(self, obj):
        subscription = obj.get_subscription()
        if subscription:
            serializer = SubscriptionSerializer(subscription)
            return serializer.data

    def get_brokers_detail(self, obj):
        serializer = BrokerSerializer(obj.brokers, many=True)
        return serializer.data

    def get_referral_link(self, obj):
        return obj.get_referral_link()

    def get_disallowed_strategies(self, obj):
        return obj.disallowed_strategies

    class Meta:
        model = User
        fields = ('username', 'email', 'id', 'okta_id', 'subscription', 'brokers', \
                  'nick_name', 'brokers_detail', 'disabled_strategies', 'disallowed_strategies', 'referral_link')
