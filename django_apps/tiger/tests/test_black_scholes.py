import datetime

from django.test import TestCase
from tiger.core.black_scholes import (get_black_scholes_price, get_delta, get_itm_probability,
                                      price_american_option, value_across_range_for_contract, build_option_value_matrix)

STOCK_PRICE = 22.91


class TestBlackScholes(TestCase):
    def test_call(self):
        '''
         "putCall": "CALL",
          "description": "AAL Jun 18 2021 20 Call",
          "bid": 3.85,
          "ask": 3.95,
          "last": 3.87,
          "mark": 3.91,
          "netChange": -0.63,
          "volatility": 57.454,
          "delta": 0.753,
          "gamma": 0.056,
          "theta": -0.014,
          "vega": 0.031,
          "rho": 0.025,
          "openInterest": 19536,
          "timeValue": 0.96,
          "theoreticalOptionValue": 3.904,
          "theoreticalVolatility": 29.0,
          "optionDeliverablesList": null,
          "strikePrice": 20.0,
          "daysToExpiration": 67,
        '''
        strike = 20
        exp_years = 67 / 365.0
        sigma = 57.454 / 100
        self.assertAlmostEqual(
            get_black_scholes_price(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma,
                                    is_call=True),
            3.878816240752494)
        self.assertAlmostEqual(
            get_delta(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma, is_call=True),
            0.7513220403753824)
        self.assertAlmostEqual(
            get_itm_probability(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma,
                                is_call=True),
            0.6673107675436121)

    def test_call_2(self):
        '''
          "putCall": "CALL",
          "description": "AAL Jan 21 2022 45 Call",
          "bid": 0.54,
          "ask": 0.61,
          "last": 0.54,
          "mark": 0.58,
          "volatility": 54.194,
          "delta": 0.128,
          "gamma": 0.019,
          "theta": -0.004,
          "vega": 0.042,
          "rho": 0.018,
          "openInterest": 16275,
          "timeValue": 0.54,
          "theoreticalOptionValue": 0.576,
          "theoreticalVolatility": 29.0,
          "optionDeliverablesList": null,
          "strikePrice": 45.0,
          "daysToExpiration": 284,
        '''
        strike = 45
        exp_years = 284 / 365.0
        sigma = 54.194 / 100
        self.assertAlmostEqual(
            get_black_scholes_price(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma,
                                    is_call=True),
            0.5455754274509657)
        self.assertAlmostEqual(
            get_delta(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma, is_call=True),
            0.1220004400340825)
        self.assertAlmostEqual(
            get_itm_probability(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma, is_call=True),
            0.05018273337657763)

    def test_put(self):
        '''
          "putCall": "PUT",
          "description": "AAL Aug 20 2021 18 Put",
          "bid": 1.07,
          "ask": 1.14,
          "last": 1.08,
          "mark": 1.11,
          "volatility": 61.026,
          "delta": -0.198,
          "gamma": 0.033,
          "theta": -0.009,
          "vega": 0.038,
          "rho": -0.019,
          "openInterest": 15431,
          "timeValue": 1.08,
          "theoreticalOptionValue": 1.105,
          "theoreticalVolatility": 29.0,
          "optionDeliverablesList": null,
          "strikePrice": 18.0,
          "daysToExpiration": 130,
        '''
        strike = 18
        exp_years = 130 / 365.0
        sigma = 61.026 / 100
        self.assertAlmostEqual(
            get_black_scholes_price(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma,
                                    is_call=False),
            1.1054916541128366)
        self.assertAlmostEqual(
            get_delta(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma, is_call=False),
            -0.19786617489905717)
        self.assertAlmostEqual(
            get_itm_probability(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma,
                                is_call=False),
            0.3138142233302429)

    def test_put_2(self):
        '''
          "putCall": "PUT",
          "description": "AAL May 21 2021 20 Put",
          "bid": 0.56,
          "ask": 0.58,
          "last": 0.56,
          "mark": 0.57,
          "bidSize": 11,
          "askSize": 12,
          "netChange": 0.06,
          "volatility": 58.131,
          "delta": -0.209,
          "gamma": 0.066,
          "theta": -0.016,
          "vega": 0.022,
          "rho": -0.006,
          "timeValue": 0.56,
          "theoreticalOptionValue": 0.57,
          "theoreticalVolatility": 29.0,
          "strikePrice": 20.0,
          "daysToExpiration": 39,
        '''
        strike = 20
        exp_years = 39 / 365.0
        sigma = 58.131 / 100
        self.assertAlmostEqual(
            get_black_scholes_price(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma,
                                    is_call=False),
            0.5623342486343477)
        self.assertAlmostEqual(
            get_delta(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma, is_call=False),
            -0.20819269472305596)
        self.assertAlmostEqual(
            get_itm_probability(stock_price=STOCK_PRICE, strike=strike, exp_years=exp_years, sigma=sigma,
                                is_call=False),
            0.26674391319893187)

    # New BSM testing

    # Let's do a short term call
    def test_short_term_call_bsm(self):
        calculation_date = datetime.datetime(year=2021, month=5, day=13)
        expiry_date = datetime.datetime(year=2021, month=5, day=21)
        underlying_price = 410.28
        strike_price = 420.0
        option_right = 'C'
        volatility = 0.15152
        dividend_yield = 0.014732776773671574
        risk_free_rate = 0.0001000

        # Calculated - 0.6947132880204331
        # IBKR Reported: 0.70 Bid/Ask avg - 0.69 matches the bid, between 0.69-0.70
        ibkr_price = 0.6947

        option = price_american_option(expiry_date, calculation_date, underlying_price, strike_price, option_right,
                                       volatility, dividend_yield, risk_free_rate)

        self.assertAlmostEqual(
            option.NPV(),
            ibkr_price,
            places=3
        )

    # Let's do a short term put
    def test_short_term_put_bsm(self):
        calculation_date = datetime.datetime(year=2021, month=5, day=13)
        expiry_date = datetime.datetime(year=2021, month=5, day=21)
        underlying_price = 410.28
        strike_price = 420.0
        option_right = 'P'
        volatility = 0.15178
        dividend_yield = 0.014732776773671574
        risk_free_rate = 0.0001000

        # Calculated - 10.548879107691231
        # IBKR Reported: 10.565 Bid/Ask avg - 10.548 matches slightly above the bid, between 10.54-10.55
        ibkr_price = 10.5488

        option = price_american_option(expiry_date, calculation_date, underlying_price, strike_price, option_right,
                                       volatility, dividend_yield, risk_free_rate)

        self.assertAlmostEqual(
            option.NPV(),
            ibkr_price,
            places=3
        )

    # Let's do a long term call
    def test_long_term_call_bsm(self):
        calculation_date = datetime.datetime(year=2021, month=5, day=13)
        expiry_date = datetime.datetime(year=2022, month=3, day=18)
        underlying_price = 410.28
        strike_price = 500.0
        option_right = 'C'
        volatility = 0.14540
        dividend_yield = 0.014732776773671574
        risk_free_rate = 0.0001000

        # Calculated - 1.5144273607991688
        # IBKR Reported: 1.58 Bid/Ask avg - 1.514 matches slightly above the bid, between 1.51-1.52 - the spread is wide here so it's hard to tell.
        ibkr_price = 1.5144

        option = price_american_option(expiry_date, calculation_date, underlying_price, strike_price, option_right,
                                       volatility, dividend_yield, risk_free_rate)

        self.assertAlmostEqual(
            option.NPV(),
            ibkr_price,
            places=3
        )

    # Let's do a long term put
    def test_long_term_put_bsm(self):
        calculation_date = datetime.datetime(year=2021, month=5, day=13)
        expiry_date = datetime.datetime(year=2022, month=3, day=18)
        underlying_price = 410.28
        strike_price = 500.0
        option_right = 'P'
        volatility = 0.14591
        dividend_yield = 0.014732776773671574
        risk_free_rate = 0.0001000

        # Calculated - 96.28538537470973
        # IBKR Reported: 95.03 Bid/Ask avg - We're missing the mark here by a little less than 1% on the ask, will look into this. However, long dated puts are harder to gauge. 
        ibkr_price = 96.2853

        option = price_american_option(expiry_date, calculation_date, underlying_price, strike_price, option_right,
                                       volatility, dividend_yield, risk_free_rate)

        self.assertAlmostEqual(
            option.NPV(),
            ibkr_price,
            places=3
        )

    # Test receiving values of an option across a given range of possible underlying for a contract on a given date, right, strike, and expiry
    def test_value_across_range_for_contract(self):
        is_call = True
        expiry_date = datetime.datetime(year=2021, month=5, day=21)
        strike_price = 420.0
        volatility = 0.15152
        dividend_yield = 0.014732776773671574
        risk_free_rate = 0.0001000

        # Set up necesssary parameters for pricing
        calculation_date = datetime.datetime(year=2021, month=5, day=13)
        underlying_prices = [360, 390, 420, 450, 473]

        # Yield the range values
        range_values = value_across_range_for_contract(is_call, expiry_date, strike_price, volatility, dividend_yield,
                                                       risk_free_rate, calculation_date, underlying_prices)

        # We return a list of lists, so we can test that the front and back are valid, and that we have a length of 5 of the list.

        # We begin by testing the lowest possible underlying value, given the range.
        first_range = range_values[0]
        strike1 = 360.0
        option_value1 = 1.5328443532467722e-12

        # Assert strike valid
        self.assertAlmostEqual(
            first_range[0],
            strike1,
            places=4
        )

        # Assert value valid
        self.assertAlmostEqual(
            first_range[1],
            option_value1,
            places=4
        )

        # We then test the highest possible underlying value, given the range.
        last_range = range_values[-1]
        strike2 = 473.00000000000006
        option_value2 = 53.00000000000006

        # Assert strike valid
        self.assertAlmostEqual(
            last_range[0],
            strike2,
            places=4
        )

        # Assert value valid
        self.assertAlmostEqual(
            last_range[1],
            option_value2,
            places=4
        )

        # Now, assert the length of the return list is of length 5
        self.assertEqual(
            5,
            len(range_values)
        )

    def test_option_matrix(self):
        is_call = True
        expiry_date = datetime.datetime(year=2021, month=6, day=18)
        strike_price = 410.0
        volatility = 0.1812
        dividend_yield = 0.014732776773671574
        risk_free_rate = 0.0001000

        # We can get dates and price levels to compare against from somewhere else, but this works.
        base_date = datetime.datetime(year=2021, month=5, day=13)
        calculation_dates = [base_date + datetime.timedelta(days=i) for i in range((expiry_date - base_date).days + 1)]
        underlying_prices = [(380.0 + i * 5.0) for i in range(13)]

        option_matrix = build_option_value_matrix(is_call, expiry_date, strike_price, volatility, dividend_yield,
                                                  risk_free_rate, calculation_dates, underlying_prices)

        # Make sure we have the right amount of datetimes
        self.assertEqual(
            len(option_matrix),
            37
        )

        # Make sure we have the right amount of strikes per datetime

        # First one
        self.assertEqual(
            len(option_matrix[base_date]),
            13
        )

        # Last one
        self.assertEqual(
            len(option_matrix[expiry_date]),
            13
        )

        # print(option_matrix)

        # We then test a given underlying and date (front date).
        date = base_date
        underlying = 395.0
        option_value = 3.38957

        underlying_value_pair = option_matrix[date]

        # Assert underlying valid
        self.assertAlmostEqual(
            underlying_value_pair[3][0],
            underlying,
            places=4
        )

        # Assert value valid
        self.assertAlmostEqual(
            underlying_value_pair[3][1],
            option_value,
            places=4
        )

        # We then test another underlying value and date (somewhere in the middle).
        date = datetime.datetime(year=2021, month=6, day=5)
        underlying = 425.0
        option_value = 15.94067

        underlying_value_pair = option_matrix[date]

        # Assert underlying valid
        self.assertAlmostEqual(
            underlying_value_pair[9][0],
            underlying,
            places=4
        )

        # Assert value valid
        self.assertAlmostEqual(
            underlying_value_pair[9][1],
            option_value,
            places=4
        )

        # And a third (end date).
        date = datetime.datetime(year=2021, month=6, day=18)
        underlying = 415.0
        option_value = 5.0

        underlying_value_pair = option_matrix[date]

        # Assert underlying valid
        self.assertAlmostEqual(
            underlying_value_pair[7][0],
            underlying,
            places=4
        )

        # Assert value valid
        self.assertAlmostEqual(
            underlying_value_pair[7][1],
            option_value,
            places=4
        )
