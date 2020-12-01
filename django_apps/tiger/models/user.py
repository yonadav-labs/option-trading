from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField


class User(AbstractUser):
    okta_id = models.CharField(max_length=200, null=True, blank=True)

    class Meta:
        app_label = 'tiger'
