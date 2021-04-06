import datetime

import requests

from django.conf import settings
from django.core.management.base import BaseCommand

from tiger.models import MarketDate


class Command(BaseCommand):
    help = 'Fetch market data from IEX Cloud'

    def __init__(self):
        self.date_type = 'holiday'
        self.number_of_days = 40  # all available future days (about 4 years)
        self.params = {
            'token': settings.IEXCLOUD_TOKEN
        }

    def fetch_market_dates(self):
        url = f'{settings.IEXCLOUD_BASE_URL}/ref-data/us/dates/{self.date_type}/next/{self.number_of_days}'
        resp = requests.get(url, params=self.params)

        if resp.ok:
            date_responses = resp.json()
            for date_response in date_responses:
                MarketDate.objects.update_or_create(date=date_response['date'], type=self.date_type)

        print('Market dates fetched.')

    def handle(self, *args, **options):
        self.fetch_market_dates()
