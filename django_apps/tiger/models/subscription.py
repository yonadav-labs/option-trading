from .base import BaseModel
from django.db import models
from .user import User
import requests
from django.conf import settings
from tiger.utils import get_now
from datetime import timedelta
import base64

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
            # TODO need to base64 encode PAYPAL_CLIENT_ID:PAYPAL_SECRET for authorization
            headers = {
                "Content-Type": "application/json",
                "Authorization": "Basic QVlCTUUzbm5IUVRyaFM4dGVSZTBlenhkSHZlMDU3SVZZZjdCX01rcndwN1JGVEotdHhoZUJDcVF2cVdaWmtpZXZJWXZQQTl1eUZ6bW1mZmw6RUJqUXU0YnJDSHlQanNoaVZGaHY3RnFtTjVxcGpSMWZlUGM5WUhzSk5MTnVrMHNzbGJrZ1dDT2tCckxRV0F4TFVMUEpSbDQwTmxUVFY3bWs="
            }
            response = requests.get(f'https://api-m.sandbox.paypal.com/v1/billing/subscriptions/{self.paypal_subscription_id}', headers=headers)
            if response.status_code == 200:
                self.status = response.json().get("status")
                self.last_checked = get_now()
                self.save()
            return response.status_code
        return 200

    def cancel(self):
        # make api call to cancel subscription
        return True