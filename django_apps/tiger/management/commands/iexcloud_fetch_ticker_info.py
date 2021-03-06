import multiprocessing as mp
from datetime import datetime, timedelta
from functools import partial

import requests
from django import db
from django.conf import settings
from django.core.management.base import BaseCommand
from tiger.models import Ticker, TickerStats
from tiger.utils import get_now_date, is_market_open, get_now

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


def fetch_expiration_dates_and_update_status(ticker):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/options'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print(f'({ticker.symbol}) Error in fetching expiration dates:', resp.status_code, resp.content, resp.url)
        return

    expiration_date_strs = resp.json()

    # save expiration_dates
    for expiration_date_str in expiration_date_strs:
        if not expiration_date_str:
            continue
        try:  # to handle invalid date format from api
            exp_date = datetime.strptime(expiration_date_str, '%Y%m%d').date()
            if exp_date > get_now_date() + timedelta(days=365 * 3):
                print(f'({ticker.symbol}) Skip too far exp date:', expiration_date_str)
                continue
            ticker.expiration_dates.update_or_create(date=exp_date)
        except ValueError:
            print(f'({ticker.symbol}) Invalid date format:', expiration_date_str)
            continue

    ticker.status = 'unspecified' if ticker.expiration_dates.count() > 0 else 'disabled'
    ticker.save()


def fetch_stats(ticker_stats):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker_stats.ticker.symbol}/stats'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching stats:', resp.status_code, resp.content, resp.url)
        return

    stats = resp.json()
    if stats:
        ticker_stats.market_cap = stats.get('marketcap')
        ticker_stats.week52_high = stats.get('week52high')
        ticker_stats.week52_low = stats.get('week52low')
        ticker_stats.week52_high_split_adjust_only = stats.get('week52highSplitAdjustOnly')
        ticker_stats.week52_low_split_adjust_only = stats.get('week52lowSplitAdjustOnly')
        ticker_stats.shares_outstanding = stats.get('sharesOutstanding')
        ticker_stats.day200_moving_avg = stats.get('day200MovingAvg')
        ticker_stats.day50_moving_avg = stats.get('day50MovingAvg')
        ticker_stats.ttm_eps = stats.get('ttmEPS')
        ticker_stats.ttm_dividend_rate = stats.get('ttmDividendRate')
        ticker_stats.dividend_yield = stats.get('dividendYield')
        ticker_stats.next_dividend_date = stats.get('nextDividendDate') if stats.get('nextDividendDate') else None
        ticker_stats.ex_dividend_date = stats.get('exDividendDate') if stats.get('exDividendDate') else None
        ticker_stats.next_earnings_date = stats.get('nextEarningsDate') if stats.get('nextEarningsDate') else None
        ticker_stats.pe_ratio = stats.get('peRatio')
        ticker_stats.beta = stats.get('beta')


def fetch_dividends(ticker_stats):
    period = '1m'  # default by api
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker_stats.ticker.symbol}/dividends/{period}'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching dividends:', resp.status_code, resp.content, resp.url)
        return

    dividends = resp.json()
    if dividends:
        ticker_stats.dividend_payment_amount = dividends[0].get('amount')


def fetch_splits(ticker_stats):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker_stats.ticker.symbol}/splits'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching splits:', resp.status_code, resp.content, resp.url)
        return

    splits = resp.json()
    if splits:
        ticker_stats.split_declaration_date = splits[0].get('declaredDate')
        ticker_stats.split_ex_date = splits[0].get('exDate')


def fetch_price_target(ticker_stats):
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker_stats.ticker.symbol}/price-target'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print('Error in fetching price target:', resp.status_code, resp.content, resp.url)
        return

    info = resp.json()
    if info:
        ticker_stats.price_target_average = info.get('priceTargetAverage')
        ticker_stats.price_target_high = info.get('priceTargetHigh')
        ticker_stats.price_target_low = info.get('priceTargetLow')
        ticker_stats.number_of_analysts = info.get('numberOfAnalysts')


