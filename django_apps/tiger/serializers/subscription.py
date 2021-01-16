from rest_framework import serializers
from tiger.models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ('paypal_subscription_id', 'user', 'status', 'last_checked')
