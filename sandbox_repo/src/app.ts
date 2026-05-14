import express from 'express';
import { authMiddleware } from './middleware/auth';
import { usersRouter } from './routes/users';

const app = express();
app.use(express.json());
app.use(authMiddleware);

app.use('/users', usersRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`stride listening on :${port}`);
  });
}

export { app };
