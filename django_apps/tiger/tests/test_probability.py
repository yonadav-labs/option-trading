from django.test import TestCase

from tiger.core.probability import probability_of_price_ranges, probability_of_price_range


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

        # Fetch the probabilities of the price ranges
        range_probs = probability_of_price_ranges(price, sigma, price_ranges)

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
        self.assertEqual(
            probability_of_price_range(current_price=100, sigma=2.0, start_bound=0, end_bound=100),
            0.19146246127401312
        )
        self.assertEqual(
            probability_of_price_range(current_price=100, sigma=2.0, start_bound=None, end_bound=100),
            0.19146246127401312
        )
