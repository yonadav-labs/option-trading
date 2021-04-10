from rest_framework import serializers
from tiger.models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    detail = serializers.SerializerMethodField()

    def get_detail(self, obj):
        if obj.status == 'ACTIVE' and obj.paypal_subscription_id:
            return obj.get_detail().json()['billing_info']

    class Meta:
        model = Subscription
        exclude = ('created_time', 'last_updated_time', 'cancellation_reason')
