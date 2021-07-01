from scipy.stats import norm


def probability_of_price_ranges(current_price, sigma, price_ranges):
    '''
    Use normal dist. To get probability of price ranges given current price and sigma.
    None can mean 0 or infinite. [(10.0, None)] means above 10, [(None, 10.0)] means below 10.
    '''
    # Build normal dist
    normal_dist = norm(loc=current_price, scale=sigma * current_price)

    # Dict to store results in, k-v/ price range tuple - probability
    prob_dict = {}

    # For each range, get the cdf of both and subtract to find the total percentage.
    for prange in price_ranges:
        start, end = prange
        start_cdf = normal_dist.cdf(start if start is not None else 0)
        end_cdf = normal_dist.cdf(end) if end is not None else 1

        # Scale final by discarding the amount below 0
        prob_dict[prange] = (end_cdf - start_cdf) / (1 - normal_dist.cdf(0))

    return prob_dict


def probability_of_price_range(current_price, sigma, start_bound, end_bound):
    return probability_of_price_ranges(current_price, sigma, [(start_bound, end_bound)])[(start_bound, end_bound)]
