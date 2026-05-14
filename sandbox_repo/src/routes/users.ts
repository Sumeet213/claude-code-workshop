import { Router } from 'express';

export const usersRouter = Router();

usersRouter.get('/:id', (req, res) => {
  // Pretend we look up a user.
  return res.json({ id: req.params.id, name: 'Alex' });
});

usersRouter.delete('/:id', (req, res) => {
  // Soft-delete via the soft_deleted_at column added in migration 0042.
  // (Implementation omitted for the sandbox.)
  return res.status(204).end();
});
