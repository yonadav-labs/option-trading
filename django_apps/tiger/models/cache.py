import json

from datetime import timedelta
from django.conf import settings
from django.db import models

from tiger.utils import get_now
from tiger.fetcher import fetch_external_api
from .base import BaseModel


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

    @property
    def json_response(self):
        return json.loads(self.response_blob)

    def __str__(self):
        return "({}) {}".format(self.id, self.request_url)
