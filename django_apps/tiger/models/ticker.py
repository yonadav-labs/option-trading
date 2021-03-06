import json

from django.conf import settings
from django.db import models
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

    def get_call_puts(self, expiration_timestamp):
        response, external_cache_id = self.get_request_cache(settings.USE_YAHOO, expiration_timestamp)
        return get_call_puts(self, response, settings.USE_YAHOO, expiration_timestamp, external_cache_id)


class ExpirationDate(BaseModel):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE, related_name="expiration_dates")
    date = models.DateField()

    class Meta:
        ordering = ('date',)


class TickerStats(BaseModel):
    ticker = models.OneToOneField(Ticker, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=250)
    dividend_payment_amount = models.FloatField(blank=True, null=True)
    market_cap = models.FloatField(blank=True, null=True)
    week52_high = models.FloatField(blank=True, null=True)
    week52_low = models.FloatField(blank=True, null=True)
    week52_high_split_adjust_only = models.FloatField(blank=True, null=True)
    week52_low_split_adjust_only = models.FloatField(blank=True, null=True)
    shares_outstanding = models.FloatField(blank=True, null=True)
    day200_moving_avg = models.FloatField(blank=True, null=True)
    day50_moving_avg = models.FloatField(blank=True, null=True)
    ttm_eps = models.FloatField(blank=True, null=True)
    ttm_dividend_rate = models.FloatField(blank=True, null=True)
    dividend_yield = models.FloatField(blank=True, null=True)
    next_dividend_date = models.DateField(blank=True, null=True)
    ex_dividend_date = models.DateField(blank=True, null=True)
    next_earnings_date = models.DateField(blank=True, null=True)
    split_declaration_date = models.DateField(blank=True, null=True)
    split_ex_date = models.DateField(blank=True, null=True)
    pe_ratio = models.FloatField(blank=True, null=True)
    beta = models.FloatField(blank=True, null=True)
    price_target_average = models.FloatField(blank=True, null=True)
    price_target_high = models.FloatField(blank=True, null=True)
    price_target_low = models.FloatField(blank=True, null=True)
    number_of_analysts = models.FloatField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Ticker stats'
