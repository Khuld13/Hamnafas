// Chat routes (conversations, messages, AI replies).

import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/connection.js';
import { guestAuth } from '../middleware/guestAuth.js';
import { runCrisisCheck } from '../services/crisisDetector.js';
import { generateAIResponse } from '../services/dashscope.js';
import type {
  ChatHistoryMessage,
  ChatRequestBody,
  ChatResponseBody,
  ConversationRecord,
  MessageRecord,
  MessageRole,
} from '../types.js';

const router = Router();

const DEFAULT_LANGUAGE = 'roman_urdu';
const TITLE_MAX_LENGTH = 35;
const HISTORY_LIMIT = 20;

// Several warm variants per language so, on the rare occasion the AI truly
// can't respond after retrying, the user doesn't see the exact same flat
// "try again" line twice in a row — and it still invites them to keep going
// rather than dead-ending the conversation.
const AI_UNAVAILABLE_MESSAGES: Record<string, string[]> = {
  roman_urdu: [
    'Mera dil-o-dimaag abhi thora slow chal raha hai 💙 lekin main yahan hoon aur sun raha hoon. Ek dafa phir se batayein, jo bhi keh rahe thay?',
    'Sorry, lafz thore der ke liye adhoore reh gaye mere paas 🌱 Aap phir se bata sakte hain? Main poori tawajjo se sun raha hoon.',
    'Lagta hai abhi connection thora atak gaya 🤍 Koi baat nahi, aap dubara likh dein, main yahin hoon aapke sath.',
  ],
  urdu: [
    'میرا ذہن اس وقت تھوڑا سست چل رہا ہے 💙 لیکن میں یہاں ہوں اور سن رہا ہوں۔ ذرا دوبارہ بتائیں؟',
    'معذرت، الفاظ تھوڑی دیر کے لیے ادھورے رہ گئے 🌱 آپ دوبارہ بتا سکتے ہیں؟ میں پوری توجہ سے سن رہا ہوں۔',
  ],
  english: [
    "My words are being a little slow to find me right now 💙 but I'm right here and listening. Could you say that again?",
    "Sorry, I lost my train of thought for a second there 🌱 Want to tell me again? I'm fully here with you.",
    "Something hiccupped on my end 🤍 Nothing to worry about — go ahead and share that again, I'm listening.",
  ],
};

function pickAiUnavailableMessage(language: string): string {
  const options = AI_UNAVAILABLE_MESSAGES[language] ?? AI_UNAVAILABLE_MESSAGES[DEFAULT_LANGUAGE];
  return options[Math.floor(Math.random() * options.length)];
}

const AI_UNAVAILABLE_PROMPTS: Record<string, string[]> = {
  roman_urdu: ['Dubara koshish karein', 'Saans ki exercise karwayein', 'Self-help tools kholein'],
  urdu: ['دوبارہ کوشش کریں', 'سانس کی مشق کروائیں', 'سیلف ہیلپ ٹولز کھولیں'],
  english: ['Try sending that again', 'Guide me through breathing', 'Open the self-help tools'],
};

