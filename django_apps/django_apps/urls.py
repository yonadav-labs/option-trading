from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('', include('tiger.urls')),
    path('api/admin/', admin.site.urls),
]
