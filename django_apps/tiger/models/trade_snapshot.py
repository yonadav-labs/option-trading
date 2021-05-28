from django.db import models

from .base import BaseModel
from .cache import ExternalRequestCache
from .ticker import Ticker, TickerStats
from .user import User


class SecuritySnapshot(BaseModel):
    external_cache = models.ForeignKey(ExternalRequestCache, null=True, on_delete=models.SET_NULL)

    class Meta:
        abstract = True


class StockSnapshot(SecuritySnapshot):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE)
    ticker_stats = models.ForeignKey(TickerStats, on_delete=models.CASCADE, default=None, null=True, blank=True)

    def __str__(self):
        return "({}) {}".format(self.id, self.ticker.symbol)


class OptionContractSnapshot(SecuritySnapshot):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE)
    is_call = models.BooleanField()
    strike = models.FloatField()
    expiration_timestamp = models.PositiveIntegerField()

    def __str__(self):
        return "({}) {}-{}-${}-{}".format(self.id, self.ticker.symbol, 'CALL' if self.is_call else 'PUT', self.strike,
                                          self.expiration_timestamp)


class LegSnapshot(BaseModel):
    is_long = models.BooleanField()
    units = models.PositiveIntegerField()
    # Only one of cash, stock, and contract should be not NULL.
    cash_snapshot = models.BooleanField(null=True, blank=True)
    stock_snapshot = models.ForeignKey(StockSnapshot, null=True, blank=True, on_delete=models.SET_NULL)
    contract_snapshot = models.ForeignKey(OptionContractSnapshot, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"({self.id}) {'LONG' if self.is_long else 'SHORT'}-{self.cash_snapshot}{self.security_snapshot}"


class TradeSnapshot(BaseModel):
    TRADE_TYPE_CHOICES = (
        ('unspecified', 'Unspecified'),
        ('long_call', 'Long call'),
        ('covered_call', 'Covered call'),
        ('long_put', 'Long put'),
        ('cash_secured_put', 'Cash secured put'),
        ('bull_call_spread', 'Bull call spread'),
        ('bear_call_spread', 'Bear call spread'),
        ('bear_put_spread', 'Bear put spread'),
        ('bull_put_spread', 'Bull put spread'),
        ('long_straddle', 'Long Straddle'),
        ('short_strangle', 'Short Strangle'),
        ('iron_butterfly', 'Iron Butterfly'),
        ('iron_condor', 'Iron Condor'),
        ('long_strangle', 'Long Strangle'),
    )
    type = models.CharField(max_length=100, choices=TRADE_TYPE_CHOICES, default="unspecified")
    # Snapshot of underlying asset.
    stock_snapshot = models.ForeignKey(StockSnapshot, on_delete=models.CASCADE)
    leg_snapshots = models.ManyToManyField(LegSnapshot)

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trades', null=True, blank=True)
    # If non-creator can view this trade.
    is_public = models.BooleanField(default=False)

    # Market assumptions.
    target_price_lower = models.FloatField(null=True, blank=True)
    target_price_upper = models.FloatField(null=True, blank=True)

    PREMIUM_TYPE_CHOICES = (
        ('mid', 'Mid/mark'),  # Use mid/mark price.
        ('market', 'Market order'),  # Use bid for sell, use ask for buy.
    )
    premium_type = models.CharField(max_length=20, choices=PREMIUM_TYPE_CHOICES, default='mid')
