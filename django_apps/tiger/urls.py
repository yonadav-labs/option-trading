from django.urls import include, path
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework import routers

from tiger import views

router = routers.SimpleRouter()
router.register(r'tickers', views.TickerViewSet, basename='tickers')
router.register(r'reports', views.BlogViewSet, basename='blogs')
router.register(r'brokers', views.BrokerViewSet, basename='brokers')
router.register(r'users', views.UserViewSet, basename='users')

restful_urlpatterns = [
    path('api/', include(router.urls)),
    path('api/tickers/<str:ticker_symbol>/contracts/', views.contracts, name='contracts'),
    path('api/tickers/<str:ticker_symbol>/trades/', views.get_top_trades, name='get_top_trades'),
    path('api/trade_snapshots/<int:pk>/', views.trade_snapshot_detail, name='trade_snapshot_detail'),
    path('api/trade_snapshots', views.trade_snapshots, name='trade_snapshots'),
    path('api/trade_snapshots_history', views.trade_snapshots_history, name='trade_snapshots_history'),
    path('api/trade_snapshots_on_the_fly', views.trade_snapshots_on_the_fly, name='trade_snapshots_on_the_fly'),
    path('api/subscription/update', views.create_subscription),
    path('api/subscription/cancel', views.cancel_subscription),
    path('api/subscription/webhook/create', views.hook_create_subscription),
    path('api/subscription/webhook/activate', views.hook_activate_subscription),
    path('api/subscription/webhook/cancel', views.hook_cancel_subscription),
    path('api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
restful_urlpatterns = format_suffix_patterns(restful_urlpatterns)

urlpatterns = [
    # other urls.
] + restful_urlpatterns
