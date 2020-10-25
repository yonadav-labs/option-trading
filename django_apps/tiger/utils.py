from datetime import datetime
from django.utils.timezone import make_aware, get_default_timezone


def get_raw_calls(yh_ticker, expiration_date_str):
    yh_ticker.options  # Initialize.
    internal_date = yh_ticker._expirations[expiration_date_str]
    options = yh_ticker._download_options(internal_date)
    return options.get('calls')


def get_now():
    return make_aware(datetime.now(), get_default_timezone())


def timestamp_to_datetime_with_default_tz(timestamp):
    return make_aware(datetime.fromtimestamp(timestamp), get_default_timezone())


if __name__ == "__main__":
    import os
    import sys
    import django

    sys.path.append("/usr/src/app/")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_apps.settings')
    django.setup()

    import yfinance as yf

    stock = yf.Ticker('TSLA')
    print(stock.options)
    print(stock._expirations)
    calls = get_raw_calls(stock, stock.options[0])

    from tiger.classes import OptionContract
    from tiger.serializers import OptionContractSerializer

    contract = OptionContract(calls[0])
    serialized_contract = OptionContractSerializer(contract)
    print(serialized_contract.data)
