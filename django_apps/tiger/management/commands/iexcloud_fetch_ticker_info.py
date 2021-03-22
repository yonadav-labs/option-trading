import multiprocessing as mp
from datetime import datetime

import requests
from django import db
from django.conf import settings
from django.core.management.base import BaseCommand
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
            date = datetime.strptime(expiration_date_str, '%Y%m%d').date()
            ticker.expiration_dates.update_or_create(date=date)
        except ValueError:
            print(f'({ticker.symbol}) Invalid date format:', expiration_date_str)
            continue


def fetch_stats(ticker, new_stats):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/stats'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching stats:', resp.status_code, resp.content)
        return

    stats = resp.json()
    if stats:
        new_stats.company_name = stats.get('companyName')
        new_stats.market_cap = stats.get('marketcap')
        new_stats.week52_high = stats.get('week52high')
        new_stats.week52_low = stats.get('week52low')
        new_stats.week52_high_split_adjust_only = stats.get('week52highSplitAdjustOnly')
        new_stats.week52_low_split_adjust_only = stats.get('week52lowSplitAdjustOnly')
        new_stats.shares_outstanding = stats.get('sharesOutstanding')
        new_stats.day200_moving_avg = stats.get('day200MovingAvg')
        new_stats.day50_moving_avg = stats.get('day50MovingAvg')
        new_stats.ttm_eps = stats.get('ttmEPS')
        new_stats.ttm_dividend_rate = stats.get('ttmDividendRate')
        new_stats.dividend_yield = stats.get('dividendYield')
        new_stats.next_dividend_date = stats.get('nextDividendDate') if stats.get('nextDividendDate') else None
        new_stats.ex_dividend_date = stats.get('exDividendDate') if stats.get('exDividendDate') else None
        new_stats.next_earnings_date = stats.get('nextEarningsDate') if stats.get('nextEarningsDate') else None
        new_stats.pe_ratio = stats.get('peRatio')
        new_stats.beta = stats.get('beta')


def fetch_dividends(ticker, new_stats):
    period = '1m'  # default by api
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/dividends/{period}'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching dividends:', resp.status_code, resp.content)
        return

    dividends = resp.json()
    if dividends:
        new_stats.dividend_payment_amount = dividends[0].get('amount')


def fetch_splits(ticker, new_stats):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/splits'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching splits:', resp.status_code, resp.content)
        return

    splits = resp.json()
    if splits:
        new_stats.split_declaration_date = splits[0].get('declaredDate')
        new_stats.split_ex_date = splits[0].get('exDate')


def fetch_price_target(ticker, new_stats):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/price-target'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching price target:', resp.status_code, resp.content)
        return

    info = resp.json()
    if info:
        new_stats.price_target_average = info.get('priceTargetAverage')
        new_stats.price_target_high = info.get('priceTargetHigh')
        new_stats.price_target_low = info.get('priceTargetLow')
        new_stats.number_of_analysts = info.get('numberOfAnalysts')


def fetch_historical_volatility(ticker, new_stats):
    '''Context: https://www.profitspi.com/stock/view.aspx?v=stock-chart&uv=100585'''
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/indicator/volatility'
    resp = requests.get(url, params={**DEFAULT_QUERY_PARAMS, 'indicatorOnly': True, 'range': '35d', 'input1': 20})

    if not resp.ok:
        print('Error in fetching historical volatility:', resp.status_code, resp.content)
        return

    result = resp.json()
    if len(result.get('indicator', [])) > 0 and len(result.get('indicator')[0]) > 0:
        new_stats.historical_volatility = result.get('indicator')[0][-1]


def fetch_ticker_info(ticker_id):
    ticker = Ticker.objects.get(id=ticker_id)

    # Fetch expiration dates.
    if ticker.need_refresh_expiration_dates():
        print(f'Fetching exp dates: {ticker.symbol}')
        fetch_expiration_dates(ticker)
    else:
        print(f'Exp dates cached: {ticker.symbol}')

    # Fetch stats.
    if ticker.need_refresh_stats():
        print(f'Fetching stats: {ticker.symbol}')
        new_stats = TickerStats(ticker=ticker)
        fetch_stats(ticker, new_stats)
        fetch_dividends(ticker, new_stats)
        fetch_splits(ticker, new_stats)
        # fetch_price_target(ticker, new_stats)  # preminum data, will be enabled later
        fetch_historical_volatility(ticker, new_stats)
        new_stats.save()
    else:
        print(f'Stats cached: {ticker.symbol}')


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