def fetch_historical_volatility(ticker_stats):
    '''Context:https://www.profitspi.com/stock/view.aspx?v=stock-chart&uv=100585
        Data verification: https://www.barchart.com/stocks/quotes/AAPL/overview'''
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker_stats.ticker.symbol}/indicator/volatility'
    resp = requests.get(url, params={**DEFAULT_QUERY_PARAMS, 'indicatorOnly': True, 'range': '35d', 'input1': 20})

    if not resp.ok:
        print('Error in fetching historical volatility:', resp.status_code, resp.content, resp.url)
        return

    result = resp.json()
    if len(result.get('indicator', [])) > 0 and len(result.get('indicator')[0]) > 0:
        ticker_stats.historical_volatility = result.get('indicator')[0][-1]


def fetch_ohlc_prices(ticker_stats):
    ticker = ticker_stats.ticker
    date_str = ticker_stats.data_time.strftime("%Y%m%d")  # Example: 20210601.
    url = f'{settings.IEXCLOUD_BASE_URL}/stock/{ticker.symbol}/chart/date/{date_str}?chartByDay=true'
    resp = requests.get(url, params=DEFAULT_QUERY_PARAMS)

    if not resp.ok:
        print(f'Error in fetching OHLC data for symbol {ticker} :', resp.status_code, resp.content, resp.url)
        return

    prices = resp.json()
    if len(prices) == 0:
        print(f'Empty result in fetching OHLC data for symbol {ticker}', resp.url)
        return

    day_prices = prices[0]
    if day_prices:
        ticker_stats.price_open = float(day_prices.get('open'))
        ticker_stats.price_high = float(day_prices.get('high'))
        ticker_stats.price_low = float(day_prices.get('low'))
        ticker_stats.price_close = float(day_prices.get('close'))
        ticker_stats.daily_volume = day_prices.get('volume')


def fetch_ticker_info(ticker_id, data_time=None):
    ticker = Ticker.objects.get(id=ticker_id)

    # Fetch expiration dates.
    if ticker.need_refresh_expiration_dates():
        print(f'Fetching exp dates: {ticker.symbol}')
        fetch_expiration_dates_and_update_status(ticker)
    else:
        print(f'Exp dates cached: {ticker.symbol}')

    # Fetch stats.
    if ticker.need_refresh_stats():
        print(f'Fetching stats: {ticker.symbol}')
        ticker_stats = TickerStats(ticker=ticker, data_time=data_time if data_time else get_now())
        fetch_stats(ticker_stats)
        fetch_dividends(ticker_stats)
        fetch_splits(ticker_stats)
        # fetch_price_target(ticker_stats)  # preminum data, will be enabled later
        fetch_historical_volatility(ticker_stats)
        fetch_ohlc_prices(ticker_stats)
        ticker_stats.save()
    else:
        print(f'Stats skipped: {ticker.symbol}')


class Command(BaseCommand):
    help = 'Fetch ticker data from IEX Cloud'

    def handle(self, *args, **options):
        # Build date for the /chart/date endpoint.
        today_date = get_now_date()

        # If the market is closed, skip all.
        if not is_market_open(today_date):
            print('Market is closed, skip current run.')
            return

        for ticker_info in fetch_tickers():
            defaults = {
                "full_name": ticker_info.get('name'),
            }
            Ticker.objects.update_or_create(symbol=ticker_info.get('symbol'), defaults=defaults)

        ticker_ids = [ticker.id for ticker in Ticker.objects.all()] if not settings.DEBUG \
            else [ticker.id for ticker in
                  Ticker.objects.filter(
                      symbol__in=['AAL', 'AAPL', 'AMC', 'ANBN', 'BRK.A', 'FUTU', 'GME', 'NXTD', 'GOOG', 'SPY', 'SVRA',
                                  'TSLA', 'QQQ', 'YELP', 'ZEPP', 'PYPE'])]

        # Parallelization and mapping
        pool_size = min(mp.cpu_count() * 2, 16)
        print('pool_size:', pool_size)
        db.connections.close_all()

        with mp.Pool(pool_size, maxtasksperchild=2) as pool:
            pool.map(partial(fetch_ticker_info), ticker_ids)
