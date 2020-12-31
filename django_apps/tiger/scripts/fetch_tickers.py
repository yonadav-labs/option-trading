import os
import sys
import django
import time
import requests

from django.conf import settings
from tiger.fetcher import fetch_external_api, get_yahoo_option_url
from tiger.blob_reader import get_expiration_timestamps, get_quote


def fetch_symbols():
    for mic in ['XNYS', 'XNGS', 'ARCX']:
        response = requests.get(
            'https://finnhub.io/api/v1/stock/symbol?exchange=US&token=bu7oi2n48v6us4j99aqg&mic=' + mic)
        data = response.json()
        for row in data:
            Ticker.objects.get_or_create(
                symbol=row.get('symbol')
            )


def fetch_ticker_details():
    for ticker in Ticker.objects.filter(full_name__exact=''):
        for i in range(3):
            try:
                request_url = get_yahoo_option_url(ticker.symbol)
                raw_response = requests.get(
                    request_url,
                    proxies={'https': 'https://29fb2a1ce7be48c588efa446066c507f:@proxy.crawlera.com:8010/'},
                    verify=False
                )
                response = raw_response.json()  # Check if json is valid.

                expiration_timestamps = get_expiration_timestamps(response, True)
                if not expiration_timestamps:
                    ticker.status = 'disabled'
                quote = get_quote(response, True)
                ticker.full_name = quote.get('longName', quote.get('shortName', ''))
                ticker.save()
                print(ticker)
                break;
            except Exception as e:
                print(e)


if __name__ == '__main__':
    sys.path.append("/usr/src/app/")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_apps.settings')
    django.setup()
    from tiger.models import Ticker

    print('fetch_symbols...')
    fetch_symbols()
    print('fetch_symbols done.')

    print('fetch_ticker_details...')
    fetch_ticker_details()
    print('fetch_ticker_details done.')
