from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_subscription(request):
    if request.method == 'POST':
        subscription_id = request.data.get("subscriptionID")
        if not subscription_id:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        subscription, created = request.user.subscriptions.update_or_create(
            paypal_subscription_id=subscription_id)
        r = subscription.get_status()

        return Response(r)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    if request.method == 'POST':
        subscription = request.user.get_subscription()
        if not subscription:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        new_status = subscription.cancel(request.data.get("reason"))

        return Response(new_status)
