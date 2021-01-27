from django.contrib import admin
from django.urls import include, path

admin.site.site_title = admin.site.site_header = "Tigerstane Administration"

urlpatterns = [
    path('', include('tiger.urls')),
    path('api/admin/', admin.site.urls),
]
