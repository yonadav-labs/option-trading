from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField


class User(AbstractUser):
    okta_id = models.CharField(max_length=200, null=True, blank=True)
    is_subscriber = models.BooleanField(default=False)
    watchlist = ArrayField(models.CharField(max_length=10), size=200, default=list, blank=True)

    class Meta:
        app_label = 'tiger'
