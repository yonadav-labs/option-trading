import json
from datetime import timedelta
from django.db import models
from django.conf import settings

from tiger.utils import get_now
from tiger.blob_reader import get_expiration_timestamps, get_call_puts, get_quote
from tiger.fetcher import fetch_external_api, get_yahoo_option_url, get_td_option_url
from .base import BaseModel


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

    def get_request_cache(self, is_yahoo, expiration_timestamp=None):
        url = get_yahoo_option_url(self.symbol.upper(), expiration_timestamp) if is_yahoo else get_td_option_url(
            self.symbol.upper())
        request_cache = ExternalRequestCache.objects.get_or_fetch_external_api(url)
        return json.loads(request_cache.response_blob)

    # TODO: change to use TD.
    def get_quote(self):
        response = self.get_request_cache(True)
        return get_quote(response, True)

    def get_expiration_timestamps(self):
        response = self.get_request_cache(settings.USE_YAHOO)
        return get_expiration_timestamps(response, settings.USE_YAHOO)

    def get_call_puts(self, use_as_premium, expiration_timestamp):
        response = self.get_request_cache(settings.USE_YAHOO, expiration_timestamp)
        return get_call_puts(response, settings.USE_YAHOO, use_as_premium, expiration_timestamp)


class ExternalRequestCacheManager(models.Manager):
    def get_or_fetch_external_api(self, request_url):
        # See if there was a request cached in the past 1 minutes.
        # TODO: make the cache time longer during market closed hours.
        # TODO: make the cache time configurable for different request pattern.
        cached_requests = self.filter(request_url=request_url).filter(
            created_time__gt=get_now() - timedelta(minutes=60 if settings.DEBUG else 1)).order_by('-created_time')

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
