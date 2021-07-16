import numpy as np

from scipy.stats import norm


# Get value at expiry of a given contract
def get_value_at_price(strike, target_price, is_call):
    if is_call:
        return max(0, target_price - strike) * 100
    else:
        return max(0, strike - target_price) * 100


# Get a normal distribution object for use elsewhere
def get_normal_dist(current_price, sigma):
    return norm(loc=current_price, scale=sigma * current_price)


# Probability of a given set of price ranges given a distribution and a list of price ranges
def probability_of_price_ranges(normal_dist, price_ranges):
    '''
    Use normal dist. To get probability of price ranges given current price and sigma.
    None can mean 0 or infinite. [(10.0, None)] means above 10, [(None, 10.0)] means below 10.
    '''

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


# Probability of a single price range
def probability_of_price_range(normal_dist, start_bound, end_bound):
    return probability_of_price_ranges(normal_dist, [(start_bound, end_bound)])[(start_bound, end_bound)]


# Probabilistic value of the contract given a distribution, price range, the strike, and the right
def prob_value_in_price_range(normal_dist, price_lower, price_upper, strike, is_call):
    # Number of measurements to take within the price range
    num_measurements = 10

    price_points = [i for i in np.linspace(price_lower, price_upper, num=num_measurements + 1, endpoint=True)]
    pranges = [(price_points[i], price_points[i + 1]) for i in range(len(price_points) - 1)]

    # Get the probabilities of the constructed ranges
    range_probs = probability_of_price_ranges(normal_dist, pranges)

    # Iterate over the price levels and their probabilities, 
    # finding the contract value at each price level, and multiplying it by the probability,
    # then adding it to the running count
    prob_weighted_value = 0
    total_prob = 0.0
    for price_pair, probability in range_probs.items():
        prob_value = probability * get_value_at_price(strike, (price_pair[0] + price_pair[0]) / 2.0, is_call)
        prob_weighted_value += prob_value
        total_prob += probability

    # We then scale the globally likely value assuming the given price range will be the only outcome
    certain_prob_weighted_value = prob_weighted_value / total_prob

    # Return both as a tuple
    return (certain_prob_weighted_value, prob_weighted_value)
