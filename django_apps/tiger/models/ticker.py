import json
import time
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone
from tiger.blob_reader import get_call_puts_td, get_call_puts_intrinio
from tiger.fetcher import get_td_option_url, get_iex_quote_url, get_intrinio_option_url
from tiger.utils import timestamp_to_datetime_with_default_tz

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

    def get_request_cache(self, url):
        request_cache = ExternalRequestCache.objects.get_or_fetch_external_api(url)
        return json.loads(request_cache.response_blob), request_cache.id

    def get_quote(self):
        url = get_iex_quote_url(self.symbol.upper())
        response, external_cache_id = self.get_request_cache(url)
        return response, external_cache_id

    def get_last_price(self):
        response, external_cache_id = self.get_quote()
        return response.get('latestPrice'), external_cache_id

    def get_expiration_timestamps(self):
        dates = self.expiration_dates.filter(date__gte=timezone.now())
        timestamps = [int(time.mktime(date.date.timetuple()) * 1000) for date in dates]
        # take care of delta (16 hrs)
        timestamps = [timestamp + 57600000 for timestamp in timestamps]
        return timestamps

    def get_call_puts(self, expiration_timestamp):
        if settings.USE_INTRINIO:
            expiration_timestamp /= 1000
            exp_date_str = timestamp_to_datetime_with_default_tz(expiration_timestamp).strftime('%Y-%m-%d')
            url = get_intrinio_option_url(self.symbol.upper(), exp_date_str)
            intrinio_option_response, external_cache_id = self.get_request_cache(url)
            return get_call_puts_intrinio(self, intrinio_option_response, external_cache_id)
        else:
            url = get_td_option_url(self.symbol.upper())
            td_option_response, external_cache_id = self.get_request_cache(url)
            return get_call_puts_td(self, td_option_response, expiration_timestamp, external_cache_id)

    def get_latest_stats(self):
        return self.stats.order_by('-created_time').first()

    def need_refresh_stats(self):
        if self.status == 'disabled':
            return False
        return not self.stats.filter(created_time__gte=timezone.now() + timedelta(hours=-12)).exists()

    def need_refresh_expiration_dates(self):
        return not self.expiration_dates.filter(last_updated_time__gte=timezone.now() + timedelta(hours=-12)) \
            .exists()


class ExpirationDate(BaseModel):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE, related_name='expiration_dates')
    date = models.DateField()

    class Meta:
        ordering = ('date',)


class TickerStats(BaseModel):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE, related_name='stats')
    data_time = models.DateTimeField(blank=True, null=True)
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
    historical_volatility = models.FloatField(blank=True, null=True)
    price_open = models.FloatField(blank=True, null=True)
    price_high = models.FloatField(blank=True, null=True)
    price_low = models.FloatField(blank=True, null=True)
    price_close = models.FloatField(blank=True, null=True)
    daily_volume = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Ticker stats'

    def __str__(self):
        return '({}) {}'.format(self.id, self.ticker.symbol)
