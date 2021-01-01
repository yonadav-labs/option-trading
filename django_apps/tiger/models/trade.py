import uuid
from django.db import models

from .base import BaseModel
from .cache import ExternalRequestCache
from .ticker import Ticker
from .user import User


class SecuritySnapshot(BaseModel):
    external_cache = models.ForeignKey(ExternalRequestCache, null=True, on_delete=models.SET_NULL)

    class Meta:
        abstract = True


class StockSnapshot(SecuritySnapshot):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['ticker', 'external_cache']


class OptionContractSnapshot(SecuritySnapshot):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE)
    is_call = models.BooleanField()
    strike = models.FloatField()
    expiration_timestamp = models.PositiveIntegerField()

    class Meta:
        unique_together = ['ticker', 'is_call', 'strike', 'expiration_timestamp', 'external_cache']


class Leg(BaseModel):
    is_long = models.BooleanField()
    units = models.PositiveIntegerField()
    # Only one of cash, stock, and contract should be not NULL.
    cash = models.PositiveIntegerField(null=True, blank=True)
    stock = models.ForeignKey(StockSnapshot, null=True, blank=True, on_delete=models.SET_NULL)
    contract = models.ForeignKey(OptionContractSnapshot, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        unique_together = ['is_long', 'units', 'cash', 'stock', 'contract']


class Trade(BaseModel):
    TRADE_TYPE_CHOICES = (
        ("unspecified", "Unspecified"),
        ("long_call", "Long call"),
        ("covered_call", "Covered call"),
        ("long_put", "Long put"),
        ("cash_secured_put", "Cash secured put"),
    )
    type = models.CharField(max_length=100, choices=TRADE_TYPE_CHOICES, default="unspecified")
    stock = models.ForeignKey(StockSnapshot, on_delete=models.CASCADE)  # Snapshot of underlying asset.
    legs = models.ManyToManyField(Leg)

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trades')
    is_public = models.BooleanField(default=False)  # If non-creator can view this trade.
