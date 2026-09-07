// Centralised 404 and error responses for the API.

import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again in a moment.';

interface ErrorResponseBody {
  error: string;
  details?: string;
}

/**
 * Pulls a client-error status off an Express/body-parser style error so that,
 * for example, an oversized payload still surfaces as 413 rather than 500.
 */
function clientErrorStatus(err: unknown): number | null {
  if (typeof err !== 'object' || err === null) {
    return null;
  }

  const candidate = err as { status?: unknown; statusCode?: unknown };
  const raw = typeof candidate.status === 'number' ? candidate.status : candidate.statusCode;

  if (typeof raw === 'number' && Number.isInteger(raw) && raw >= 400 && raw <= 499) {
    return raw;
  }

  return null;
}

/**
 * Global error handler. Keeps internal failure detail out of the response in
 * production; a guest should never see a stack trace or provider message.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[error]', err);

  if (res.headersSent) {
    return;
  }

  const body: ErrorResponseBody = { error: GENERIC_ERROR_MESSAGE };

  if (config.nodeEnv !== 'production') {
    body.details = err instanceof Error ? err.message : String(err);
  }

  res.status(clientErrorStatus(err) ?? 500).json(body);
}

/** Fallback for unmatched routes so the client always receives JSON. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export default errorHandler;
