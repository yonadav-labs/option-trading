from collections import defaultdict

import QuantLib as ql
import numpy as np
import scipy.stats as si

# import tiger.core.interest_rates as ir
# rfr = ir.get_rfr('180')
INTEREST_RATE = 0.005  # Risk free interest rate.


def get_black_scholes_price(stock_price, strike, exp_years, sigma, is_call):
    '''
    :param stock_price: Current stock price.
    :param strike: Strike price.
    :param exp_years: Time to maturity in years.
    :param sigma: Volatility of underlying asset.
    :param is_call: call or put
    :return: Fair options value.
    '''
    d1 = (np.log(stock_price / strike) + (INTEREST_RATE + 0.5 * sigma ** 2) * exp_years) / (sigma * np.sqrt(exp_years))
    # d2 = (np.log(stock_price / strike) + (INTEREST_RATE - 0.5 * sigma ** 2) * exp_years) / (sigma * np.sqrt(exp_years))
    d2 = d1 - sigma * np.sqrt(exp_years)

    if is_call:
        fair_price = (stock_price * si.norm.cdf(d1, 0.0, 1.0) -
                      strike * np.exp(-INTEREST_RATE * exp_years) * si.norm.cdf(d2, 0.0, 1.0))
    else:
        fair_price = (- stock_price * si.norm.cdf(-d1, 0.0, 1.0) +
                      strike * np.exp(-INTEREST_RATE * exp_years) * si.norm.cdf(-d2, 0.0, 1.0))
    return fair_price


def get_delta(stock_price, strike, exp_years, sigma, is_call):
    '''
    :param stock_price: Current stock price.
    :param strike: Strike price.
    :param exp_years: Time to maturity in years.
    :param sigma: Volatility of underlying asset.
    :param is_call: call or put
    :return: delta.
    '''
    d1 = (np.log(stock_price / strike) + (INTEREST_RATE + 0.5 * sigma ** 2) * exp_years) / (sigma * np.sqrt(exp_years))
    if is_call:
        return si.norm.cdf(d1, 0.0, 1.0)
    else:
        return -si.norm.cdf(-d1, 0.0, 1.0)


def get_itm_probability(stock_price, strike, exp_years, sigma, is_call):
    '''
    :param stock_price: Current stock price.
    :param strike: Strike price.
    :param exp_years: Time to maturity in years.
    :param sigma: Volatility of underlying asset.
    :param is_call: call or put
    :return: probability of the contract being in the money.
    '''
    if exp_years < 0:
        return None

    d1 = (np.log(stock_price / strike) + (INTEREST_RATE + 0.5 * sigma ** 2) * exp_years) / (sigma * np.sqrt(exp_years))
    d2 = d1 - sigma * np.sqrt(exp_years)
    if is_call:
        return si.norm.cdf(d2, 0.0, 1.0)
    else:
        return si.norm.cdf(-d2, 0.0, 1.0)


def get_target_price_probability(stock_price, target_price, exp_years, sigma, aims_above):
    '''
    :param stock_price: Current stock price.
    :param target_price: Target price.
    :param exp_years: Time to maturity in years.
    :param sigma: Volatility of underlying asset.
    :param aims_above: if aims to be above the target price or below. True for bullish strategy, false for bearish.
    :return: probability of the contract being above/below the target price.
    '''
    d1 = (np.log(stock_price / target_price) + (INTEREST_RATE + 0.5 * sigma ** 2) * exp_years) \
         / (sigma * np.sqrt(exp_years))
    d2 = d1 - sigma * np.sqrt(exp_years)
    if aims_above:
        return si.norm.cdf(d2, 0.0, 1.0)
    else:
        return si.norm.cdf(-d2, 0.0, 1.0)


