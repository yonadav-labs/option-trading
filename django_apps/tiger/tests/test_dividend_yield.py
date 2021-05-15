from django.test import TestCase

from tiger.core.dividend_yield import get_implied_yield, get_realized_div_yield, get_div_yield


class TestDividendYields(TestCase):
    def setUp(self):
        self.current_price = 57.92
        self.past_12 = 2.4975
        self.next_div = 0.6275
        self.divs_per_year = 4
        self.next_12 = 2.51
        self.rfr = 0.01000

    def test_implied_yield(self):
        '''
         We can test the implied dividend yield calculations here.
         Given that:
            * the average 30-day annualized risk free rate is 0.01000%.
            * we have 4 dividends a year. 
            * we have $57.92 as the current price of the underlying.
            * we have the next upcoming dividend with an amount of $0.6275.
         We would expect that the implied dividend yield would be 0.044752, or 4.475%.
         We round to 6 decimals else we fail almostEquals due to a 10^-7 error.
        '''

        expected_yield = 0.044752
        self.assertAlmostEqual(get_implied_yield(self.rfr, self.divs_per_year, self.current_price, self.next_div),
                               expected_yield, 6)

    def test_realized_yield(self):
        '''
         We can test the realized dividend yield calculations here.
         Given that:
            * the past twelve months of dividends are $2.4975.
            * we have $57.92 as the current price of the underlying. 
         We would expect that the realized dividend yield would be 0.042216, or 4.222%.
         We round to 6 decimals else we fail almostEquals due to a 10^-7 error.
        '''

        expected_yield = 0.042216
        self.assertAlmostEqual(get_realized_div_yield(self.past_12, self.current_price), expected_yield, 6)

    def test_both_dividend_yields(self):
        '''
        We can test the entire call for both dividend yield calculations here.
        Given that:
            * the average 30-day annualized risk free rate is 0.01000%.
            * we have 4 dividends a year. 
            * we have $57.92 as the current price of the underlying.
            * we have the next upcoming dividend with an amount of $0.6275.
            * the past twelve months of dividends are $2.4975.
        We would expect that the realized dividend yield would be 0.042216, or 4.222%, and
        that the implied dividend yield would be 0.043584, or 4.358%.
        We round to 6 decimals else we fail almostEquals due to a 10^-7 error.
        '''

        div_yields = get_div_yield(self.past_12, self.next_div, self.divs_per_year, self.current_price, self.rfr)

        # Assert the return of the call gives us both, since it's a list of [realized, implied] div yields.
        self.assertEqual(len(div_yields), 2)

        # Assert the returned realized matches the expected realized (first element in returned list).
        expected_realized_yield = 0.042216
        self.assertAlmostEqual(div_yields[0], expected_realized_yield, 6)

        # Assert the returned implied matches the expected implied (second element in returned list).
        expected_implied_yield = 0.044752
        self.assertAlmostEqual(div_yields[1], expected_implied_yield, 6)
