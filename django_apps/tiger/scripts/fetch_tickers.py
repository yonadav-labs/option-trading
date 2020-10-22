import os
import sys
import django
import requests


def fetch_symbols():
    response = requests.get('https://finnhub.io/api/v1/stock/symbol?exchange=US&token=bu7oi2n48v6us4j99aqg')
    data = response.json()
    for row in data:
        Ticker.objects.get_or_create(
            symbol=row.get('symbol')
        )


if __name__ == '__main__':
    sys.path.append("/usr/src/app/")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_apps.settings')
    django.setup()
    from tiger.models import Ticker

    fetch_symbols()
