from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from tiger.models import User, Subscription


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    if request.method == 'POST':
        subscription = request.user.get_subscription()
        if not subscription:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        new_status = subscription.cancel(request.data.get('reason'))

        return Response(new_status)


@api_view(['POST'])
def hook_create_subscription(request):
    if request.method == 'POST':
        try:
            subscription_id = request.data['resource']['id']
            username = request.data['resource']['subscriber']['name']['surname']

            user = User.objects.get(username=username)
            user.subscriptions.create(paypal_subscription_id=subscription_id)

            return Response()
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def hook_activate_subscription(request):
    if request.method == 'POST':
        try:
            subscription_id = request.data['resource']['id']
            subscription = Subscription.objects.get(paypal_subscription_id=subscription_id)
            subscription.status = 'ACTIVE'
            subscription.save()

            return Response()
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def hook_cancel_subscription(request):
    if request.method == 'POST':
        try:
            subscription_id = request.data['resource']['id']
            subscription = Subscription.objects.get(paypal_subscription_id=subscription_id)
            subscription.status = 'INACTIVE'
            subscription.save()

            return Response()
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
