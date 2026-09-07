import type { Request } from 'express';

/** guests table */
export interface GuestRecord {
  id: string;
  preferred_language: string;
  created_at: string;
}

/** users table */
export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

/** conversations table */
export interface ConversationRecord {
  id: string;
  guest_id: string;
  title: string | null;
  mood: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';

/** messages table — suggested_prompts is a JSON-encoded string[] */
export interface MessageRecord {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  is_crisis_flagged: number;
  risk_tier: string | null;
  suggested_prompts: string | null;
  created_at: string;
}

export type ScreeningType = 'phq9' | 'gad7';

/** screening_results table — answers_json is a JSON-encoded Record<string, number> */
export interface ScreeningResultRecord {
  id: string;
  guest_id: string;
  screening_type: ScreeningType;
  total_score: number;
  max_score: number;
  severity_band: string;
  answers_json: string | null;
  is_crisis_flagged: number;
  created_at: string;
}

export interface ChatHistoryMessage {
  role: string;
  content: string;
}

export interface ChatRequestBody {
  message: string;
  mood?: string;
  language?: string;
  tone?: string;
  is_crisis_flag?: boolean;
  messages?: ChatHistoryMessage[];
  conversationId?: string;
}

export interface ChatResponseBody {
  reply: string;
  suggestedPrompts?: string[];
  isCrisisAlert?: boolean;
  riskTier?: 'none' | 'moderate' | 'high';
}

export interface ScreeningRequestBody {
  type: string;
  score: number;
  maxScore: number;
  severityLevel: string;
  answers: Record<string, number>;
  crisisTriggered?: boolean;
}

/** Request shape after guestAuth middleware has resolved the guest. */
export interface GuestRequest<TBody = unknown> extends Request<Record<string, string>, unknown, TBody> {
  guestId?: string;
}

declare global {
  namespace Express {
    interface Request {
      guestId?: string;
      userId?: string;
      userEmail?: string;
      isAuthenticated?: boolean;
    }
  }
}
