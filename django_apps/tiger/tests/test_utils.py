from datetime import datetime
from unittest import mock

from django.test import TestCase
from django.utils.timezone import make_aware, get_default_timezone
from tiger.utils import get_dates_till_expiration, get_decimal_25x

MOCK_NOW_TIMESTAMP = 1609664400  # 01/03/2021


class GeneralUtilitiesTestCase(TestCase):

    @mock.patch('django.utils.timezone.now')
    def test_get_dates_till_expiration(self, mock_now):
        mock_now.return_value = make_aware(datetime.fromtimestamp(MOCK_NOW_TIMESTAMP), get_default_timezone())

        expiration = 1623196800  # 06/09/2021
        num_days = 30
        dates = get_dates_till_expiration(expiration, num_days)
        self.assertEqual(len(dates), num_days)
        self.assertEqual(dates[0].strftime('%m%d%Y'), '01032021')
        self.assertEqual(dates[-1].strftime('%m%d%Y'), '06082021')

        expiration = 1610150400  # 01/09/2021
        num_days = 30
        dates = get_dates_till_expiration(expiration, num_days)
        self.assertEqual(len(dates), 6)
        self.assertEqual(dates[0].strftime('%m%d%Y'), '01032021')
        self.assertEqual(dates[-1].strftime('%m%d%Y'), '01082021')

    def test_get_decimal_25x(self):
        self.assertEqual(get_decimal_25x(3.1), 3.0)
        self.assertEqual(get_decimal_25x(3.2), 3.25)
        self.assertEqual(get_decimal_25x(3.8), 3.75)
        self.assertEqual(get_decimal_25x(3.89), 4.0)
        self.assertEqual(get_decimal_25x(-3.1), -3.0)
        self.assertEqual(get_decimal_25x(-3.2), -3.25)
        self.assertEqual(get_decimal_25x(-3.8), -3.75)
        self.assertEqual(get_decimal_25x(-3.89), -4.0)
