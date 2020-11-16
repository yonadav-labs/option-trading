import json
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField

from tiger.utils import get_now
from tiger.yahoo import fetch_external_api, get_yahoo_option_url, get_expiration_timestamps, get_option_contracts, \
    get_quote


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

    def get_expiration_timestamps(self):
        request_cache = ExternalRequestCache.objects.get_or_fetch_external_api(
            get_yahoo_option_url(self.symbol.upper()))
        if request_cache is None:
            return None
        response = json.loads(request_cache.response_blob)
        return get_expiration_timestamps(response)

    def get_option_contracts(self, expiration_timestamp):
        request_cache = ExternalRequestCache.objects.get_or_fetch_external_api(
            get_yahoo_option_url(self.symbol.upper(), expiration_timestamp))
        if request_cache is None:
            return None
        response = json.loads(request_cache.response_blob)
        return get_option_contracts(response)

    def get_quote(self):
        request_cache = ExternalRequestCache.objects.get_or_fetch_external_api(
            get_yahoo_option_url(self.symbol.upper()))
        if request_cache is None:
            return None
        response = json.loads(request_cache.response_blob)
        return get_quote(response)


class ExternalRequestCacheManager(models.Manager):
    def get_or_fetch_external_api(self, request_url):
        # See if there was a request cached in the past 15 minutes.
        cached_requests = self.filter(request_url=request_url).filter(
            created_time__gt=get_now() - timedelta(minutes=15)).order_by('-created_time')

        if cached_requests:
            return cached_requests[0]

        response_str = fetch_external_api(request_url)
        if response_str is None:
            return None
        new_cached_request = ExternalRequestCache(request_url=request_url,
                                                  response_blob=response_str.decode("utf-8"))
        new_cached_request.save()
        return new_cached_request


class ExternalRequestCache(BaseModel):
    request_url = models.URLField(db_index=True)
    response_blob = models.TextField(default='', blank=True)
    objects = ExternalRequestCacheManager()

    @property
    def short_response_blob(self):
        return self.response_blob[:100]


class User(AbstractUser):
    okta_id = models.CharField(max_length=200, null=True, blank=True)
    is_subscriber = models.BooleanField(default=False)
    watchlist = ArrayField(models.CharField(max_length=10), size=200, default=list)

    class Meta:
        app_label = 'tiger'
