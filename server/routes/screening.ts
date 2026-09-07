// Screening routes (PHQ-9 / GAD-7 submission and history).

import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/connection.js';
import { guestAuth } from '../middleware/guestAuth.js';
import type { ScreeningRequestBody, ScreeningResultRecord, ScreeningType } from '../types.js';

const router = Router();

const SCREENING_TYPES: readonly ScreeningType[] = ['phq9', 'gad7'];

/** Shape returned to the client for a single stored screening. */
interface ScreeningResponse {
  id: string;
  guestId: string;
  type: ScreeningType;
  score: number;
  maxScore: number;
  severityLevel: string;
  answers: Record<string, number> | null;
  crisisTriggered: boolean;
  createdAt: string;
}

function isScreeningType(value: unknown): value is ScreeningType {
  return typeof value === 'string' && SCREENING_TYPES.includes(value as ScreeningType);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Returns the first validation problem found, or null when the body is usable. */
function validateBody(body: Partial<ScreeningRequestBody>): string | null {
  if (!isScreeningType(body.type)) {
    return "Field 'type' must be one of: phq9, gad7.";
  }
  if (!isFiniteNumber(body.score) || body.score < 0) {
    return "Field 'score' must be a number greater than or equal to 0.";
  }
  if (!isFiniteNumber(body.maxScore) || body.maxScore <= 0) {
    return "Field 'maxScore' must be a number greater than 0.";
  }
  if (typeof body.severityLevel !== 'string' || body.severityLevel.trim() === '') {
    return "Field 'severityLevel' must be a non-empty string.";
  }
  if (!isPlainObject(body.answers)) {
    return "Field 'answers' must be an object.";
  }
  for (const value of Object.values(body.answers)) {
    if (!isFiniteNumber(value)) {
      return "Each value in 'answers' must be a finite number.";
    }
  }
  return null;
}

/** Answers are stored as JSON text; tolerate legacy/corrupt rows on read. */
function parseAnswers(answersJson: string | null): Record<string, number> | null {
  if (!answersJson) return null;
  try {
    const parsed: unknown = JSON.parse(answersJson);
    return isPlainObject(parsed) ? (parsed as Record<string, number>) : null;
  } catch {
    return null;
  }
}

function toResponse(row: ScreeningResultRecord): ScreeningResponse {
  return {
    id: row.id,
    guestId: row.guest_id,
    type: row.screening_type,
    score: row.total_score,
    maxScore: row.max_score,
    severityLevel: row.severity_band,
    answers: parseAnswers(row.answers_json),
    crisisTriggered: row.is_crisis_flagged === 1,
    createdAt: row.created_at,
  };
}

/** POST /api/screening — stores one completed PHQ-9 / GAD-7 attempt. */
router.post('/', guestAuth, (req: Request, res: Response, next: NextFunction) => {
  const body = (req.body ?? {}) as Partial<ScreeningRequestBody>;

  const validationError = validateBody(body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const type = body.type as ScreeningType;
  const score = body.score as number;
  const maxScore = body.maxScore as number;
  const severityLevel = (body.severityLevel as string).trim();
  const answersJson = JSON.stringify(body.answers);
  const isCrisisFlagged = body.crisisTriggered === true ? 1 : 0;

  try {
    const id = uuidv4();
    const guestId = req.guestId as string;

    db.prepare(
      `INSERT INTO screening_results (id, guest_id, screening_type, total_score, max_score, severity_band, answers_json, is_crisis_flagged)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, guestId, type, score, maxScore, severityLevel, answersJson, isCrisisFlagged);

    // created_at is filled in by SQLite's default, so read it back.
    const stored = db
      .prepare('SELECT created_at FROM screening_results WHERE id = ?')
      .get(id) as { created_at: string } | undefined;

    res.status(201).json({
      id,
      guestId,
      type,
      score,
      maxScore,
      severityLevel,
      crisisTriggered: isCrisisFlagged === 1,
      createdAt: stored?.created_at ?? new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/screening — full screening history for the current guest, newest first. */
router.get('/', guestAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db
      .prepare('SELECT * FROM screening_results WHERE guest_id = ? ORDER BY created_at DESC')
      .all(req.guestId) as ScreeningResultRecord[];

    res.status(200).json({ results: rows.map(toResponse) });
  } catch (err) {
    next(err);
  }
});

export default router;
