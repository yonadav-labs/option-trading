from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    User, Ticker, ExternalRequestCache, Subscription, StockSnapshot,
    OptionContractSnapshot, LegSnapshot, TradeSnapshot, Watchlist,
    WatchlistItem, TickerStats, ExpirationDate, MarketDate
)

DEFAULT_FIELDS = ['created_time', 'last_updated_time']


class ExpirationDateAdmin(admin.TabularInline):
    model = ExpirationDate


class TickerAdmin(admin.ModelAdmin):
    list_display = ['symbol', 'full_name', 'status', ] + DEFAULT_FIELDS
    list_filter = ['status']
    search_fields = ['symbol', 'full_name']
    inlines = [ExpirationDateAdmin]


class ExternalRequestCacheAdmin(admin.ModelAdmin):
    list_display = ['id', 'request_url', 'short_response_blob', ] + DEFAULT_FIELDS
    search_fields = ['id', 'request_url', ]


class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'paypal_subscription_id', 'paypal_plan_id', 'status'] + DEFAULT_FIELDS
    list_filter = ['status', 'user']
    search_fields = ['user__id', 'user__email', 'paypal_subscription_id', ]


class StockSnapshotAdmin(admin.ModelAdmin):
    list_display = ['id', 'ticker', 'external_cache', ] + DEFAULT_FIELDS
    search_fields = ['id', 'ticker__symbol']


class OptionContractSnapshotAdmin(admin.ModelAdmin):
    list_display = ['id', 'ticker', 'is_call', 'strike', 'expiration_timestamp', 'external_cache', ] + DEFAULT_FIELDS
    list_filter = ['is_call']
    search_fields = ['id', 'ticker__symbol']


class LegSnapshotAdmin(admin.ModelAdmin):
    list_display = ['id', 'is_long', 'units', 'cash_snapshot', 'stock_snapshot', 'contract_snapshot', ] + DEFAULT_FIELDS
    list_filter = ['is_long']
    search_fields = ['id']


class TradeSnapshotAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'stock_snapshot', 'creator', 'is_public', 'target_price_lower',
                    'target_price_upper', 'premium_type'] + DEFAULT_FIELDS
    list_filter = ['type', 'is_public']
    search_fields = ['id', 'type', 'creator__id', 'is_public']


class WatchlistAdmin(admin.ModelAdmin):
    list_display = ['name', 'user'] + DEFAULT_FIELDS
    list_filter = ['name', 'user']


class WatchlistItemAdmin(admin.ModelAdmin):
    list_display = ['ticker', 'watchlist'] + DEFAULT_FIELDS
    list_filter = ['watchlist']
    ordering = ['-last_updated_time']


class TickerStatsAdmin(admin.ModelAdmin):
    list_display = ['ticker', 'company_name', 'dividend_payment_amount', 'split_declaration_date',
                    'split_ex_date', 'market_cap'] + DEFAULT_FIELDS
    search_fields = ['ticker__symbol', 'company_name']


class MarketDateAdmin(admin.ModelAdmin):
    list_display = ['date', 'type']
    list_filter = ['type']
    ordering = ['date']


admin.site.register(User, UserAdmin)
admin.site.register(Ticker, TickerAdmin)
admin.site.register(ExternalRequestCache, ExternalRequestCacheAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
admin.site.register(StockSnapshot, StockSnapshotAdmin)
admin.site.register(OptionContractSnapshot, OptionContractSnapshotAdmin)
admin.site.register(LegSnapshot, LegSnapshotAdmin)
admin.site.register(TradeSnapshot, TradeSnapshotAdmin)
admin.site.register(Watchlist, WatchlistAdmin)
admin.site.register(WatchlistItem, WatchlistItemAdmin)
admin.site.register(TickerStats, TickerStatsAdmin)
admin.site.register(MarketDate, MarketDateAdmin)
