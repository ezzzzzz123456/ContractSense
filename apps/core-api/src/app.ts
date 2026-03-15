import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import contractsRouter from './routes/contracts';
import marketplaceRouter from './routes/marketplace';
import paymentsRouter from './routes/payments';
import adminRouter from './routes/admin';

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost').split(','),
    credentials: true,
  })
);

// ─── Utilities ───────────────────────────────────────────────────────────────
app.use(compression());
app.use(morgan('combined'));

// ─── Body Parsing ────────────────────────────────────────────────────────────
// Raw body for Stripe webhook must be registered BEFORE json middleware
app.use('/api/core/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/core/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'core-api', version: '1.0.0' }, error: null, meta: { timestamp: new Date().toISOString(), requestId: 'health' } });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/core/auth', authRouter);
app.use('/api/core/contracts', contractsRouter);
app.use('/api/core/marketplace', marketplaceRouter);
app.use('/api/core/payments', paymentsRouter);
app.use('/api/core/admin', adminRouter);

// ─── Error Handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

export { app };
