from .base import BaseModel
from django.db import models
from .user import User
import requests
from django.conf import settings
from tiger.utils import get_now
from datetime import timedelta
import base64
import os

class Subscription(BaseModel):
    paypal_subscription_id = models.CharField(max_length=200, unique=True)
    # plan id? plan model?
    status = models.CharField("Subscription status", max_length=200, default="")
    last_checked = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')

    def get_status(self):
        # if an hour has passed since last check call paypal to update status
        if ((get_now() - self.last_checked).total_seconds() / 3600 > 1) or self.status == "":
            # call paypal api get subscription status
            encoded = base64.b64encode(bytes(f"{os.environ['PAYPAL_CLIENT_ID']}:{os.environ['PAYPAL_SECRET']}", "UTF-8"))
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Basic asdf"
            }
            try:
                response = requests.get(f"https://api-m.sandbox.paypal.com/v1/billing/subscriptions/{self.paypal_subscription_id}", headers=headers)
                response.raise_for_status()
                if response.status_code == 200:
                    self.status = response.json().get("status")
                    self.last_checked = get_now()
                    self.save()
            except requests.exceptions.RequestException as e:
                raise e
        return self.status

    def cancel(self):
        # make api call to cancel subscription
        encoded = base64.b64encode(bytes(f"{os.environ['PAYPAL_CLIENT_ID']}:{os.environ['PAYPAL_SECRET']}", "UTF-8"))
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {encoded.decode('ascii')}"
        }
        try:
            response = requests.get(f"https://api-m.sandbox.paypal.com/v1/billing/subscriptions/{self.paypal_subscription_id}/cancel", headers=headers)
            response.raise_for_status()
            if response.status_code == 204:
                self.status = "INACTIVE"
                self.last_checked = get_now()
                self.save()
        except requests.exceptions.RequestException as e:
            raise e
        return self.status