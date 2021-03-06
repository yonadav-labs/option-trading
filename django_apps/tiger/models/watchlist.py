from django.db import models

from .base import BaseModel
from .ticker import Ticker
from .user import User


class Watchlist(BaseModel):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlists')

    class Meta:
        unique_together = ('name', 'user')

    def __str__(self):
        return f'{str(self.user)} - {self.name}'


class WatchlistItem(BaseModel):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE)
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, related_name='watchlist_items')
