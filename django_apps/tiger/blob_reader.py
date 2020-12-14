import requests
from requests.adapters import HTTPAdapter
from django.conf import settings
from tiger.classes import OptionContract


def is_valid_option_response(response):
    return 'optionChain' in response and 'result' in response.get('optionChain') and len(
        response.get('optionChain').get('result')) > 0


def get_quote(response, is_yahoo):
    if is_yahoo:
        result = response.get('optionChain').get('result')[0]
        return result.get('quote')
    else:
        return response.get('underlying')


def get_expiration_timestamps(response, is_yahoo):
    if is_yahoo:
        if not is_valid_option_response(response):
            return None
        return response.get('optionChain').get('result')[0].get('expirationDates', [])
    else:
        timestamps = []
        for date_str, blob in response.get('putExpDateMap').items():
            for strike_str, contracts in blob.items():
                timestamps.append(contracts[0].get('expirationDate'))
                break
        return timestamps


def get_call_puts(response, is_yahoo, expiration_timestamp=None):
    if is_yahoo:
        if not is_valid_option_response(response):
            return None, None
        result = response.get('optionChain').get('result')[0]
        if 'options' not in result or len(result.get('options', [])) == 0:
            return None, None
        options = result.get('options')[0]

        latest_price = get_quote(response, True).get('regularMarketPrice')
        call_contracts = [OptionContract(True, row, latest_price) for row in options.get('calls', [])]
        put_contracts = [OptionContract(False, row, latest_price) for row in options.get('puts', [])]
        return call_contracts, put_contracts
    else:
        latest_price = get_quote(response, False).get('last')
        call_contracts = []
        for date_str, blob in response.get('callExpDateMap').items():
            for strike_str, contracts in blob.items():
                row = contracts[0]
                if expiration_timestamp == row.get('expirationDate'):
                    call_contracts.append(OptionContract(True, row, latest_price))
                else:
                    break
        put_contracts = []
        for date_str, blob in response.get('putExpDateMap').items():
            for strike_str, contracts in blob.items():
                row = contracts[0]
                if expiration_timestamp == row.get('expirationDate'):
                    put_contracts.append(OptionContract(False, row, latest_price))
                else:
                    break
        return call_contracts, put_contracts


if __name__ == "__main__":
    import os
    import sys
    import django

    sys.path.append("/usr/src/app/")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_apps.settings')
    django.setup()

    import json
    from tiger.fetcher import fetch_external_api, get_yahoo_option_url, get_td_option_url

    request_url = get_yahoo_option_url('QQQE')
    response_str = fetch_external_api(request_url)
    response = json.loads(response_str)
    print(get_expiration_timestamps(response, True))
    print()
    print(get_quote(response, True))
    print()
    print(get_call_puts(response, True)[0])
    print()
    print(get_call_puts(response, True)[1])
    print('\n\n=======================================\n\n')

    request_url = get_td_option_url('QQQE')
    response_str = fetch_external_api(request_url)
    response = json.loads(response_str)
    print(get_expiration_timestamps(response, False))
    print()
    print(get_quote(response, False))
    print()
    print(get_call_puts(response, False, 1608325200000)[0])
    print()
    print(get_call_puts(response, False, 1608325200000)[1])
