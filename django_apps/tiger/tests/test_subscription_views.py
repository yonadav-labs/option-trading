from unittest import mock

from rest_framework.test import APITestCase
from tiger.models import User

from .mocks.mock_paypal_apis import *


class SubscriptionTestCase(APITestCase):
    def setUp(self):
        self.username = 'test_user'
        self.password = 'test_pass'
        self.user = User.objects.create(username=self.username, password=self.password)

    def test_create_anonymous(self):
        response = self.client.post('/api/subscription/update', {'code': 'Foo Bar'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_create_bad_request(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/subscription/update', {'code': 'Foo Bar'}, format='json')
        self.assertEqual(response.status_code, 400)

    @mock.patch('requests.get', subscription_detail_get)
    def test_create_valid(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/subscription/update', {'subscriptionID': 'I-BW452GLLEP1G'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(self.user.get_subscription())
        self.assertEqual(response.content.decode("utf-8") , '"ACTIVE"')

    def test_cancel_anonymous(self):
        response = self.client.post('/api/subscription/cancel', {'reason': 'Test'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_cancel_bad_request(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/subscription/cancel', {'reason': 'Test'}, format='json')
        self.assertEqual(response.status_code, 400)

    @mock.patch('requests.post', subscription_cancel_post)
    def test_cancel_valid(self):
        self.client.force_authenticate(user=self.user)
        self.user.subscriptions.create(paypal_subscription_id='I-BW452GLLEP1G', status='ACTIVE')
        response = self.client.post('/api/subscription/cancel', {'reason': 'Test'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(self.user.get_subscription())

    def test_hook_create_bad_request(self):
        response = self.client.post('/api/subscription/webhook/create', {'reason': 'invalid data'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_hook_create_valid(self):
        response = self.client.post('/api/subscription/webhook/create', subscription_create_hook_data, format='json')
        self.assertEqual(response.status_code, 200)
        subscription = self.user.subscriptions.get(
            paypal_subscription_id='I-BW452GLLEP1G',
            paypal_plan_id='P-99E00230P4111090PMDCIEDY'
        )
        self.assertIsNotNone(subscription)

    def test_hook_activate_valid(self):
        self.user.subscriptions.create(paypal_subscription_id='I-BW452GLLEP1G')
        response = self.client.post('/api/subscription/webhook/activate', subscription_activate_hook_data, format='json')
        self.assertEqual(response.status_code, 200)
        subscription = self.user.get_subscription()
        self.assertEqual(subscription.status, 'ACTIVE')

    def test_hook_cancel_valid(self):
        self.user.subscriptions.create(paypal_subscription_id='I-BW452GLLEP1G', status='ACTIVE')
        response = self.client.post('/api/subscription/webhook/cancel', subscription_cancel_hook_data, format='json')
        self.assertEqual(response.status_code, 200)
        subscription = self.user.subscriptions.get(paypal_subscription_id='I-BW452GLLEP1G')
        self.assertEqual(subscription.status, 'INACTIVE')
