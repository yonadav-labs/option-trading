import datetime

import requests

from django.conf import settings
from django.core.management.base import BaseCommand

from tiger.models import Ticker, TickerStats


class Command(BaseCommand):
    help = 'Fetch data from IEX Cloud'

    def handle(self, *args, **options):
        url = settings.IEXCLOUD_BASE_URL + '/ref-data/symbols'
        params = { 'token': settings.IEXCLOUD_TOKEN }
        symbols_resp = requests.get(url, params=params)
        symbols_resp.raise_for_status()
        ixe_ticker_responses = symbols_resp.json()

        for ixe_ticker_response in ixe_ticker_responses:
            if ixe_ticker_response['region'] != 'US' or ixe_ticker_response['exchange'] not in ['NYS', 'USAMEX', 'NAS', 'USPAC'] or ixe_ticker_response['type'] not in ['ad', 're', 'cs', 'et']:
                continue

            defaults = {
                "full_name": ixe_ticker_response['name'],
                "status": "disabled"
            }
            ticker, _ = Ticker.objects.update_or_create(symbol=ixe_ticker_response['symbol'], defaults=defaults)

            print (ticker.symbol)

            url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/options'
            options_resp = requests.get(url, params=params)
            if options_resp.status_code != 200:
                continue

            options = options_resp.json()

            if not options:
                continue

            # save expiration_dates
            for option in options:
                try:  # to handle invalid date format from api
                    date = datetime.datetime.strptime(option, '%Y%m%d').date()
                except ValueError:
                    continue

                ticker.expiration_dates.get_or_create(date=date)

            ticker.status = 'unspecified'
            ticker.save()

            url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/stats'
            stats_resp = requests.get(url, params=params)
            stats_resp.raise_for_status()
            stats = stats_resp.json()

            defaults = {
                'company_name': stats["companyName"],
                'market_cap': stats["marketcap"],
                'week52_high': stats["week52high"],
                'week52_low': stats["week52low"],
                'week52_high_split_adjust_only': stats["week52highSplitAdjustOnly"],
                'week52_low_split_adjust_only': stats["week52lowSplitAdjustOnly"],
                'shares_outstanding': stats["sharesOutstanding"],
                'day200_moving_avg': stats["day200MovingAvg"],
                'day50_moving_avg': stats["day50MovingAvg"],
                'ttm_eps': stats["ttmEPS"],
                'ttm_dividend_rate': stats["ttmDividendRate"],
                'dividend_yield': stats["dividendYield"],
                'next_dividend_date': stats["nextDividendDate"] if stats.get("nextDividendDate") else None,
                'ex_dividend_date': stats["exDividendDate"] if stats.get("exDividendDate") else None,
                'next_earnings_date': stats["nextEarningsDate"] if stats.get("nextEarningsDate") else None,
                'pe_ratio': stats["peRatio"],
                'beta': stats["beta"],
            }

            TickerStats.objects.update_or_create(ticker=ticker, defaults=defaults)
