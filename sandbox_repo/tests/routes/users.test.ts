import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { TOKEN_CACHE } from '../../src/middleware/auth';

describe('GET /users/:id', () => {
  it('returns the user when the token is valid', async () => {
    TOKEN_CACHE.set('tok-test', { userId: 'u1', expiresAt: Date.now() + 60000 });

    const res = await request(app)
      .get('/users/u1')
      .set('Authorization', 'Bearer tok-test');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'u1', name: 'Alex' });
  });
});
