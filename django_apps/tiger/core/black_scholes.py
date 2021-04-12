import numpy as np
import scipy.stats as si


def get_black_scholes_price(S, K, T, r, sigma, is_call):
    '''
    :param S: Current stock price.
    :param K: Strike price.
    :param T: Time to maturity in years.
    :param r: Risk free interest rate.
    :param sigma: Volatility of underlying asset.
    :param is_call: call or put
    :return: Fair options value.
    '''

    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = (np.log(S / K) + (r - 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))

    if is_call:
        fair_price = (S * si.norm.cdf(d1, 0.0, 1.0) - K * np.exp(-r * T) * si.norm.cdf(d2, 0.0, 1.0))
    else:
        fair_price = (K * np.exp(-r * T) * si.norm.cdf(-d2, 0.0, 1.0) - S * si.norm.cdf(-d1, 0.0, 1.0))
    return fair_price
