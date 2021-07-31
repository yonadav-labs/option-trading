import requests

from django.conf import settings
from tiger.utils import timestamp_to_datetime_with_default_tz, is_market_open_now


# Base
def fetch_external_api(request_url):
    raw_response = requests.get(
        request_url,
        proxies={'https': settings.SCRAPE_PROXY}, verify=False
    ) if settings.SCRAPE_PROXY else requests.get(request_url)
    response = raw_response.json()  # Check if json is valid.
    # Returns raw string.
    return raw_response.content


# IEX
def get_iex_base_url():
    return settings.IEXCLOUD_BASE_URL


def get_iex_quote_url(ticker_symbol):
    # Example: https://cloud.iexapis.com/v1/stock/SPY/quote?token=pk_857fc78a42ec4c35b018d6f5fb7b2f04
    return '{}/stock/{}/quote?token={}'.format(get_iex_base_url(), ticker_symbol, settings.IEXCLOUD_TOKEN)


# TD
def get_td_base_url():
    return 'https://api.tdameritrade.com/v1/marketdata/chains?apikey=L2RWYXJQXRJHRMWALDSDY3VSDRKXBWQZ' \
           '&contractType=ALL&includeQuotes=TRUE&strategy=SINGLE'


def get_td_option_url(ticker):
    return '{}&symbol={}&fromDate=2021-07-01'.format(get_td_base_url(), ticker)


# Intrinio
def get_intrinio_base_url():
    return settings.INTRINIO_BASE_URL


def get_intrinio_option_url(ticker_symbol, exp_date_str):
    '''Exp date string format: 2021-08-20'''
    return '{}/options/chain/{}/{}/realtime?source=delayed&api_key={}'.format(
        get_intrinio_base_url(), ticker_symbol, exp_date_str, settings.INTRINIO_API_KEY)


def get_option_url(ticker_symbol, expiration_timestamp):
    '''expiration_timestamp is in seconds'''
    if settings.USE_INTRINIO and is_market_open_now():
        exp_date_str = timestamp_to_datetime_with_default_tz(expiration_timestamp).strftime('%Y-%m-%d')
        return get_intrinio_option_url(ticker_symbol, exp_date_str)
    else:
        return get_td_option_url(ticker_symbol)
