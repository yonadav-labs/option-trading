from unittest import mock
from rest_framework.test import APITestCase, force_authenticate

from tiger.models import User
from .mocks.mock_paypal_apis import (
	subscription_detail_get,
	subscription_cancel_post
)


class SubscriptionTestCase(APITestCase):
    def setUp(self):
        self.username = 'test_user'
        self.password = 'test_pass'
        self.user = User.objects.create(username=self.username, password=self.password)

    def test_update_anonymous(self):
        response = self.client.post('/api/subscription/update', {'code': 'Foo Bar'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_update_bad_request(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/subscription/update', {'code': 'Foo Bar'}, format='json')
        self.assertEqual(response.status_code, 400)

    @mock.patch('requests.get', subscription_detail_get)
    def test_update_valid(self):
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
        self.assertEqual(response.content.decode("utf-8") , '"INACTIVE"')
