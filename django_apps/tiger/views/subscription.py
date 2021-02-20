from django.db import transaction
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

        subscription.cancel(request.data.get('reason'))

        return Response()


@api_view(['POST'])
def hook_create_subscription(request):
    if request.method == 'POST':
        try:
            subscription_id = request.data['resource']['id']
            plan_id = request.data['resource']['plan_id']
            username = request.data['resource']['subscriber']['name']['surname']

            user = User.objects.get(username=username)
            user.subscriptions.create(
                paypal_subscription_id=subscription_id,
                paypal_plan_id=plan_id
            )

            return Response()
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def hook_activate_subscription(request):
    if request.method == 'POST':
        try:
            subscription_id = request.data['resource']['id']
            subscription = Subscription.objects.get(paypal_subscription_id=subscription_id)
            prev_subscription = subscription.user.get_subscription()
            subscription.status = 'ACTIVE'
            subscription.save()

            if prev_subscription:
                reason = f'Modify plan to {subscription.paypal_subscription_id}'
                prev_subscription.cancel(reason)

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
