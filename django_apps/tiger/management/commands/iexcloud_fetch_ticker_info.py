import datetime
import multiprocessing as mp
from multiprocessing import Pool

import requests

from django.conf import settings
from django.core.management.base import BaseCommand
from django import db

from tiger.models import Ticker, TickerStats

DEFAULT_QUERY_PARAMS = {
    'token': settings.IEXCLOUD_TOKEN
}


def fetch_tickers():
    url = f'{settings.IEXCLOUD_BASE_URL}/ref-data/symbols'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)
    resp.raise_for_status()
    ixe_ticker_responses = resp.json()

    ticker_infos = []
    for ixe_ticker_response in ixe_ticker_responses:
        if ixe_ticker_response['region'] != 'US' or ixe_ticker_response['exchange'] not in ['NYS', 'USAMEX', 'NAS',
                                                                                            'USPAC'] or \
                ixe_ticker_response['type'] not in ['ad', 're', 'cs', 'et']:
            continue

        ticker_infos.append(ixe_ticker_response)

    return ticker_infos


def fetch_expiration_dates(ticker):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/options'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print(f'({ticker.symbol}) Error in fetching expiration dates:', resp.status_code, resp.content)
        if resp.status_code == 404:
            # disable the ticker
            ticker.status = 'disabled'
            ticker.save()
        return

    expiration_date_strs = resp.json()
    ticker.status = 'unspecified' if expiration_date_strs else 'disabled'
    ticker.save()

    # save expiration_dates
    for expiration_date_str in expiration_date_strs:
        try:  # to handle invalid date format from api
            date = datetime.datetime.strptime(expiration_date_str, '%Y%m%d').date()
            ticker.expiration_dates.get_or_create(date=date)
        except ValueError:
            print(f'({ticker.symbol}) Invalid date format:', expiration_date_str)
            continue


def fetch_stats(ticker):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/stats'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching stats:', resp.status_code, resp.content)
        return

    stats = resp.json()
    if stats:
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


def fetch_dividends(ticker):
    period = '1m'  # default by api
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/dividends/{period}'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching dividends:', resp.status_code, resp.content)
        return

    dividends = resp.json()
    if dividends:
        ticker.tickerstats.dividend_payment_amount = dividends[0]['amount']
        ticker.tickerstats.save()


def fetch_splits(ticker):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/splits'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching splits:', resp.status_code, resp.content)
        return

    splits = resp.json()
    if splits:
        ticker.tickerstats.split_declaration_date = splits[0]['declaredDate']
        ticker.tickerstats.split_ex_date = splits[0]['exDate']
        ticker.tickerstats.save()


def fetch_price_target(ticker):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/price-target'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching price target:', resp.status_code, resp.content)
        return

    info = resp.json()
    if info:
        ticker.tickerstats.price_target_average = info['priceTargetAverage']
        ticker.tickerstats.price_target_high = info['priceTargetHigh']
        ticker.tickerstats.price_target_low = info['priceTargetLow']
        ticker.tickerstats.number_of_analysts = info['numberOfAnalysts']
        ticker.tickerstats.save()


def fetch_historical_volatility(ticker):
    '''Context: https://www.profitspi.com/stock/view.aspx?v=stock-chart&uv=100585'''
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/indicator/volatility'
    resp = requests.get(url, params={**DEFAULT_QUERY_PARAMS, 'indicatorOnly': True, 'range': '35d', 'input1': 20})

    if not resp.ok:
        print('Error in fetching historical volatility:', resp.status_code, resp.content)
        return

    result = resp.json()
    if len(result.get('indicator', [])) > 0 and len(result.get('indicator')[0]) > 0:
        ticker.tickerstats.historical_volatility = result.get('indicator')[0][-1]
        ticker.tickerstats.save()


def fetch_ticker_info(ticker_id):
    ticker = Ticker.objects.get(id=ticker_id)
    print(ticker.symbol)

    fetch_expiration_dates(ticker)
    if ticker.status == 'unspecified':
        fetch_stats(ticker)
        fetch_dividends(ticker)
        fetch_splits(ticker)
        # fetch_price_target(ticker)  # preminum data, will be enabled later
        fetch_historical_volatility(ticker)


class Command(BaseCommand):
    help = 'Fetch ticker data from IEX Cloud'

    def handle(self, *args, **options):
        for ticker_info in fetch_tickers():
            defaults = {
                "full_name": ticker_info['name'],
            }
            Ticker.objects.update_or_create(symbol=ticker_info['symbol'], defaults=defaults)

        ticker_ids = [ticker.id for ticker in Ticker.objects.all()]

        pool_size = min(mp.cpu_count() * 2, 16)
        print('pool_size:', pool_size)
        db.connections.close_all()

        with mp.Pool(pool_size, maxtasksperchild=2) as pool:
            pool.map(fetch_ticker_info, ticker_ids)
