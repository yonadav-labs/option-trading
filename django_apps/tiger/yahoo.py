import requests
from requests.adapters import HTTPAdapter

from tiger.utils import timestamp_to_datetime_with_default_tz


def get_base_url():
    return 'https://query1.finance.yahoo.com/v7/finance/'


def get_option_url(ticker):
    return "{}options/{}".format(get_base_url(), ticker)


def fetch_yahoo_options_str(request_url):
    s = requests.Session()
    s.mount('https://', HTTPAdapter(max_retries=2))
    try:
        raw_response = s.get(request_url)
        result = raw_response.json()
    except Exception:
        # TODO: add logging.
        return None

    if 'optionChain' not in result or 'result' not in result.get('optionChain') or len(
            result.get('optionChain').get('result')) == 0:
        return None
    # Returns raw string.
    return raw_response.content


def get_expiration_datetimes(yh_response_dict):
    if 'optionChain' not in yh_response_dict or 'result' not in yh_response_dict.get('optionChain') or len(
            yh_response_dict.get('optionChain').get('result')) == 0:
        return None
    timestamps = yh_response_dict.get('optionChain').get('result')[0].get('expirationDates', [])
    return [timestamp_to_datetime_with_default_tz(ts) for ts in timestamps]


if __name__ == "__main__":
    import os
    import sys
    import django

    sys.path.append("/usr/src/app/")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_apps.settings')
    django.setup()

    import json

    request_url = get_option_url('TSLA')
    response_str = fetch_yahoo_options_str(request_url)
    response = json.loads(response_str)
    print(get_expiration_datetimes(response))
