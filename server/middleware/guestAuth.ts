import type { NextFunction, Request, Response } from 'express';
import { db } from '../db/connection.js';
import { verifyToken } from '../services/authService.js';
import { v4 as uuidv4 } from 'uuid';

const GUEST_TOKEN_HEADER = 'x-guest-token';
const AUTH_COOKIE_NAME = 'hamnafas_auth';
const INVALID_SESSION_MESSAGE = 'Invalid or missing session. Please create a new session.';

/**
 * Dual-path session resolver:
 * 1. JWT cookie → authenticated user (O(1) HMAC verify, then one DB lookup for linked guest)
 * 2. X-Guest-Token header → anonymous guest (existing behavior, unchanged)
 * 3. Neither → 401
 */
export function guestAuth(req: Request, res: Response, next: NextFunction): void {
  // --- Path 1: JWT cookie (authenticated user) ---
  const jwtToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (jwtToken) {
    const payload = verifyToken(jwtToken);
    if (payload) {
      // Valid JWT — resolve the authenticated user
      const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(payload.sub) as
        | { id: string; email: string }
        | undefined;

      if (user) {
        req.userId = user.id;
        req.userEmail = user.email;
        req.isAuthenticated = true;

        // Find the guest record linked to this user
        const linkedGuest = db.prepare('SELECT id FROM guests WHERE user_id = ? LIMIT 1').get(user.id) as
          | { id: string }
          | undefined;

        if (linkedGuest) {
          req.guestId = linkedGuest.id;
        } else {
          // No linked guest yet — create one so route handlers work
          const newGuestId = uuidv4();
          db.prepare('INSERT INTO guests (id, user_id) VALUES (?, ?)').run(newGuestId, user.id);
          req.guestId = newGuestId;
        }

        next();
        return;
      }
      // User not found in DB (deleted?) — fall through to guest token check
    }
    // Invalid JWT — fall through to guest token check
  }

  // --- Path 2: X-Guest-Token header (anonymous guest — existing logic) ---
  const rawToken = req.headers[GUEST_TOKEN_HEADER];
  const token = typeof rawToken === 'string' ? rawToken.trim() : '';

  if (!token) {
    res.status(401).json({ error: INVALID_SESSION_MESSAGE });
    return;
  }

  const guest = db.prepare('SELECT id FROM guests WHERE id = ?').get(token) as
    | { id: string }
    | undefined;

  if (!guest) {
    res.status(401).json({ error: INVALID_SESSION_MESSAGE });
    return;
  }

  req.guestId = guest.id;
  next();
}

export default guestAuth;