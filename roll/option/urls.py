from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('best_call/<str:ticker_symbol>/', views.best_call, name='best_call'),
]