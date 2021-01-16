from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    okta_id = models.CharField(max_length=200, null=True, blank=True)

    class Meta:
        app_label = 'tiger'
