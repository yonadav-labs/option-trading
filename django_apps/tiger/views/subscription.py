from django.shortcuts import get_object_or_404, get_list_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from tiger.models import Subscription, User


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_subscription(request):
    if request.method == 'POST':
        user = get_object_or_404(User, pk=request.user.id)
        subscription, created = Subscription.objects.update_or_create(
            paypal_subscription_id=request.data.get("subscriptionID"), user=user)
        r = subscription.get_status()
        return Response(r)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    if request.method == 'POST':
        user = get_object_or_404(User, pk=request.user.id)
        subscription = get_list_or_404(Subscription, user=user, status="ACTIVE")[0]
        new_status = subscription.cancel(request.data.get("reason"))
        return Response(new_status)
