from django.urls import include, path
from rest_framework.urlpatterns import format_suffix_patterns
from tiger import views

restful_urlpatterns = [
    path('api/tickers/', views.ticker_list, name='tickers'),
    path('api/tickers/<str:ticker_symbol>/', views.ticker, name='ticker'),
    path('api/tickers/<str:ticker_symbol>/calls/', views.calls, name='calls'),
    path('api/user', views.user_detail),
    path('api/tickers/<str:ticker_symbol>/sell_covered_calls/', views.sell_covered_calls, name='sell_covered_calls'),
    path('api/tickers/<str:ticker_symbol>/buy_puts/', views.buy_puts, name='buy_puts'),
    path('api/tickers/<str:ticker_symbol>/sell_cash_secured_puts/', views.sell_cash_secured_puts,
         name='sell_cash_secured_puts'),
    path('api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
restful_urlpatterns = format_suffix_patterns(restful_urlpatterns)

urlpatterns = [
                  # other urls.
              ] + restful_urlpatterns
