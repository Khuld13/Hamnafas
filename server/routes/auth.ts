import { Router } from 'express';
import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { db } from '../db/connection.js';
import { hashPassword, signToken, verifyPassword, verifyToken } from '../services/authService.js';
import type { UserRecord } from '../types.js';

const router = Router();
const COOKIE_NAME = 'hamnafas_auth';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
  });
}

const migrateGuestToUser = db.transaction((currentGuestId: string, userId: string) => {
  const existingGuest = db
    .prepare('SELECT id FROM guests WHERE user_id = ? AND id != ?')
    .get(userId, currentGuestId) as { id: string } | undefined;

  if (existingGuest) {
    db.prepare('UPDATE conversations SET guest_id = ? WHERE guest_id = ?').run(
      existingGuest.id,
      currentGuestId,
    );
    db.prepare('UPDATE screening_results SET guest_id = ? WHERE guest_id = ?').run(
      existingGuest.id,
      currentGuestId,
    );
    db.prepare('DELETE FROM guests WHERE id = ?').run(currentGuestId);
  } else {
    db.prepare('UPDATE guests SET user_id = ? WHERE id = ? AND user_id IS NULL').run(
      userId,
      currentGuestId,
    );
  }
});

function isSqliteConstraintError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('code' in err)) {
    return false;
  }

  const code = (err as { code?: unknown }).code;
  return typeof code === 'string' && code.startsWith('SQLITE_CONSTRAINT');
}

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!EMAIL_PATTERN.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    const userId = uuidv4();
    const passwordHash = await hashPassword(password);

    try {
      db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(
        userId,
        email,
        passwordHash,
      );
    } catch (err) {
      if (isSqliteConstraintError(err)) {
        res.status(409).json({ error: 'An account with this email already exists.' });
        return;
      }
      throw err;
    }

    const guestId = req.get('X-Guest-Token');
    if (guestId) {
      migrateGuestToUser(guestId, userId);
    }

    const token = signToken(userId);
    setAuthCookie(res, token);
    res.status(201).json({ userId, email });
  } catch (err) {
    console.error('[auth] signup error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400).json({ error: 'Please enter both your email and password.' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
      | UserRecord
      | undefined;

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const guestId = req.get('X-Guest-Token');
    if (guestId) {
      migrateGuestToUser(guestId, user.id);
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.status(200).json({ userId: user.id, email: user.email });
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  try {
    clearAuthCookie(res);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[auth] logout error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.get('/me', (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined;

    if (!token) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub) as
      | UserRecord
      | undefined;

    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    res.status(200).json({ userId: user.id, email: user.email });
  } catch (err) {
    console.error('[auth] me error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
