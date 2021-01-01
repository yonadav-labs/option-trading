from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Ticker, ExternalRequestCache, Subscription, StockSnapshot, OptionContractSnapshot, Leg, Trade

DEFAULT_FIELDS = ['created_time', 'last_updated_time']


class TickerAdmin(admin.ModelAdmin):
    list_display = ['id', 'symbol', 'full_name', 'status', ] + DEFAULT_FIELDS
    list_filter = ['status']
    search_fields = ['id', 'symbol', 'full_name']


class ExternalRequestCacheAdmin(admin.ModelAdmin):
    list_display = ['id', 'request_url', 'short_response_blob', ] + DEFAULT_FIELDS
    search_fields = ['id', 'request_url', ]


class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'paypal_subscription_id', 'status', 'last_checked',
                    'cancellation_reason'] + DEFAULT_FIELDS
    list_filter = ['status']
    search_fields = ['user__id', 'user__email', 'paypal_subscription_id', ]


class StockSnapshotAdmin(admin.ModelAdmin):
    list_display = ['id', 'ticker', 'external_cache', ] + DEFAULT_FIELDS
    search_fields = ['id', 'ticker__symbol']


class OptionContractSnapshotAdmin(admin.ModelAdmin):
    list_display = ['id', 'ticker', 'is_call', 'strike', 'expiration_timestamp', 'external_cache', ] + DEFAULT_FIELDS
    list_filter = ['is_call']
    search_fields = ['id', 'ticker__symbol']


class LegAdmin(admin.ModelAdmin):
    list_display = ['id', 'is_long', 'units', 'cash', 'stock', 'contract', ] + DEFAULT_FIELDS
    list_filter = ['is_long']
    search_fields = ['id']


class TradeAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'stock', 'creator', 'is_public', ] + DEFAULT_FIELDS
    list_filter = ['type', 'is_public']
    search_fields = ['id', 'type', 'creator__id', 'is_public']


admin.site.register(User, UserAdmin)
admin.site.register(Ticker, TickerAdmin)
admin.site.register(ExternalRequestCache, ExternalRequestCacheAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
admin.site.register(StockSnapshot, StockSnapshotAdmin)
admin.site.register(OptionContractSnapshot, OptionContractSnapshotAdmin)
admin.site.register(Leg, LegAdmin)
admin.site.register(Trade, TradeAdmin)
