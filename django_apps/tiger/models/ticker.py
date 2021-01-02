import json
from django.db import models
from django.conf import settings

from tiger.blob_reader import get_expiration_timestamps, get_call_puts, get_quote
from tiger.fetcher import get_yahoo_option_url, get_td_option_url
from .base import BaseModel
from .cache import ExternalRequestCache


class Ticker(BaseModel):
    symbol = models.CharField(max_length=20, null=True, blank=True)
    full_name = models.CharField(max_length=200, null=False, blank=True)
    STATUS_CHOICES = (
        ("unspecified", "Unspecified"),
        ("disabled", "Disabled"),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="unspecified")

    def __str__(self):
        return '{} - {} - {}'.format(self.symbol, self.full_name, self.status)

    def get_request_cache(self, is_yahoo, expiration_timestamp=None):
        url = get_yahoo_option_url(self.symbol.upper(), expiration_timestamp) if is_yahoo else get_td_option_url(
            self.symbol.upper())
        request_cache = ExternalRequestCache.objects.get_or_fetch_external_api(url)
        return json.loads(request_cache.response_blob), request_cache.id

    # TODO: change to use TD.
    def get_quote(self):
        response, external_cache_id = self.get_request_cache(True)
        return get_quote(response, True), external_cache_id

    def get_expiration_timestamps(self):
        response, _ = self.get_request_cache(settings.USE_YAHOO)
        return get_expiration_timestamps(response, settings.USE_YAHOO)

    def get_call_puts(self, use_as_premium, expiration_timestamp):
        response, external_cache_id = self.get_request_cache(settings.USE_YAHOO, expiration_timestamp)
        return get_call_puts(response, settings.USE_YAHOO, use_as_premium, expiration_timestamp, external_cache_id)
