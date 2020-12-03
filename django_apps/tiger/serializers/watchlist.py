from tiger.models import Watchlist, WatchlistItem
from rest_framework import serializers


class WatchlistSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['name', 'user']


class WatchlistItemSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = WatchlistItem
        fields = ['ticker', 'watchlist']
