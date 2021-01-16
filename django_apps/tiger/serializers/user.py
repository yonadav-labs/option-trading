from rest_framework import serializers
from tiger.models import User

from .subscription import SubscriptionSerializer


class UserSerializer(serializers.ModelSerializer):
    subscriptions = SubscriptionSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'id', 'okta_id', 'subscriptions')
