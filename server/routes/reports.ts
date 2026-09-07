// Progress Report routes: aggregates mood, streak, and clinical screenings
// into an observational summary to share with clinicians or supporting adults.

import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { db } from '../db/connection.js';
import { guestAuth } from '../middleware/guestAuth.js';
import { generateReportSummary } from '../services/dashscope.js';
import type { ScreeningResultRecord } from '../types.js';

const router = Router();

interface ConversationMoodRow {
  id: string;
  mood: string | null;
  created_at: string;
}

/**
 * GET /api/reports/summary
 * Query params:
 * - days: number of days to analyze (default 10, max 60)
 * - streak: client streak count (optional)
 * - lang: preferred language (default roman_urdu)
 */
router.get('/summary', guestAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guestId = req.guestId as string;
    const requestedDays = parseInt(req.query.days as string, 10);
    const periodDays = Number.isFinite(requestedDays) && requestedDays > 0 ? Math.min(requestedDays, 60) : 10;
    const clientStreak = parseInt(req.query.streak as string, 10);
    const language = typeof req.query.lang === 'string' ? req.query.lang.trim() : 'roman_urdu';

    // 1. Query conversations in that window
    const conversations = db
      .prepare(
        `SELECT id, mood, created_at FROM conversations
         WHERE guest_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
         ORDER BY created_at ASC`,
      )
      .all(guestId, periodDays) as ConversationMoodRow[];

    const moodCheckIns = conversations
      .filter((c) => c.mood && c.mood.trim() !== '')
      .map((c) => ({
        mood: c.mood as string,
        date: c.created_at,
      }));

    // 2. Query clinical screenings in that window
    const screenings = db
      .prepare(
        `SELECT id, guest_id, screening_type, total_score, max_score, severity_band, answers_json, is_crisis_flagged, created_at
         FROM screening_results
         WHERE guest_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
         ORDER BY created_at ASC`,
      )
      .all(guestId, periodDays) as ScreeningResultRecord[];

    const screeningHistory = screenings.map((s) => ({
      id: s.id,
      type: s.screening_type,
      score: s.total_score,
      maxScore: s.max_score,
      severityLevel: s.severity_band,
      crisisTriggered: s.is_crisis_flagged === 1,
      createdAt: s.created_at,
    }));

    // 3. Determine streak count
    let streakCount = 0;
    if (Number.isFinite(clientStreak) && clientStreak >= 0) {
      streakCount = clientStreak;
    } else {
      // Approximate from distinct active days in database
      const activeDays = new Set<string>();
      conversations.forEach((c) => activeDays.add(c.created_at.slice(0, 10)));
      screenings.forEach((s) => activeDays.add(s.created_at.slice(0, 10)));
      streakCount = activeDays.size;
    }

    // 4. Derive basic mood trend
    let direction: 'improving' | 'stable' | 'worsening' | 'fluctuating' = 'stable';
    if (moodCheckIns.length >= 2) {
      const positiveWords = ['hopeful', 'good', 'calm', 'pur-sukoon', 'umeed', 'better'];
      const heavyWords = ['heavy', 'low', 'sad', 'overwhelmed', 'anxious', 'tired'];

      const firstHalf = moodCheckIns.slice(0, Math.floor(moodCheckIns.length / 2));
      const secondHalf = moodCheckIns.slice(Math.floor(moodCheckIns.length / 2));

      const firstHeavy = firstHalf.filter((m) => heavyWords.some((w) => m.mood.toLowerCase().includes(w))).length;
      const secondPositive = secondHalf.filter((m) => positiveWords.some((w) => m.mood.toLowerCase().includes(w))).length;
      const secondHeavy = secondHalf.filter((m) => heavyWords.some((w) => m.mood.toLowerCase().includes(w))).length;

      if (secondPositive > firstHeavy && secondHeavy <= 1) {
        direction = 'improving';
      } else if (secondHeavy > firstHeavy) {
        direction = 'worsening';
      } else {
        direction = 'stable';
      }
    }

    const moodTrend = {
      totalCheckIns: moodCheckIns.length,
      recentMoods: moodCheckIns.map((m) => m.mood),
      direction,
      history: moodCheckIns,
    };

    // 5. Generate observational AI summary
    const aiSummary = await generateReportSummary(
      {
        periodDays,
        moodCheckIns,
        streakCount,
        screenings: screeningHistory.map((s) => ({
          type: s.type,
          score: s.score,
          maxScore: s.maxScore,
          severity: s.severityLevel,
          date: s.createdAt,
        })),
      },
      language,
    );

    res.status(200).json({
      periodDays,
      moodTrend,
      streakCount,
      screeningHistory,
      aiSummary,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
