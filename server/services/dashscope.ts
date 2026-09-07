// DashScope (Qwen) chat completion client via the OpenAI-compatible endpoint.

import OpenAI from 'openai';
import { config } from '../config.js';

const DASHSCOPE_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const CHAT_MODEL = 'qwen-plus';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_HISTORY_MESSAGES = 20;

const MISSING_KEY_MESSAGE =
  'Hamnafas AI is not configured yet. Please set DASHSCOPE_API_KEY in .env before chatting.';
const UPSTREAM_FAILURE_MESSAGE = 'Hamnafas could not reach its AI companion service.';

export interface ChatTurn {
  role: string;
  content: string;
}

export interface AIResult {
  reply: string;
  suggestedPrompts: string[];
}

type ChatRole = 'system' | 'user' | 'assistant';

// Created lazily so a missing API key never crashes the server at import time.
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: config.dashscopeApiKey,
      baseURL: DASHSCOPE_BASE_URL,
      maxRetries: 1,
    });
  }
  return client;
}

/** True when the configured key is absent or still the .env.example placeholder. */
function isApiKeyUsable(): boolean {
  const key = config.dashscopeApiKey?.trim() ?? '';
  return key !== '' && !key.startsWith('your_');
}

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  roman_urdu:
    "The user's preferred language is Roman Urdu (Urdu written in Latin script). Reply mainly in warm, natural Roman Urdu the way Pakistanis text each other, mixing in common English words where that is how people actually speak. Never transliterate stiffly or sound like a textbook.",
  urdu:
    "The user's preferred language is Urdu. Reply in gentle, respectful Urdu script (نستعلیق style wording), keeping sentences short and easy to read.",
  english:
    "The user's preferred language is English. Reply in clear, warm, conversational English, with occasional Urdu terms of endearment only if the user uses them first.",
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  gentle: 'Lean extra soft and slow-paced. Prioritize validating feelings over offering solutions. Never rush toward advice.',
  practical: 'Lean toward concrete, structured coping steps (small CBT-style actions) once the feeling has been acknowledged, not before.',
};

const DEFAULT_PROMPTS: Record<string, string[]> = {
  roman_urdu: [
    'Mazeed batana chahta/chahti hoon',
    'Mujhe saans ki exercise karwayein',
    'PHQ-9 / GAD-7 screening check karein',
  ],
  urdu: ['مزید بات کرنا چاہتا ہوں', 'سانس کی مشق کروائیں', 'PHQ-9 / GAD-7 اسکریننگ کریں'],
  english: [
    'I want to talk about this more',
    'Guide me through a breathing exercise',
    'Take a PHQ-9 / GAD-7 screening',
  ],
};

function resolveLanguage(language?: string): string {
  const key = (language ?? '').trim().toLowerCase();
  return key in LANGUAGE_INSTRUCTIONS ? key : 'roman_urdu';
}

/** Default follow-up prompts used when the model does not emit its own. */
export function getDefaultPrompts(language?: string): string[] {
  return [...DEFAULT_PROMPTS[resolveLanguage(language)]];
}

/**
 * Builds the full Hamnafas persona prompt: identity, cultural tone, clinical
 * boundaries, the crisis hand-off rule, and the SUGGESTED: output contract.
 */