# Price an American Option given the expiry, date as of which to calculate the value, 
# the price of the underlying, the strike, the right (put or call), the volatility,
# continuous annualized dividend yield, and continuous annualized risk free rate.
def price_american_option(expiry_date, calculation_date, underlying_price, strike_price, option_right, volatility,
                          dividend_yield, risk_free_rate):
    # Set up the QuantLib Calendar objects
    calendar = ql.UnitedStates()
    days_in_year = ql.Actual365Fixed()
    calculation_date = ql.Date(calculation_date.day, calculation_date.month, calculation_date.year)
    expiry_date = ql.Date(expiry_date.day, expiry_date.month, expiry_date.year)

    ql.Settings.instance().evaluationDate = calculation_date

    # Set up the Payoff, Exercise, and Option objects
    if option_right == 'C':
        oright = ql.Option.Call
    else:
        oright = ql.Option.Put

    payoff = ql.PlainVanillaPayoff(oright, strike_price)
    exercise = ql.AmericanExercise(calculation_date, expiry_date)
    option = ql.VanillaOption(payoff, exercise)

    # Set up the Quote Handle for the stock given its current price
    quote_handle = ql.QuoteHandle(ql.SimpleQuote(underlying_price))

    # Set up the Yield Term Structure Handle to properly handle the risk free rate and annualization over the calendar
    rfr_ts = ql.YieldTermStructureHandle(ql.FlatForward(calculation_date, risk_free_rate, days_in_year))

    # Set up the Yield Term Structure Handle to properly handle dividend yield over the calendar
    dividend_yield_ts = ql.YieldTermStructureHandle(ql.FlatForward(calculation_date, dividend_yield, days_in_year))

    # Set up the Yield Term Structure Handle to properly handle volatility over the calendar
    vol_ts = ql.BlackVolTermStructureHandle(ql.BlackConstantVol(calculation_date, calendar, volatility, days_in_year))

    # Instantiate the BSM process
    bsm_process = ql.BlackScholesMertonProcess(
        quote_handle,
        dividend_yield_ts,
        rfr_ts,
        vol_ts
    )

    # There are various methods to price options:
    # Analytic - using Barone-Adesi-Whaley or Bjerksund-Stensland
    # Finite Differences
    # or the Binomial Method - with various binomial trees: CRR, EQP, JR, Joshi4, LR, Tian, and Trigeorgis

    # We can use binomial pricing - its quite accurate and won't use much computational power relative to the other methods.
    # We use 250 steps to ensure proper convergence.

    steps = 250
    binomial_engine = ql.BinomialVanillaEngine(bsm_process, "crr", steps)
    option.setPricingEngine(binomial_engine)

    # The option object itself contains:
    # NPV (value of the option on the given calculation date)
    # delta
    # gamma
    # theta (including per day)
    # vega
    # rho
    # itm cash probability
    # implied volatility
    # - all of which we can use for additional features.

    return option


# Returns a matrix of the value of an option for every given day, for every given price; as a dict with dt keys
def build_option_value_matrix(is_call, expiry_date, strike_price, volatility, dividend_yield, risk_free_rate,
                              calculation_dates, underlying_prices):
    # Set up the QuantLib Calendar objects
    calendar = ql.UnitedStates()
    days_in_year = ql.Actual365Fixed()
    expiry_date = ql.Date(expiry_date.day, expiry_date.month, expiry_date.year)

    # Set up the Payoff, Exercise, and Option objects
    if is_call:
        oright = ql.Option.Call
    else:
        oright = ql.Option.Put

    # Create a dict to store value per strike per date (datetime of calculation as key)
    final_matrix = defaultdict(list)

    for dt in calculation_dates:

        calculation_date = ql.Date(dt.day, dt.month, dt.year)

        ql.Settings.instance().evaluationDate = calculation_date

        payoff = ql.PlainVanillaPayoff(oright, strike_price)
        exercise = ql.AmericanExercise(calculation_date, expiry_date)
        option = ql.VanillaOption(payoff, exercise)

        # Set up the Yield Term Structure Handle to properly handle the risk free rate and annualization over the calendar
        rfr_ts = ql.YieldTermStructureHandle(ql.FlatForward(calculation_date, risk_free_rate, days_in_year))

        # Set up the Yield Term Structure Handle to properly handle dividend yield over the calendar
        dividend_yield_ts = ql.YieldTermStructureHandle(ql.FlatForward(calculation_date, dividend_yield, days_in_year))

        # Set up the Yield Term Structure Handle to properly handle volatility over the calendar
        vol_ts = ql.BlackVolTermStructureHandle(
            ql.BlackConstantVol(calculation_date, calendar, volatility, days_in_year))

        for underlying_price in underlying_prices:
            # Set up the Quote Handle for the stock given its current price
            quote_handle = ql.QuoteHandle(ql.SimpleQuote(underlying_price))

            # Instantiate the BSM process
            bsm_process = ql.BlackScholesMertonProcess(
                quote_handle,
                dividend_yield_ts,
                rfr_ts,
                vol_ts
            )

            steps = 250
            binomial_engine = ql.BinomialVanillaEngine(bsm_process, "crr", steps)
            option.setPricingEngine(binomial_engine)

            final_matrix[dt].append((underlying_price, option.NPV()))

    return final_matrix


# Returns a list of [underlying_price, value], for an option on a given date across an upper and lower range of possible underlying values on that date
def value_across_range_for_contract(is_call, expiry_date, strike_price, volatility, dividend_yield, risk_free_rate,
                                    calculation_date, underlying_prices):
    # Use option value matrix to yield the single day values
    value_matrix = build_option_value_matrix(is_call, expiry_date, strike_price, volatility, dividend_yield,
                                             risk_free_rate, [calculation_date], underlying_prices)

    # Return the list inside the return dict for the given calculation date
    return value_matrix[calculation_date]
