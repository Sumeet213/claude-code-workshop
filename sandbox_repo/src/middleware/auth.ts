import type { Request, Response, NextFunction } from 'express';

// DEPRECATED — TOKEN_CACHE is the legacy local-cache path.
// New code should use SessionStore (src/services/SessionStore.ts).
// We have NOT yet migrated all callers, so this export stays.
export const TOKEN_CACHE = new Map<string, { userId: string; expiresAt: number }>();

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'missing token' });

  const entry = TOKEN_CACHE.get(token);
  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }

  (req as Request & { userId: string }).userId = entry.userId;
  return next();
}