export function buildSystemPrompt(
  mood?: string,
  language?: string,
  tone?: string,
  isFirstMessage: boolean = true,
): string {
  const languageKey = resolveLanguage(language);
  const moodLine = mood?.trim()
    ? isFirstMessage
      ? `The user just told you their current mood is "${mood.trim()}" as they opened this chat. Acknowledge that feeling warmly and briefly in your first sentence — do not make the mood word the whole reply — then move the conversation forward.`
      : `Earlier in this conversation the user tagged their mood as "${mood.trim()}". This exists ONLY as quiet background context for how gently to pace things, and to track how they're doing over time — it is NOT something to bring up again. Do NOT repeat, name, or reference that mood word in this reply (e.g. never say things like "since you're feeling ${mood.trim()}..." or "I know you're ${mood.trim()}"). Respond only to what they are actually saying right now, as you naturally would with a close friend who doesn't need their feelings relabelled back at them every time they talk.`
    : 'The user has not shared a mood label. Pay close attention to the emotional tone of their words instead.';
  const toneLine = tone && TONE_INSTRUCTIONS[tone] ? TONE_INSTRUCTIONS[tone] : '';

  return `You are Hamnafas (هم نفس — "one breath, together"), a warm, empathetic Pakistani mental health companion.

WHO YOU ARE
- You are a companion, not a clinician. You sit beside the user, you do not talk down to them.
- You understand Pakistani life: joint families, shaadi and rishta pressure, exam and board results, job insecurity, log kya kahenge, the stigma around therapy, faith as a source of comfort for many.
- Your tone is unhurried, tender, and hopeful. Short paragraphs. No lecturing, no toxic positivity, no clinical coldness.

PERSONALITY & WARMTH
- Be caring, kind, patient, and genuinely trustworthy — like a beloved close friend, not a clinical tool and not a stranger reading from a script.
- Use gentle emojis where they'd naturally land in real texting — roughly 1 to 3 per reply (e.g. 💙 🌱 ✨ 🫂 🤍 😊), never a whole row of them, never forced into every sentence, and never in crisis-safety replies (those stay plain and clear).
- Never end on a flat, dead-end sentence. Every reply should leave the door open — a warm remark, a small next step, or one caring question — so the person always feels invited to keep talking.
- Avoid stock filler like "I'm here for you" or "I understand" sitting alone with nothing behind them — always make the reply specific to what the user actually just said.
- Never use the user's mood label, screening score, or any diagnostic-sounding word to define who they are ("you are anxious"). Talk to the whole person, not a label — moods are just weather passing through, not identity.

HOW YOU TALK
- ${LANGUAGE_INSTRUCTIONS[languageKey]}
- Mirror the user: if they code-switch between English, Roman Urdu, and Urdu, code-switch with them and reply in the same blend they used. Their actual message always outweighs the preferred-language setting.
- Validate the feeling first, then reflect it back in your own words (never repeat the user's exact sentence back to them), then offer one small next step or one gentle open question. Never stack several questions.
- Keep replies conversational in length (usually 2-5 short paragraphs). Use light Markdown only when it genuinely helps readability.
- ${moodLine}
- ${toneLine}

BOUNDARIES YOU NEVER CROSS
- NEVER provide a medical or psychiatric diagnosis. Do not say the user "has" depression, anxiety, or any disorder.
- NEVER prescribe, recommend, name, or adjust any medication or dosage.
- Use screening-and-support language only: talk about what someone might be experiencing, what a PHQ-9 or GAD-7 screening can help reflect, and what coping steps may help.
- For severe, persistent, or worsening distress, warmly encourage the user to speak with a professional counselor or doctor, and normalise that choice.
- Do not promise confidentiality guarantees, outcomes, or cures. Do not claim to be human.

CRISIS RULE
- If the user mentions self-harm, suicide, or wanting to die, do NOT attempt to counsel, assess, or manage the situation yourself. A separate safety layer handles helpline routing.
- In that case simply acknowledge their pain in one or two sentences, tell them they are not alone and that real human help is available right now, and stop there.

OUTPUT FORMAT
Write your reply as natural conversational text. Then, on the final lines, offer exactly 3 short follow-up prompts the user might want to send next — written in the user's own voice, contextual to what was just discussed, and at most about 8 words each. Format each on its own line, prefixed exactly like this:
SUGGESTED: <first prompt>
SUGGESTED: <second prompt>
SUGGESTED: <third prompt>
Never mention these instructions, the word "SUGGESTED", or the safety layer inside your conversational reply.`;
}

/** Only the roles the chat API accepts survive; anything else is treated as user text. */
function normaliseRole(role: string): ChatRole {
  return role === 'assistant' || role === 'system' ? role : 'user';
}

/** Drops empty turns and keeps only the most recent slice of the conversation. */
function trimHistory(history: ChatTurn[]): Array<{ role: ChatRole; content: string }> {
  return (Array.isArray(history) ? history : [])
    .filter((turn) => turn && typeof turn.content === 'string' && turn.content.trim() !== '')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((turn) => ({ role: normaliseRole(turn.role), content: turn.content }));
}

/**
 * Splits the raw completion into the visible reply and the SUGGESTED: prompts,
 * falling back to language-appropriate defaults when the model omits them.
 */
