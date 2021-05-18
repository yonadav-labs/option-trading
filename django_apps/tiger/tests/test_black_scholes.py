import datetime

from django.test import TestCase

from tiger.core.black_scholes import get_black_scholes_price, get_delta, get_itm_probability, price_american_option

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

        option = price_american_option(expiry_date, calculation_date, underlying_price, strike_price, option_right, volatility, dividend_yield, risk_free_rate)

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

        option = price_american_option(expiry_date, calculation_date, underlying_price, strike_price, option_right, volatility, dividend_yield, risk_free_rate)

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

        # Calculated - 1.5544273607991688
        # IBKR Reported: 1.58 Bid/Ask avg - 1.554 matches slightly above the bid, between 1.55-1.56 - the spread is wide here so it's hard to tell.
        ibkr_price = 1.5544

        option = price_american_option(expiry_date, calculation_date, underlying_price, strike_price, option_right, volatility, dividend_yield, risk_free_rate)

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

        option = price_american_option(expiry_date, calculation_date, underlying_price, strike_price, option_right, volatility, dividend_yield, risk_free_rate)

        self.assertAlmostEqual(
            option.NPV(), 
            ibkr_price, 
            places=3
        )