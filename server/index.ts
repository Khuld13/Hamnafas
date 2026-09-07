// Express app bootstrap: middleware, routes, graceful shutdown.

import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { config } from './config.js';
import { initializeDatabase } from './db/schema.js';
import { closeDb } from './db/connection.js';
import guestRouter from './routes/guest.js';
import chatRouter from './routes/chat.js';
import screeningRouter from './routes/screening.js';
import ttsRouter from './routes/tts.js';
import supportRouter from './routes/support.js';
import reportsRouter from './routes/reports.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import { runMigrations } from './db/schema.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const app = express();

// Security headers first, then CORS so preflights still receive them.
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Chat messages are short; a small cap keeps oversized payloads off the model.
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());

/**
 * Only /api/chat is limited — it is the one route that reaches a paid provider.
 * Guests are keyed by their session token so one noisy client cannot exhaust
 * the budget for everyone behind the same NAT; the IP is a fallback for
 * requests that arrive without a token.
 */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => {
    const token = req.headers['x-guest-token'];
    if (typeof token === 'string' && token.trim() !== '') {
      return token.trim();
    }
    // ipKeyGenerator normalises IPv6 into a subnet so a single client cannot
    // rotate addresses to bypass the window.
    return req.ip ? ipKeyGenerator(req.ip) : 'unknown';
  },
  message: { error: 'Too many requests. Please wait a moment before sending another message.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/chat', chatLimiter);

// Stricter rate limit for auth endpoints to prevent credential stuffing
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.ip ? ipKeyGenerator(req.ip) : 'unknown',
  message: { error: 'Too many attempts. Please wait a moment before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter, authRouter);

app.use('/api/guest', guestRouter);
app.use('/api/chat', chatRouter);
app.use('/api/screening', screeningRouter);
app.use('/api/tts', ttsRouter);
app.use('/api/support', supportRouter);
app.use('/api/reports', reportsRouter);

/** Liveness probe — deliberately unauthenticated and free of DB access. */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Must stay last, and in this order: unmatched routes, then failures.
app.use(notFoundHandler);
app.use(errorHandler);

function startServer(): void {
  initializeDatabase();
  runMigrations();

  const server = app.listen(config.port, () => {
    console.log(`\n🌿 Hamnafas backend running on http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   CORS origin: ${config.corsOrigin}`);
    console.log(`   DashScope API key: ${config.dashscopeApiKey ? '✓ configured' : '✗ missing'}\n`);
  });

  /**
   * Drains in-flight requests before releasing SQLite, so no write is cut off
   * mid-transaction. The timer is a backstop for a hung connection.
   */
  const shutdown = (signal: string): void => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(() => {
      closeDb();
      console.log('Server closed. Database connection released.');
      process.exit(0);
    });

    const forceExit = setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    // Don't let the backstop itself keep the event loop alive.
    forceExit.unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();

export default app;
