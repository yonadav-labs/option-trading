import base64
import json
import requests

from datetime import timedelta
from django.conf import settings
from django.db import models

from .base import BaseModel
from .user import User
from tiger.utils import get_now


class Subscription(BaseModel):
    STATUS_CHOICES = (
        ('', 'Unknown'),
        ('INACTIVE', 'Inactive'),
        ('ACTIVE', 'Active'),
    )

    paypal_subscription_id = models.CharField(max_length=200, unique=True)
    # plan id? plan model?
    status = models.CharField("Subscription status", max_length=200, default='', choices=STATUS_CHOICES)
    last_checked = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    cancellation_reason = models.TextField(null=True, blank=True)

    def get_paypal_headers(self):
        encoded = base64.b64encode(
            bytes(f'{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_SECRET}', 'UTF-8'))
        return {
            "Content-Type": "application/json",
            "Authorization": f"Basic {encoded.decode('ascii')}"
        }

    def get_status(self):
        # if an hour has passed since last check call paypal to update status
        if ((get_now() - self.last_checked).total_seconds() / 3600 > 1) or self.status == '':
            # call paypal api get subscription status
            try:
                response = requests.get(
                    f'{settings.PAYPAL_ENDPOINT}/v1/billing/subscriptions/{self.paypal_subscription_id}',
                    headers=self.get_paypal_headers())
                response.raise_for_status()
                if response.status_code == 200:
                    self.status = response.json().get("status")
                    self.last_checked = get_now()
                    self.save()
            except requests.exceptions.RequestException as e:
                raise e
        return self.status

    def cancel(self, reason):
        # make api call to cancel subscription
        data = {"reason": reason}
        try:
            response = requests.post(
                f'{settings.PAYPAL_ENDPOINT}/v1/billing/subscriptions/{self.paypal_subscription_id}/cancel',
                data=json.dumps(data), headers=self.get_paypal_headers())
            response.raise_for_status()
            if response.status_code == 204:
                self.status = 'INACTIVE'
                self.last_checked = get_now()
                self.cancellation_reason = reason
                self.save()
        except requests.exceptions.RequestException as e:
            raise e
        return self.status