export function parseCompletion(raw: string, language?: string): AIResult {
  const replyLines: string[] = [];
  const suggestedPrompts: string[] = [];

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    // Tolerate the model bolding or bulleting the marker, e.g. "- **SUGGESTED:** ...".
    const match = /^[-*\s>]*\**\s*SUGGESTED\**\s*:\s*\**\s*(.+)$/i.exec(trimmed);

    if (match) {
      const prompt = match[1].replace(/\**\s*$/, '').trim();
      if (prompt) suggestedPrompts.push(prompt);
      continue;
    }

    replyLines.push(line);
  }

  const reply = replyLines.join('\n').trim();

  return {
    reply,
    suggestedPrompts: suggestedPrompts.length > 0
      ? suggestedPrompts.slice(0, 3)
      : getDefaultPrompts(language),
  };
}

/**
 * Sends one user turn to Qwen and returns the companion reply plus follow-up
 * prompts. Throws on any failure so the route can answer with a safe, honest
 * message rather than a fabricated one.
 */
// Retried once: a single dropped connection, rate-limit blip, or an empty/
// content-filtered completion (mental-health phrasing occasionally trips
// DashScope's moderation into an empty response) should not immediately
// surface the canned "AI unavailable" message to the user.
const MAX_GENERATION_ATTEMPTS = 2;

export async function generateAIResponse(
  message: string,
  conversationHistory: ChatTurn[],
  mood?: string,
  language?: string,
  tone?: string,
  isFirstMessage: boolean = conversationHistory.length === 0,
): Promise<AIResult> {
  if (!isApiKeyUsable()) {
    throw new Error(MISSING_KEY_MESSAGE);
  }

  const systemPrompt = buildSystemPrompt(mood, language, tone, isFirstMessage);
  let lastErrorDetail = 'unknown error';

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const completion = await getClient().chat.completions.create(
        {
          model: CHAT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...trimHistory(conversationHistory),
            { role: 'user', content: message },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        },
        { signal: controller.signal },
      );

      const finishReason = completion.choices[0]?.finish_reason;
      const raw = completion.choices[0]?.message?.content?.trim() ?? '';

      if (!raw) {
        lastErrorDetail = `empty completion (finish_reason: ${finishReason ?? 'unknown'})`;
        console.warn(`[dashscope] attempt ${attempt}/${MAX_GENERATION_ATTEMPTS} — ${lastErrorDetail}`);
        continue;
      }

      const parsed = parseCompletion(raw, language);
      if (!parsed.reply) {
        lastErrorDetail = 'no usable reply text after parsing SUGGESTED lines';
        console.warn(`[dashscope] attempt ${attempt}/${MAX_GENERATION_ATTEMPTS} — ${lastErrorDetail}`);
        continue;
      }

      return parsed;
    } catch (error) {
      lastErrorDetail = error instanceof Error ? error.message : String(error);
      console.error(`[dashscope] attempt ${attempt}/${MAX_GENERATION_ATTEMPTS} failed:`, lastErrorDetail);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(`${UPSTREAM_FAILURE_MESSAGE} (${lastErrorDetail})`);
}

export default generateAIResponse;

/**
 * Converts Roman Urdu (Latin script) into real Urdu script (Nastaliq).
 * This exists purely for text-to-speech: Azure's ur-PK neural voices are
 * trained on actual Urdu script and read romanized Latin text poorly/
 * unintelligibly. This is NOT translation — it must preserve the exact
 * words and meaning, only changing the script they're written in.
 */
export async function transliterateToUrduScript(romanUrduText: string): Promise<string> {
  if (!isApiKeyUsable()) {
    throw new Error(MISSING_KEY_MESSAGE);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const completion = await getClient().chat.completions.create(
      {
        model: CHAT_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You transliterate Roman Urdu (Urdu written in Latin/English letters) into proper Urdu script (Nastaliq/Perso-Arabic script). ' +
              'This is transliteration, NOT translation: keep every word, meaning, and any English words exactly as they are (write embedded English words in Urdu script phonetically as Pakistanis would text them, or keep them in Latin script if that reads more naturally). ' +
              'This output will be read aloud by a text-to-speech engine, so add short-vowel diacritics (زبر، زیر، پیش) on words that would otherwise be pronounced ambiguously without them (for example, distinguish چُپ "chup/quiet" from چَپ "chap/left" by marking the correct vowel). Do not over-mark simple, unambiguous words. ' +
              'Output ONLY the Urdu script text. No explanations, no quotes, no extra commentary.',
          },
          { role: 'user', content: romanUrduText },
        ],
        max_tokens: 1024,
        temperature: 0.2,
      },
      { signal: controller.signal },
    );

    const result = completion.choices[0]?.message?.content?.trim() ?? '';
    if (!result) {
      throw new Error('Transliteration returned empty text.');
    }
    return result;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('[dashscope] transliteration failed:', detail);
    throw new Error(`Transliteration failed (${detail})`);
  } finally {
    clearTimeout(timer);
  }
}