/** Client shape for a conversation row (camelCase, with its message count). */
interface ConversationResponse {
  id: string;
  guestId: string;
  title: string | null;
  mood: string | null;
  language: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Client shape for a stored message (camelCase, prompts already decoded). */
interface MessageResponse {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  isCrisisAlert: boolean;
  riskTier: 'none' | 'moderate' | 'high';
  suggestedPrompts: string[];
  createdAt: string;
}

type ConversationRow = ConversationRecord & { message_count: number };

/** What POST / always answers with: the frontend contract plus the thread id. */
type ChatReplyPayload = ChatResponseBody & {
  conversationId: string;
  aiUnavailable?: boolean;
};

function resolveLanguage(language?: string): string {
  const key = (language ?? '').trim().toLowerCase();
  return key in AI_UNAVAILABLE_MESSAGES ? key : DEFAULT_LANGUAGE;
}

/** Titles are derived from the opening message so the sidebar reads naturally. */
function buildTitle(message: string): string {
  const collapsed = message.replace(/\s+/g, ' ').trim();
  return collapsed.length > TITLE_MAX_LENGTH
    ? `${collapsed.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`
    : collapsed;
}

/** suggested_prompts is JSON text; tolerate legacy/corrupt rows on read. */
function parsePrompts(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function toConversationResponse(row: ConversationRow): ConversationResponse {
  return {
    id: row.id,
    guestId: row.guest_id,
    title: row.title,
    mood: row.mood,
    language: row.language,
    messageCount: row.message_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toMessageResponse(row: MessageRecord): MessageResponse {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    isCrisisAlert: row.is_crisis_flagged === 1,
    riskTier: (row.risk_tier as 'none' | 'moderate' | 'high' | null) ?? 'none',
    suggestedPrompts: parsePrompts(row.suggested_prompts),
    createdAt: row.created_at,
  };
}

function conversationBelongsToGuest(conversationId: string, guestId: string): boolean {
  const row = db
    .prepare('SELECT id FROM conversations WHERE id = ? AND guest_id = ?')
    .get(conversationId, guestId) as { id: string } | undefined;
  return row !== undefined;
}

/** Creates a conversation owned by the guest and returns its new id. */
function createConversation(
  guestId: string,
  message: string,
  mood: string | undefined,
  language: string,
): string {
  const id = uuidv4();
  db.prepare(
    'INSERT INTO conversations (id, guest_id, title, mood, language) VALUES (?, ?, ?, ?, ?)',
  ).run(id, guestId, buildTitle(message), mood ?? null, language);
  return id;
}

function insertMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
  isCrisisFlagged: boolean,
  suggestedPrompts?: string[],
  riskTier: 'none' | 'moderate' | 'high' = 'none',
): string {
  const id = uuidv4();
  db.prepare(
    `INSERT INTO messages (id, conversation_id, role, content, is_crisis_flagged, risk_tier, suggested_prompts)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    conversationId,
    role,
    content,
    isCrisisFlagged ? 1 : 0,
    riskTier,
    suggestedPrompts && suggestedPrompts.length > 0 ? JSON.stringify(suggestedPrompts) : null,
  );
  return id;
}

function touchConversation(conversationId: string): void {
  db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    conversationId,
  );
}

/**
 * Prefers the history the client sent (it mirrors what the user can see on
 * screen) and falls back to the stored turns for this conversation.
 */
function resolveHistory(
  clientHistory: ChatHistoryMessage[] | undefined,
  conversationId: string | null,
): ChatHistoryMessage[] {
  if (Array.isArray(clientHistory) && clientHistory.length > 0) {
    return clientHistory
      .filter((turn) => turn && typeof turn.content === 'string' && turn.content.trim() !== '')
      .slice(-HISTORY_LIMIT);
  }

  if (!conversationId) return [];

  const rows = db
    .prepare(
      `SELECT role, content FROM messages
       WHERE conversation_id = ? AND role != 'system'
       ORDER BY created_at ASC, rowid ASC`,
    )
    .all(conversationId) as Array<{ role: MessageRole; content: string }>;

  return rows.slice(-HISTORY_LIMIT);
}

/**
 * POST /api/chat — the single conversational entry point.
 * Safety runs first: no user message reaches the model before both crisis
 * layers have cleared it.
 */
router.post('/', guestAuth, async (req: Request, res: Response, next: NextFunction) => {
  const body = (req.body ?? {}) as Partial<ChatRequestBody>;
  const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';

  if (!rawMessage) {
    res.status(400).json({ error: "Field 'message' must be a non-empty string." });
    return;
  }

  const guestId = req.guestId as string;
  const language = resolveLanguage(body.language);
  const mood = typeof body.mood === 'string' && body.mood.trim() !== '' ? body.mood.trim() : undefined;
  const tone = typeof body.tone === 'string' && body.tone.trim() !== '' ? body.tone.trim() : undefined;
  const requestedConversationId =
    typeof body.conversationId === 'string' && body.conversationId.trim() !== ''
      ? body.conversationId.trim()
      : null;

  try {
    if (requestedConversationId && !conversationBelongsToGuest(requestedConversationId, guestId)) {
      res.status(404).json({ error: 'Conversation not found for this session.' });
      return;
    }

    const history = resolveHistory(body.messages, requestedConversationId);
    const recentContext = history.slice(-4).map((turn) => `${turn.role}: ${turn.content}`);

    // Crisis layers 1 + 2 — always before any AI generation.
    const crisisCheck = await runCrisisCheck(rawMessage, language, body.is_crisis_flag, recentContext);

    const conversationId =
      requestedConversationId ?? createConversation(guestId, rawMessage, mood, language);

    if (crisisCheck.isCrisis && crisisCheck.response) {
      const { reply, suggestedPrompts, riskTier } = crisisCheck.response;

      // The user's own message is only flagged 'is_crisis_flagged' at the
      // HIGH tier — moderate distress is still a normal, valid thing to say
      // and shouldn't be visually marked as an alert in message history.
      insertMessage(conversationId, 'user', rawMessage, riskTier === 'high', undefined, riskTier);
      insertMessage(conversationId, 'assistant', reply, riskTier === 'high', suggestedPrompts, riskTier);
      touchConversation(conversationId);

      const payload: ChatReplyPayload = {
        reply,
        suggestedPrompts,
        isCrisisAlert: true,
        riskTier,
        conversationId,
      };
      res.status(200).json(payload);
      return;
    }

    insertMessage(conversationId, 'user', rawMessage, false);

    let aiResult: { reply: string; suggestedPrompts: string[] };
    try {
      aiResult = await generateAIResponse(rawMessage, history, mood, language, tone);
    } catch (aiError) {
      // Never fabricate a companion reply: tell the user plainly, in their language.
      console.error('[chat] AI generation failed:', aiError);
      touchConversation(conversationId);

      // 200 on purpose: the client must render this exact message instead of
      // treating the call as failed and substituting its own canned reply.
      const payload: ChatReplyPayload = {
        reply: pickAiUnavailableMessage(language),
        suggestedPrompts: AI_UNAVAILABLE_PROMPTS[language],
        isCrisisAlert: false,
        riskTier: 'none',
        conversationId,
        aiUnavailable: true,
      };
      res.status(200).json(payload);
      return;
    }

    insertMessage(
      conversationId,
      'assistant',
      aiResult.reply,
      false,
      aiResult.suggestedPrompts,
    );
    touchConversation(conversationId);

    const payload: ChatReplyPayload = {
      reply: aiResult.reply,
      suggestedPrompts: aiResult.suggestedPrompts,
      isCrisisAlert: false,
      riskTier: 'none',
      conversationId,
    };
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
});

/** GET /api/chat/conversations — sidebar list for the current guest, newest first. */
router.get('/conversations', guestAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db
      .prepare(
        `SELECT c.*, COUNT(m.id) as message_count
         FROM conversations c
         LEFT JOIN messages m ON m.conversation_id = c.id
         WHERE c.guest_id = ?
         GROUP BY c.id
         ORDER BY c.updated_at DESC`,
      )
      .all(req.guestId) as ConversationRow[];

    res.status(200).json({ conversations: rows.map(toConversationResponse) });
  } catch (err) {
    next(err);
  }
});

/** GET /api/chat/conversations/:id/messages — full transcript, oldest first. */
router.get(
  '/conversations/:id/messages',
  guestAuth,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversationId = req.params.id;
      const guestId = req.guestId as string;

      if (!conversationBelongsToGuest(conversationId, guestId)) {
        res.status(404).json({ error: 'Conversation not found for this session.' });
        return;
      }

      const rows = db
        .prepare(
          'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, rowid ASC',
        )
        .all(conversationId) as MessageRecord[];

      res.status(200).json({ messages: rows.map(toMessageResponse) });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
