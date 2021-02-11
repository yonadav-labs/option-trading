from rest_framework import serializers
from tiger.models import User

from .subscription import SubscriptionSerializer


class UserSerializer(serializers.ModelSerializer):
    subscription = serializers.SerializerMethodField()

    def get_subscription(self, obj):
        subscription = obj.get_subscription()
        if subscription:
            serializer = SubscriptionSerializer(subscription)
            return serializer.data

    class Meta:
        model = User
        fields = ('username', 'email', 'id', 'okta_id', 'subscription')
