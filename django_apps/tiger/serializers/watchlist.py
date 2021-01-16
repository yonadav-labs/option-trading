from rest_framework import serializers
from tiger.models import Watchlist, WatchlistItem


class WatchlistSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['name', 'user']


class WatchlistItemSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = WatchlistItem
        fields = ['ticker', 'watchlist']
