# from django.test import TestCase
#
# from tiger.core.interest_rates import get_rfr, annualize_daily_rate
#
#
# class TestInterestRates(TestCase):
#     def test_annualization(self):
#         '''
#          We can test annualization here.
#          Assume the average 30-day rate is 0.01000.
#          We would expect that the annualized rate would be equivalent to:
#          0.010000498623696785
#         '''
#         rate = 0.01000
#         expected_rate = 0.010000498623696785
#         self.assertAlmostEqual(
#             annualize_daily_rate(rate),
#             expected_rate
#         )
#
#     def test_sofr_fetch(self):
#         '''
#          We can test fetching the risk free rate here.
#          We would expect that a value exists and that it returns a float.
#         '''
#         duration = '30'
#         self.assertIsInstance(
#             get_rfr(duration),
#             float
#         )