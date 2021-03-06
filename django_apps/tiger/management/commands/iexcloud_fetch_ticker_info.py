import datetime

import requests

from django.conf import settings
from django.core.management.base import BaseCommand

from tiger.models import Ticker, TickerStats


class Command(BaseCommand):
    help = 'Fetch ticker data from IEX Cloud'

    def __init__(self):
        self.period = '1m'  # default by api
        self.params = {
            'token': settings.IEXCLOUD_TOKEN
        }

    def fetch_tickers(self):
        url = f'{settings.IEXCLOUD_BASE_URL}/ref-data/symbols'
        symbols_resp = requests.get(url, params=self.params)
        symbols_resp.raise_for_status()
        ixe_ticker_responses = symbols_resp.json()

        ticker_infos = []
        for ixe_ticker_response in ixe_ticker_responses:
            if ixe_ticker_response['region'] != 'US' or ixe_ticker_response['exchange'] not in ['NYS', 'USAMEX', 'NAS', 'USPAC'] or ixe_ticker_response['type'] not in ['ad', 're', 'cs', 'et']:
                continue

            ticker_infos.append(ixe_ticker_response)

        return ticker_infos

    def fetch_expiration_dates(self, ticker):
        url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/options'
        options_resp = requests.get(url, params=self.params)
        if not options_resp.ok or not options_resp.json():
            return

        options = options_resp.json()
        # save expiration_dates
        for option in options:
            try:  # to handle invalid date format from api
                date = datetime.datetime.strptime(option, '%Y%m%d').date()
                ticker.expiration_dates.get_or_create(date=date)
            except ValueError:
                continue

        # enable the ticker
        ticker.status = 'unspecified'
        ticker.save()

    def fetch_stats(self, ticker):
        url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/stats'
        stats_resp = requests.get(url, params=self.params)
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

    def fetch_dividends(self, ticker):
        url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/dividends/{self.period}'
        dividends_resp = requests.get(url, params=self.params)

        if dividends_resp.ok:
            dividends = dividends_resp.json()
            if dividends:
                ticker.tickerstats.dividend_payment_amount = dividends[0]['amount']
                ticker.tickerstats.save()

    def fetch_splits(self, ticker):
        url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/splits'
        splits_resp = requests.get(url, params=self.params)

        if splits_resp.ok:
            splits = splits_resp.json()
            if splits:
                ticker.tickerstats.split_declaration_date = splits[0]['declaredDate']
                ticker.tickerstats.split_ex_date = splits[0]['exDate']
                ticker.tickerstats.save()

    def fetch_price_target(self, ticker):
        url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/price-target'
        resp = requests.get(url, params=self.params)

        if resp.ok:
            info = resp.json()
            if info:
                ticker.tickerstats.price_target_average = info['priceTargetAverage']
                ticker.tickerstats.price_target_high = info['priceTargetHigh']
                ticker.tickerstats.price_target_low = info['priceTargetLow']
                ticker.tickerstats.number_of_analysts = info['numberOfAnalysts']
                ticker.tickerstats.save()

    def handle(self, *args, **options):
        ticker_infos = self.fetch_tickers()

        for ticker_info in ticker_infos:
            defaults = {
                "full_name": ticker_info['name'],
                "status": "disabled"
            }

            ticker, _ = Ticker.objects.update_or_create(symbol=ticker_info['symbol'], defaults=defaults)

            self.fetch_expiration_dates(ticker)
            self.fetch_stats(ticker)
            self.fetch_dividends(ticker)
            self.fetch_splits(ticker)
            # self.fetch_price_target(ticker)  # preminum data, will be enabled later

            print (ticker.symbol)
