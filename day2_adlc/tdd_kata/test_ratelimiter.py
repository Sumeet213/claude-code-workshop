"""THE SPEC. This file is read-only during the kata — the implementation
must bend to the tests, never the other way around.

Run:  python3 -m unittest -v
"""

import unittest

from ratelimiter import RateLimiter


class FakeClock:
    def __init__(self, start: float = 0.0):
        self.t = start

    def now(self) -> float:
        return self.t

    def tick(self, seconds: float) -> None:
        self.t += seconds


class TestRateLimiter(unittest.TestCase):
    def test_allows_up_to_limit_inside_one_window(self):
        clock = FakeClock()
        rl = RateLimiter(limit=3, window_seconds=1.0, now=clock.now)
        self.assertTrue(rl.allow("alice"))
        self.assertTrue(rl.allow("alice"))
        self.assertTrue(rl.allow("alice"))
        self.assertFalse(rl.allow("alice"))

    def test_window_resets_after_window_elapses(self):
        clock = FakeClock()
        rl = RateLimiter(limit=2, window_seconds=1.0, now=clock.now)
        self.assertTrue(rl.allow("alice"))
        self.assertTrue(rl.allow("alice"))
        self.assertFalse(rl.allow("alice"))
        clock.tick(1.0)
        self.assertTrue(rl.allow("alice"))

    def test_clients_are_isolated_from_each_other(self):
        clock = FakeClock()
        rl = RateLimiter(limit=1, window_seconds=1.0, now=clock.now)
        self.assertTrue(rl.allow("alice"))
        self.assertTrue(rl.allow("bob"))
        self.assertFalse(rl.allow("alice"))
        self.assertFalse(rl.allow("bob"))

    def test_denied_request_does_not_consume_quota(self):
        clock = FakeClock()
        rl = RateLimiter(limit=1, window_seconds=1.0, now=clock.now)
        self.assertTrue(rl.allow("alice"))
        self.assertFalse(rl.allow("alice"))
        self.assertFalse(rl.allow("alice"))
        clock.tick(1.0)
        # if denials consumed quota, this would still be False
        self.assertTrue(rl.allow("alice"))

    def test_request_exactly_on_boundary_belongs_to_new_window(self):
        clock = FakeClock(start=0.5)
        rl = RateLimiter(limit=1, window_seconds=1.0, now=clock.now)
        self.assertTrue(rl.allow("alice"))
        clock.tick(0.999)
        self.assertFalse(rl.allow("alice"))
        clock.tick(0.001)
        self.assertTrue(rl.allow("alice"))

    def test_defaults_now_to_a_real_clock_when_not_provided(self):
        rl = RateLimiter(limit=2, window_seconds=60.0)
        self.assertTrue(rl.allow("alice"))
        self.assertTrue(rl.allow("alice"))
        self.assertFalse(rl.allow("alice"))

    def test_rejects_invalid_construction(self):
        with self.assertRaises(ValueError):
            RateLimiter(limit=0, window_seconds=1.0)
        with self.assertRaises(ValueError):
            RateLimiter(limit=-1, window_seconds=1.0)
        with self.assertRaises(ValueError):
            RateLimiter(limit=5, window_seconds=0)


if __name__ == "__main__":
    unittest.main()
