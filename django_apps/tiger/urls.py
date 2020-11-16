from django.urls import include, path
from rest_framework.urlpatterns import format_suffix_patterns
from tiger import views

restful_urlpatterns = [
    path('api/tickers/', views.ticker_list, name='tickers'),
    path('api/tickers/<str:ticker_symbol>/', views.ticker, name='ticker'),
    path('api/tickers/<str:ticker_symbol>/calls/', views.calls, name='calls'),
    path('api/users', views.user_list),
    path('api/users/<str:id>', views.user_detail),
    # path("api/user/<int:user_id>/", views.user, name="user"),
    path('api/tickers/<str:ticker_symbol>/sell_covered_calls/', views.sell_covered_calls, name='sell_covered_calls'),
    path('api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
restful_urlpatterns = format_suffix_patterns(restful_urlpatterns)

urlpatterns = [
                  # other urls.
              ] + restful_urlpatterns
