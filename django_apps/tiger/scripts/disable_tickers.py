import os
import sys
import django
import time
import yfinance as yf


def check_ticker_option():
    for ticker in Ticker.objects.filter(id__gt=4):
        print(ticker.id, ticker.symbol)
        time.sleep(2)
        y_ticker = yf.Ticker(ticker.symbol.upper())
        for i in range(1, 4):
            try:
                if not y_ticker.options:
                    ticker.status = 'disabled'
                    ticker.save()
            except IndexError as e:
                ticker.status = 'disabled'
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
