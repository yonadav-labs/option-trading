import requests
from requests.adapters import HTTPAdapter

from django.conf import settings


def is_valid_option_response(response):
    return 'optionChain' in response and 'result' in response.get('optionChain') and len(
        response.get('optionChain').get('result')) > 0


def get_expiration_timestamps(response, is_yahoo):
    if is_yahoo:
        if not is_valid_option_response(response):
            return None
        return response.get('optionChain').get('result')[0].get('expirationDates', [])


def get_call_puts(response, is_yahoo):
    if is_yahoo:
        if not is_valid_option_response(response):
            return None, None
        result = response.get('optionChain').get('result')[0]
        if 'options' not in result or len(result.get('options', [])) == 0:
            return None, None
        options = result.get('options')[0]

        return options.get('calls', []), options.get('puts', [])


def get_quote(response, is_yahoo):
    if is_yahoo:
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
    from tiger.fetcher import fetch_external_api, get_yahoo_option_url

    request_url = get_yahoo_option_url('QQQE')
    response_str = fetch_external_api(request_url)
    response = json.loads(response_str)
    print(get_expiration_timestamps(response))
    print()
    print(get_call_puts(response)[0])
    print()
    print(get_call_puts(response)[1])
    print()
    print(get_quote(response))
