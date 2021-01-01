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

    def __str__(self):
        return "({}) {}-{}".format(self.id, self.ticker.symbol, self.external_cache.id)


class OptionContractSnapshot(SecuritySnapshot):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE)
    is_call = models.BooleanField()
    strike = models.FloatField()
    expiration_timestamp = models.PositiveIntegerField()
    premium = models.FloatField(null=True, blank=True)

    def __str__(self):
        return "({}) {}-{}-${}-{}".format(self.id, self.ticker.symbol, 'CALL' if self.is_call else 'PUT', self.strike,
                                          self.expiration_timestamp)


class LegSnapshot(BaseModel):
    is_long = models.BooleanField()
    units = models.PositiveIntegerField()
    # Only one of cash, stock, and contract should be not NULL.
    cash_snapshot = models.PositiveIntegerField(null=True, blank=True)
    stock_snapshot = models.ForeignKey(StockSnapshot, null=True, blank=True, on_delete=models.SET_NULL)
    contract_snapshot = models.ForeignKey(OptionContractSnapshot, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return "({}) {}-{}{}{}".format(self.id, 'LONG' if self.is_long else 'SHORT', self.cash_snapshot,
                                       self.stock_snapshot, self.contract_snapshot)


class TradeSnapshot(BaseModel):
    TRADE_TYPE_CHOICES = (
        ("unspecified", "Unspecified"),
        ("long_call", "Long call"),
        ("covered_call", "Covered call"),
        ("long_put", "Long put"),
        ("cash_secured_put", "Cash secured put"),
    )
    type = models.CharField(max_length=100, choices=TRADE_TYPE_CHOICES, default="unspecified")
    stock_snapshot = models.ForeignKey(StockSnapshot, on_delete=models.CASCADE)  # Snapshot of underlying asset.
    leg_snapshots = models.ManyToManyField(LegSnapshot)

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trades')
    is_public = models.BooleanField(default=False)  # If non-creator can view this trade.
