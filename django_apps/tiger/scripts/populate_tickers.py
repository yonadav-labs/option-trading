import os
import sys
import django
import time


def check_ticker_option():
    for ticker in Ticker.objects.filter(id__gt=9187):
        print(ticker.id, ticker.symbol)
        time.sleep(2)
        for i in range(1, 4):
            try:
                expiration_timestamps = ticker.get_expiration_timestamps()
                if not expiration_timestamps:
                    ticker.status = 'disabled'
                quote = ticker.get_quote()
                ticker.full_name = quote.get('longName', quote.get('shortName', ''))
                ticker.save()
            except Exception as e:
                print(e)
                time.sleep(2 * i * i)


if __name__ == '__main__':
    sys.path.append("/usr/src/app/")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_apps.settings')
    django.setup()
    from tiger.models import Ticker

    check_ticker_option()
