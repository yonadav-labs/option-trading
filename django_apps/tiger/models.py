from django.db import models
from django.contrib.auth.models import AbstractUser


class BaseModel(models.Model):
    created_time = models.DateTimeField(auto_now_add=True)
    last_updated_time = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True  # specify this model as an Abstract Model
        app_label = 'tiger'


class Ticker(BaseModel):
    symbol = models.CharField(max_length=20, null=True, blank=True)
    full_name = models.CharField(max_length=200, null=False, blank=True)
    STATUS_CHOICES = (
        ("unspecified", "Unspecified"),
        ("disabled", "Disabled"),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="unspecified")

    def __str__(self):
        return str(self.symbol)


class ExternalRequestCache(BaseModel):
    request_url = models.URLField(db_index=True)
    response_blob = models.TextField(default='', blank=True)

    @property
    def short_response_blob(self):
        return self.response_blob[:100]


class User(AbstractUser):
    class Meta:
        app_label = 'tiger'
