import requests
from requests.adapters import HTTPAdapter

from tiger.utils import timestamp_to_datetime_with_default_tz


def get_yahoo_base_url():
    return 'https://query1.finance.yahoo.com/v7/finance/'


def get_yahoo_option_url(ticker):
    return "{}options/{}".format(get_yahoo_base_url(), ticker)


def is_valid_option_response(response):
    return 'optionChain' in response and 'result' in response.get('optionChain') and len(
        response.get('optionChain').get('result')) > 0


def fetch_external_api(request_url):
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


def get_expiration_datetimes(response):
    if not is_valid_option_response(response):
        return None
    timestamps = response.get('optionChain').get('result')[0].get('expirationDates', [])
    return [timestamp_to_datetime_with_default_tz(ts) for ts in timestamps]


'''
def get_call_contracts(response):
    if not is_valid_option_response(response):
        return None
    result = response.get('optionChain').get('result')[0]
    # if 'options' not in result or

    return None
'''

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
    print(get_expiration_datetimes(response))
