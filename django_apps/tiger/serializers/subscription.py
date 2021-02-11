from rest_framework import serializers
from tiger.models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    detail = serializers.SerializerMethodField()

    def get_detail(self, obj):
        if obj.status == 'ACTIVE':
            return obj.get_detail().json()['billing_info']

    class Meta:
        model = Subscription
        fields = ('paypal_subscription_id', 'user', 'status', 'last_checked', 'detail')
