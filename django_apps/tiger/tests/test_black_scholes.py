from django.test import TestCase

from tiger.core.black_scholes import get_black_scholes_price


class TestBlackScholes(TestCase):
    def test_call(self):
        '''
          "Stock price": 132.995,
          "putCall": "CALL",
          "symbol": "AAPL_041621C116.25",
          "bid": 16.7,
          "ask": 16.85,
          "last": 16.8,
          "mark": 16.77,
          "totalVolume": 912,
          "volatility": 46.023,
          "theoreticalOptionValue": 16.812,
          "theoreticalVolatility": 29.0,
          "strikePrice": 116.25,
          "daysToExpiration": 5,
        '''
        self.assertAlmostEqual(
            get_black_scholes_price(S=132.995, K=116.25, T=5 / 365.0, r=0.01, sigma=46.023 / 100, is_call=True),
            16.774310265794)

        '''
          "putCall": "CALL",
          "symbol": "AAPL_091721C135",
          "bid": 9.6,
          "ask": 9.75,
          "last": 9.7,
          "mark": 9.68,
          "volatility": 30.033,
          "timeValue": 9.7,
          "theoreticalOptionValue": 9.675,
          "theoreticalVolatility": 29.0,
          "strikePrice": 135.0,
          "daysToExpiration": 161
          '''
        self.assertAlmostEqual(
            get_black_scholes_price(S=132.995, K=135.0, T=159 / 365.0, r=0.01, sigma=30.033 / 100, is_call=True),
            9.861857202381628)

        self.assertAlmostEqual(
            get_black_scholes_price(S=150, K=135.0, T=159 / 365.0, r=0.01, sigma=30.033 / 100, is_call=True),
            20.69021893802939)

        self.assertAlmostEqual(
            get_black_scholes_price(S=132, K=135.0, T=1 / 365.0, r=0.01, sigma=30.033 / 100, is_call=True),
            0.07234901585397502)
        '''
          "putCall": "CALL",
          "symbol": "AAPL_050721C135",
          "bid": 3.55,
          "ask": 3.7,
          "last": 3.61,
          "mark": 3.63,
          "netChange": -0.01,
          "volatility": 30.694,
          "theoreticalOptionValue": 3.625,
          "theoreticalVolatility": 29.0,
          "strikePrice": 135.0,
          "daysToExpiration": 26,
        }
        '''
        self.assertAlmostEqual(
            get_black_scholes_price(S=132.995, K=135.0, T=26 / 365.0, r=0.01, sigma=30.694 / 100, is_call=True),
            3.488043533085694)

    def test_put(self):
        '''
          "putCall": "PUT",
          "symbol": "AAL_121721P22",
          "bid": 3.4,
          "ask": 3.6,
          "last": 3.6,
          "mark": 3.5,
          "totalVolume": 612,
          "volatility": 56.586,
          "openInterest": 7718,
          "timeValue": 3.6,
          "strikePrice": 22.0,
          "daysToExpiration": 250,
        '''
        self.assertAlmostEqual(
            get_black_scholes_price(S=23.54, K=22.0, T=250 / 365.0, r=0.01, sigma=56.586 / 100, is_call=False),
            3.408610486995377)

        '''
          "putCall": "PUT",
          "symbol": "AAL_052121P22",
          "bid": 1.05,
          "ask": 1.07,
          "last": 1.06,
          "mark": 1.06,
          "volatility": 55.751,
          "openInterest": 4027,
          "timeValue": 1.06,
          "strikePrice": 22.0,
          "daysToExpiration": 40,
          '''
        self.assertAlmostEqual(
            get_black_scholes_price(S=23.54, K=22.0, T=40 / 365.0, r=0.01, sigma=55.751 / 100, is_call=False),
            1.0056141707246447)
