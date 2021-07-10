import multiprocessing as mp
from functools import partial

from django import db
from django.core.management.base import BaseCommand
from tiger.management.commands.iexcloud_fetch_ticker_info import fetch_ohlc_prices
from tiger.models import TickerStats
from tiger.utils import is_market_open


def backfill_existing_ticker_stats(ticker_stats_id):
    ticker_stats = TickerStats.objects.get(id=ticker_stats_id)
    # If the market is closed, skip.
    if not is_market_open(ticker_stats.data_time.date()):
        print('Market is closed, skip.', ticker_stats.data_time.date())
        return

    fetch_ohlc_prices(ticker_stats)
    ticker_stats.save()


class Command(BaseCommand):
    help = 'Backfill historical OHLC data from IEX Cloud for all existing ticker stats.'

    def handle(self, *args, **options):
        # Get all existing ticker stats from db
        unfinished_count = TickerStats.objects.filter(price_open__isnull=True) \
            .filter(ticker__status='unspecified') \
            .exclude(data_time__week_day__in=[1, 7]).count()
        print('Unfinished stats count:', unfinished_count)

        ticker_stats_ids = list(TickerStats.objects.filter(price_open__isnull=True)
                                .filter(ticker__status='unspecified')
                                .exclude(data_time__week_day__in=[1, 7])  # exclude weekends.
                                .order_by('id').values_list('id', flat=True))[:50000]

        # Parallelization and mapping
        pool_size = min(mp.cpu_count() * 2, 16)
        print('pool_size:', pool_size)
        db.connections.close_all()

        with mp.Pool(pool_size, maxtasksperchild=2) as pool:
            pool.map(partial(backfill_existing_ticker_stats), ticker_stats_ids)
