from django.urls import include, path
from rest_framework.urlpatterns import format_suffix_patterns
from tiger import views

restful_urlpatterns = [
    path('api/tickers/', views.ticker_list, name='tickers'),
    path('api/tickers/<str:ticker_symbol>/', views.ticker, name='ticker'),
    path('api/tickers/<str:ticker_symbol>/calls/', views.calls, name='calls'),
    path('api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
restful_urlpatterns = format_suffix_patterns(restful_urlpatterns)

urlpatterns = [
                  path('about', views.about, name='about'),
                  path('', views.index, name='index'),
                  path('best_call/<str:ticker_symbol>/', views.best_call, name='best_call'),
              ] + restful_urlpatterns
