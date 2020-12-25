from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Ticker, ExternalRequestCache, Subscription

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


admin.site.register(User, UserAdmin)
admin.site.register(Ticker, TickerAdmin)
admin.site.register(ExternalRequestCache, ExternalRequestCacheAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
