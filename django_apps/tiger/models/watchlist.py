from .base import BaseModel
from django.db import models
from .user import User
from .ticker import Ticker

class Watchlist(BaseModel):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlists')

class WatchlistItem(BaseModel):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE)
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, related_name='watchlist_items')