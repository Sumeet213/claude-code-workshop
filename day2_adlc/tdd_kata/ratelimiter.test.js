'use strict';

// THE SPEC. This file is read-only during the kata — the implementation
// must bend to the tests, never the other way around.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { RateLimiter } = require('./ratelimiter');

function makeClock(start = 0) {
  let t = start;
  return {
    now: () => t,
    tick: (ms) => { t += ms; },
  };
}

test('allows up to `limit` requests inside one window', () => {
  const clock = makeClock();
  const rl = new RateLimiter({ limit: 3, windowMs: 1000, now: clock.now });
  assert.equal(rl.allow('alice'), true);
  assert.equal(rl.allow('alice'), true);
  assert.equal(rl.allow('alice'), true);
  assert.equal(rl.allow('alice'), false);
});

test('window resets after windowMs elapses', () => {
  const clock = makeClock();
  const rl = new RateLimiter({ limit: 2, windowMs: 1000, now: clock.now });
  assert.equal(rl.allow('alice'), true);
  assert.equal(rl.allow('alice'), true);
  assert.equal(rl.allow('alice'), false);
  clock.tick(1000);
  assert.equal(rl.allow('alice'), true);
});

test('clients are isolated from each other', () => {
  const clock = makeClock();
  const rl = new RateLimiter({ limit: 1, windowMs: 1000, now: clock.now });
  assert.equal(rl.allow('alice'), true);
  assert.equal(rl.allow('bob'), true);
  assert.equal(rl.allow('alice'), false);
  assert.equal(rl.allow('bob'), false);
});

test('a denied request does not consume quota', () => {
  const clock = makeClock();
  const rl = new RateLimiter({ limit: 1, windowMs: 1000, now: clock.now });
  assert.equal(rl.allow('alice'), true);
  assert.equal(rl.allow('alice'), false);
  assert.equal(rl.allow('alice'), false);
  clock.tick(1000);
  // if denials consumed quota, this would still be false
  assert.equal(rl.allow('alice'), true);
});

test('requests exactly on the window boundary belong to the new window', () => {
  const clock = makeClock(500);
  const rl = new RateLimiter({ limit: 1, windowMs: 1000, now: clock.now });
  assert.equal(rl.allow('alice'), true);
  clock.tick(999);
  assert.equal(rl.allow('alice'), false);
  clock.tick(1);
  assert.equal(rl.allow('alice'), true);
});

test('defaults `now` to Date.now when not provided', () => {
  const rl = new RateLimiter({ limit: 2, windowMs: 60_000 });
  assert.equal(rl.allow('alice'), true);
  assert.equal(rl.allow('alice'), true);
  assert.equal(rl.allow('alice'), false);
});

test('rejects invalid construction', () => {
  assert.throws(() => new RateLimiter({ limit: 0, windowMs: 1000 }));
  assert.throws(() => new RateLimiter({ limit: -1, windowMs: 1000 }));
  assert.throws(() => new RateLimiter({ limit: 5, windowMs: 0 }));
  assert.throws(() => new RateLimiter({}));
});
