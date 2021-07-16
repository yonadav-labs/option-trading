from django.test import TestCase

from tiger.core.probability import probability_of_price_ranges, probability_of_price_range, get_normal_dist, \
    prob_value_in_price_range


class TestProbability(TestCase):

    # Validate probabilities of prices between certain ranges
    def test_price_range_probability(self):
        price = 100
        sigma = 0.2
        price_ranges = [
            (80, 120),
            (60, 90),
            (0, 200),
            (80, None),
            (None, 80),
            (90, None),
            (None, 90)
        ]

        # Get our dist
        normal_dist = get_normal_dist(price, sigma)

        # Fetch the probabilities of the price ranges
        range_probs = probability_of_price_ranges(normal_dist, price_ranges)

        # Should be majority in the middle
        self.assertEqual(
            range_probs[(80, 120)],
            0.6826894921370859
        )

        # Should be lower on the tail end
        self.assertEqual(
            range_probs[(60, 90)],
            0.2857874067778077
        )

        # Should be virtually 100% from 0-200
        self.assertEqual(
            range_probs[(0, 200)],
            0.9999994266968562
        )

        # Above 80
        self.assertEqual(
            range_probs[(80, None)],
            0.8413447460685429
        )

        # Below 80
        self.assertEqual(
            range_probs[(None, 80)],
            0.15865525393145707
        )

        # Above 90
        self.assertEqual(
            range_probs[(90, None)],
            0.6914624612740131
        )

        # Below 90
        self.assertEqual(
            range_probs[(None, 90)],
            0.3085375387259869
        )

    def test_price_range_probability(self):
        # Handles sigma > current_price where the lowest possible price is 0.

        # Price and sigma for the dist
        price = 100
        sigma = 2.0

        # Get our dist
        normal_dist = get_normal_dist(price, sigma)

        self.assertEqual(
            probability_of_price_range(normal_dist=normal_dist, start_bound=0, end_bound=100),
            0.276894946576341
        )

        self.assertEqual(
            probability_of_price_range(normal_dist=normal_dist, start_bound=None, end_bound=100),
            0.276894946576341
        )

    # Test the theoretical probability-weighted value of a contract within a price range,
    # assuming either the global probability of the price range, 
    # or assuming that the given price range is certain.
    def test_probable_value_in_price_range(self):
        # Price and sigma for the dist
        price = 100
        sigma = 0.2

        # Target price bounds
        lower_target_price = 105.0
        upper_target_price = 115.0

        # Contract details
        strike = 110.0
        is_call = True

        # Fetch the normal distribution according to these parameters
        normal_dist = get_normal_dist(price, sigma)

        # Fetch the certain and global probability weighted values
        range_certain, range_global = prob_value_in_price_range(
            normal_dist,
            lower_target_price,
            upper_target_price,
            strike,
            is_call
        )

        # Verify the certain and global values

        self.assertAlmostEqual(
            range_certain,
            90.86649120270334
        )

        self.assertAlmostEqual(
            range_global,
            15.871320355527391
        )
