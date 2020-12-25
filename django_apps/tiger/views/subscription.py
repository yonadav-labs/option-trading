from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from tiger.serializers import SubscriptionSerializer
from tiger.models import Subscription, User
from tiger.serializers import UserSerializer
import requests

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_subscription(request):
    if request.method == 'POST':
        serializer = UserSerializer(request.user)
        user = User.objects.get(pk=serializer.data.get("id"))
        subscription, created = Subscription.objects.update_or_create(paypal_subscription_id=request.data.get("subscriptionID"), user=user)
        r = subscription.get_status()
        return Response(r)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    if request.method == 'POST':
        serializer = UserSerializer(request.user)
        user = User.objects.get(pk=serializer.data.get("id"))
        subscription = Subscription.objects.filter(user=user, status="ACTIVE").first()
        r = subscription.cancel(request.data.get("reason"))
        return Response(r)