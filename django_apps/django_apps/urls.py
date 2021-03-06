from django.contrib import admin
from django.urls import include, path

admin.site.site_title = admin.site.site_header = "Tigerstane Administration"

urlpatterns = [
    path('', include('tiger.urls')),
    path('api/mshwjdbhtlktfpan/', admin.site.urls),
    path('api/referrals/', include('pinax.referrals.urls', namespace='pinax_referrals')),
]
