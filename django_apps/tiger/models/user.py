from datetime import datetime

from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    okta_id = models.CharField(max_length=200, null=True, blank=True)

    class Meta:
        app_label = 'tiger'

    def __str__(self):
        return self.email

    def get_subscription(self):
        # return the active subscription for the user if exists
        subscription = self.subscriptions.filter(status='ACTIVE').first()

        return subscription

    def add_ticker_to_watchlist(self, name, ticker):
        watchlist, _ = self.watchlists.get_or_create(name=name)
        item, created = watchlist.watchlist_items.get_or_create(ticker=ticker)

        if not created:  # modify last_updated_time
            item.last_updated_time = datetime.now()
            item.save()
