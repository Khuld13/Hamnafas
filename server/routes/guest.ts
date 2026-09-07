// Guest session routes (create / fetch guest identity).

import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/connection.js';
import { guestAuth } from '../middleware/guestAuth.js';
import type { GuestRecord } from '../types.js';

const router = Router();

/**
 * POST /api/guest — mints a brand new anonymous session.
 * Deliberately unauthenticated: this is how a client obtains its token.
 */
router.post('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const guestId = uuidv4();
    db.prepare('INSERT INTO guests (id) VALUES (?)').run(guestId);
    res.status(201).json({ guestId });
  } catch (err) {
    next(err);
  }
});

/** GET /api/guest — returns the profile behind the supplied x-guest-token. */
router.get('/', guestAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const guest = db
      .prepare('SELECT id, preferred_language, created_at FROM guests WHERE id = ?')
      .get(req.guestId) as GuestRecord | undefined;

    if (!guest) {
      res.status(404).json({ error: 'Session not found. Please create a new session.' });
      return;
    }

    res.status(200).json({
      guestId: guest.id,
      preferredLanguage: guest.preferred_language,
      createdAt: guest.created_at,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
