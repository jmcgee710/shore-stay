import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js';
import renterRouter from './routes/renter.js';
import homeownerRouter from './routes/homeowner.js';
import watcherRouter from './routes/watcher.js';
import complianceRouter from './routes/compliance.js';
import publicRouter from './routes/public.js';
import teamRouter from './routes/team.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/renter', renterRouter);
app.use('/api/homeowner', homeownerRouter);
app.use('/api/watcher', watcherRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/public', publicRouter);
app.use('/api/team', teamRouter);
app.use('/api', apiRouter);

// Dev-only seed route. Mounted only when NOT production AND ALLOW_SEED is set.
// Both checks are required so an accidental NODE_ENV flip in Vercel can't expose it.
if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_SEED === 'true') {
  const { default: devRouter } = await import('./routes/dev.js');
  app.use('/api/dev', devRouter);
}

app.get('/', (_req, res) => {
  res.json({ status: 'Shore Stay API is running' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
  });
}

export default app;
