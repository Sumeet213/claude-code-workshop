'use strict';

// Fixed-window rate limiter. The spec lives in ratelimiter.test.js —
// implement until `node --test` passes. Do not edit the tests.

class RateLimiter {
  /**
   * @param {{ limit: number, windowMs: number, now?: () => number }} options
   */
  constructor(options) {
    throw new Error('not implemented');
  }

  /**
   * @param {string} clientId
   * @returns {boolean} true if the request is allowed
   */
  allow(clientId) {
    throw new Error('not implemented');
  }
}

module.exports = { RateLimiter };
