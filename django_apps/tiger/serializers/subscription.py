from tiger.models import Subscription
from rest_framework import serializers


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ('paypal_subscription_id', 'user', 'status', 'last_checked')
