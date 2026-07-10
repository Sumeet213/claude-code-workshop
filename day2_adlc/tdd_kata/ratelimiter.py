"""Fixed-window rate limiter. The spec lives in test_ratelimiter.py —
implement until `python3 -m unittest` passes. Do not edit the tests."""

import time


class RateLimiter:
    def __init__(self, limit: int, window_seconds: float, now=time.monotonic):
        raise NotImplementedError("not implemented")

    def allow(self, client_id: str) -> bool:
        """Return True if the request is allowed."""
        raise NotImplementedError("not implemented")
