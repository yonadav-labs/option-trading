import random
from datetime import datetime, time, timedelta

import numpy as np
import pandas_market_calendars as mcal
import pytz
from django.utils import timezone
from django.utils.timezone import make_aware, get_default_timezone


def get_raw_calls(yh_ticker, expiration_date_str):
    yh_ticker.options  # Initialize.
    internal_date = yh_ticker._expirations[expiration_date_str]
    options = yh_ticker._download_options(internal_date)
    return options.get('calls')


def get_now():
    return timezone.localtime()


def get_now_date():
    return timezone.localdate()


def timestamp_to_datetime_with_default_tz(timestamp):
    return make_aware(datetime.fromtimestamp(timestamp), get_default_timezone())


# TODO: we may want to change to open market days.
# TODO: handle holidays.
def days_from_timestamp(timestamp):
    input_datetime = make_aware(datetime.fromtimestamp(timestamp), get_default_timezone())
    now = get_now()
    delta = input_datetime - now
    return delta.days + 1


def timedelta_from_timestamp(timestamp):
    input_datetime = make_aware(datetime.fromtimestamp(timestamp), get_default_timezone())
    now = get_now()
    return input_datetime - now


def generate_code(referral_class):
    def _generate_code():
        t = "abcdefghijkmnopqrstuvwwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ1234567890"
        return "".join([random.choice(t) for i in range(8)])

    code = _generate_code()
    while referral_class.objects.filter(code=code).exists():
        code = _generate_code()
    return code


# Check if the market's open for a given day using pandas_market_calendars
def is_market_open(input_date):
    # Get the market calendar for one week before and after (two weeks total)
    nyse = mcal.get_calendar('NYSE')
    pre_week = input_date - timedelta(days=7)
    post_week = input_date + timedelta(days=7)
    calendar = nyse.schedule(start_date=pre_week.isoformat(),
                             end_date=post_week.isoformat())

    # Build a custom time to check if the market is open ('input_date' noon eastern)
    cust_time = time(hour=12, minute=0, second=0)
    check_time = datetime.combine(input_date, cust_time)
    eastern = pytz.timezone('US/Eastern')
    final_dt = eastern.localize(check_time, is_dst=None)

    # Check if open, returns True if it is, False if not.
    is_open = nyse.open_at_time(calendar, final_dt)
    return is_open


def get_dates_till_expiration(expiration, num_days):
    days_till_expiration = days_from_timestamp(expiration)
    today = get_now().date()

    # limit number of days as num_days using np
    if num_days >= days_till_expiration:
        days_delta = range(days_till_expiration)
    else:
        days_delta = np.linspace(0, days_till_expiration-1, num_days).tolist()
        days_delta = [int(ii) for ii in days_delta]

    calculation_dates = [today + timedelta(days=i) for i in days_delta]

    return calculation_dates


if __name__ == "__main__":
    import os
    import sys
    import django

    sys.path.append("/usr/src/app/")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_apps.settings')
    django.setup()

    print(days_from_timestamp(1605225600))

    print(timedelta_from_timestamp(1603466039).total_seconds())
