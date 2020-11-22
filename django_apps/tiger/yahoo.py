import requests
from requests.adapters import HTTPAdapter

from django.conf import settings


def get_yahoo_base_url():
    return 'https://query1.finance.yahoo.com/v7/finance/'


def get_yahoo_option_url(ticker, expiration_timestamp=None):
    if not expiration_timestamp:
        return "{}options/{}".format(get_yahoo_base_url(), ticker)
    return "{}options/{}?date={}".format(get_yahoo_base_url(), ticker, expiration_timestamp)


def is_valid_option_response(response):
    return 'optionChain' in response and 'result' in response.get('optionChain') and len(
        response.get('optionChain').get('result')) > 0


def fetch_external_api(request_url):
    if settings.SCRAPE_PROXY:
        request_url = settings.SCRAPE_PROXY + request_url

    s = requests.Session()
    s.mount('https://', HTTPAdapter(max_retries=2))
    try:
        raw_response = s.get(request_url)
        response = raw_response.json()
    except Exception:
        # TODO: add logging.
        return None
    if not is_valid_option_response(response):
        return None
    # Returns raw string.
    return raw_response.content


def get_expiration_timestamps(response):
    if not is_valid_option_response(response):
        return None
    return response.get('optionChain').get('result')[0].get('expirationDates', [])


def get_option_contracts(response):
    if not is_valid_option_response(response):
        return None, None
    result = response.get('optionChain').get('result')[0]
    if 'options' not in result or len(result.get('options', [])) == 0:
        return None, None
    options = result.get('options')[0]

    return options.get('calls', []), options.get('puts', []),


def get_quote(response):
    result = response.get('optionChain').get('result')[0]
    return result.get('quote')


if __name__ == "__main__":
    import os
    import sys
    import django

    sys.path.append("/usr/src/app/")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_apps.settings')
    django.setup()

    import json

    request_url = get_yahoo_option_url('TSLA')
    response_str = fetch_external_api(request_url)
    response = json.loads(response_str)
    print(get_expiration_timestamps(response))
    print(get_option_contracts(response)[0])
    print(get_option_contracts(response)[1])
    print(get_quote(response))