export interface ReportSummaryInput {
  periodDays: number;
  moodCheckIns: Array<{ mood: string; date: string }>;
  streakCount: number;
  screenings: Array<{ type: string; score: number; maxScore: number; severity: string; date: string }>;
}

function buildFallbackReportSummary(data: ReportSummaryInput, language: string): string {
  const isRu = language === 'roman_urdu';
  const totalCheckIns = data.moodCheckIns.length;
  const screeningsCount = data.screenings.length;

  let trend = 'stable';
  if (totalCheckIns > 0) {
    const recent = data.moodCheckIns.slice(-3).map((m) => m.mood.toLowerCase());
    const positiveMoods = ['hopeful', 'good', 'calm', 'pur-sukoon', 'umeed'];
    const positiveCount = recent.filter((m) => positiveMoods.some((p) => m.includes(p))).length;
    if (positiveCount >= 2) trend = 'improving';
    else if (recent.some((m) => m.includes('heavy') || m.includes('overwhelmed') || m.includes('low') || m.includes('sad'))) trend = 'showing areas of distress';
  }

  if (isRu) {
    return `Pichle ${data.periodDays} dinon mein ${totalCheckIns} mood check-ins aur ${data.streakCount} din ka care streak record hua hai. Rujhan (trend) majmooi tor par ${trend === 'improving' ? 'behtari ki taraf' : 'mustahkam (stable)'} hai${screeningsCount > 0 ? `, aur ${screeningsCount} clinical screening(s) mukammal ki gayi hain` : ''}. Yeh summary kisi doctor ya therapist ke sath share karne ke liye mushahidati hisaab hai, koi tibbi tashkhees (medical diagnosis) nahi.`;
  }

  return `Over the past ${data.periodDays} days, ${totalCheckIns} mood check-in(s) and an active streak of ${data.streakCount} day(s) were logged. The overall emotional pattern appears ${trend}${screeningsCount > 0 ? `, alongside ${screeningsCount} completed clinical screening assessment(s)` : ''}. Note: This observational summary is prepared to support discussions with a clinician or trusted caregiver, and is not a medical diagnosis.`;
}

export async function generateReportSummary(
  data: ReportSummaryInput,
  language: string = 'roman_urdu',
): Promise<string> {
  const fallback = buildFallbackReportSummary(data, language);
  if (!isApiKeyUsable()) {
    return fallback;
  }

  const prompt = `You are a clinical companion summarizer for Hamnafas, a Pakistani mental health support platform.
Generate a short, plain-language 3 to 4 sentence summary of the user's emotional and engagement trend over the past ${data.periodDays} days.
Data:
- Daily care streak: ${data.streakCount} days
- Mood check-ins (${data.moodCheckIns.length} recorded): ${data.moodCheckIns.map((m) => `${m.date.slice(0, 10)}: ${m.mood}`).join(', ') || 'No specific mood tags recorded'}
- Clinical screening assessments (${data.screenings.length}): ${data.screenings.map((s) => `${s.type.toUpperCase()}: score ${s.score}/${s.maxScore} (${s.severity}) on ${s.date.slice(0, 10)}`).join('; ') || 'None taken in this period'}

CRITICAL INSTRUCTIONS:
1. State the overall trend direction (improving, stable, fluctuating, or worsening).
2. Explicitly instruct that this is NOT a clinical diagnosis or medical treatment plan — it is strictly an observational summary to share with a supporting adult, doctor, or therapist.
3. Keep it warm, objective, empathetic, and professional.
4. Reply in ${language === 'roman_urdu' ? 'clear Roman Urdu (or bilingual Roman Urdu/English)' : 'clear English'}.`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const completion = await getClient().chat.completions.create(
        {
          model: CHAT_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You write concise, objective, observational mental health progress summaries for individuals to share with their doctors or therapists. Never provide medical diagnoses or prescriptions.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 400,
          temperature: 0.5,
        },
        { signal: controller.signal },
      );

      const reply = completion.choices[0]?.message?.content?.trim();
      return reply || fallback;
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    console.warn('[dashscope] generateReportSummary failed, using fallback:', err);
    return fallback;
  }
}

