import numpy as np
import scipy.stats as si

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
