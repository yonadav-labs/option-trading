from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from tiger.models import User, Subscription
from tiger.views.decorators import tracking_api


@tracking_api()
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    if request.method == 'POST':
        subscription_id = request.data.get("subscriptionID")

        if not subscription_id:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        subscription, created = request.user.subscriptions.update_or_create(
            paypal_subscription_id=subscription_id
        )
        r = subscription.fetch_and_save_latest_status()

        return Response(r)


@tracking_api()
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    if request.method == 'POST':
        subscription = request.user.get_subscription()
        if not subscription:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        subscription.cancel(request.data.get('reason'))

        return Response()


@tracking_api()
@api_view(['POST'])
def hook_create_subscription(request):
    if request.method == 'POST':
        try:
            subscription_id = request.data['resource']['id']
            plan_id = request.data['resource']['plan_id']
            username = request.data['resource']['subscriber']['name']['surname']

            user = User.objects.get(username=username)
            user.subscriptions.update_or_create(
                paypal_subscription_id=subscription_id,
                defaults={'paypal_plan_id': plan_id}
            )

            return Response()
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@tracking_api()
@api_view(['POST'])
def hook_activate_subscription(request):
    if request.method == 'POST':
        try:
            subscription_id = request.data['resource']['id']
            subscription = Subscription.objects.get(paypal_subscription_id=subscription_id)
            prev_subscription = subscription.user.get_subscription()
            subscription.status = 'ACTIVE'
            subscription.save()

            if prev_subscription and prev_subscription.paypal_subscription_id != subscription_id:
                reason = f'Modify plan to {subscription.paypal_subscription_id}'
                prev_subscription.cancel(reason)

            return Response()
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@tracking_api()
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
