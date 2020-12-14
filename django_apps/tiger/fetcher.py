import requests
from requests.adapters import HTTPAdapter

from django.conf import settings


# Base
def fetch_external_api(request_url):
    raw_response = requests.get(
        request_url,
        proxies={"https": settings.SCRAPE_PROXY}, verify=False
    ) if settings.SCRAPE_PROXY else requests.get(request_url)
    response = raw_response.json()  # Check if json is valid.
    # Returns raw string.
    return raw_response.content


# Yahoo
def get_yahoo_base_url():
    return 'https://query1.finance.yahoo.com/v7/finance/'


def get_yahoo_option_url(ticker, expiration_timestamp=None):
    if not expiration_timestamp:
        return "{}options/{}".format(get_yahoo_base_url(), ticker)
    return "{}options/{}?date={}".format(get_yahoo_base_url(), ticker, expiration_timestamp)


# TD
def get_td_base_url():
    return 'https://api.tdameritrade.com/v1/marketdata/chains?apikey=L2RWYXJQXRJHRMWALDSDY3VSDRKXBWQZ' \
           '&contractType=ALL&includeQuotes=TRUE&strategy=SINGLE'


# We still use yahoo to get expiration dates. But use TD to get option chain.
def get_td_option_url(ticker):
    return "{}&symbol={}&fromDate=2020-12-01".format(get_td_base_url(), ticker)


def get_call_puts(response):
    return response.get('callExpDateMap').keys()


def get_quote(response):
    result = response.get('optionChain').get('result')[0]
    return result.get('quote')


if __name__ == "__main__":
    import os
    import sys
    import django
    import json

    sys.path.append("/usr/src/app/")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_apps.settings')
    django.setup()

    request_url = get_td_option_url('TSLA')
    response_str = fetch_external_api(request_url)
    response = json.loads(response_str)
    print(get_call_puts(response))
    # print(get_option_contracts(response)[1])
    # print(get_quote(response))
