from django.urls import include, path
from rest_framework.urlpatterns import format_suffix_patterns
from tiger import views

restful_urlpatterns = [
    path('api/tickers/', views.ticker_list, name='tickers'),
    path('api/tickers/<str:ticker_symbol>/', views.ticker, name='ticker'),
    path('api/user', views.user_detail),
    path('api/tickers/<str:ticker_symbol>/contracts/', views.contracts, name='contracts'),
    path('api/tickers/<str:ticker_symbol>/trades/', views.get_best_trades, name='get_best_trades'),
    path('api/trade_snapshot/<int:pk>/', views.trade_snapshot_detail, name='trade_snapshot_detail'),
    path('api/subscription/update', views.update_subscription),
    path('api/subscription/cancel', views.cancel_subscription),
    path('api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
restful_urlpatterns = format_suffix_patterns(restful_urlpatterns)

urlpatterns = [
                  # other urls.
              ] + restful_urlpatterns
