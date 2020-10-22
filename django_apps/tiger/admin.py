from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Ticker


class TickerAdmin(admin.ModelAdmin):
    list_display = ['id', 'symbol', 'full_name', 'status', ]
    list_filter = ['status']
    search_fields = ['id', 'symbol', 'full_name']


admin.site.register(User, UserAdmin)
admin.site.register(Ticker, TickerAdmin)
