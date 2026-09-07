// Dual-layer, TIERED crisis safety detection.
//
// WHY TIERED: collapsing every distress signal into a single "call an
// emergency hotline" response is itself a safety problem. Someone who is
// hopeless or venting about wanting to disappear is not the same as someone
// who has stated a plan or timeline to end their life. Treating both
// identically either (a) sends people in genuine acute danger to a response
// that isn't urgent enough, or — more commonly in practice — (b) makes the
// AI's safety response feel so heavy-handed for everyday distress that
// people stop being honest with it, which is worse for the acute case too.
//
// MODERATE tier: hopelessness, passive death wish, burden ideation, self-harm
//   urges with no stated method/plan. Response = warm, stays in companion
//   mode, offers a path to a nearby/reachable human professional. No
//   ambulance/hospital framing — that would be disproportionate and can
//   itself discourage someone from ever opening up again.
// HIGH tier: explicit intent, a plan, a method, a timeline, or intent to harm
//   someone else. Response = immediate, unambiguous escalation to crisis
//   lines and emergency rescue (1122). This tier is never softened.
//
// Layer 1 is deterministic keyword matching (fast, offline, cannot be down).
// Layer 2 is an AI classifier for indirect/subtle phrasing Layer 1 misses.
// Layer 1 always runs first and HIGH always short-circuits to the strongest
// response — a false "only moderate" read on truly high-risk language is the
// one failure mode this module cannot tolerate.

import OpenAI from 'openai';
import { config } from '../config.js';

export type RiskTier = 'none' | 'moderate' | 'high';

export interface CrisisResponse {
  reply: string;
  suggestedPrompts: string[];
  isCrisisAlert: true;
  riskTier: 'moderate' | 'high';
}

export interface CrisisCheckResult {
  isCrisis: boolean;
  riskTier: RiskTier;
  response?: CrisisResponse;
}

const DASHSCOPE_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const CLASSIFIER_MODEL = 'qwen-max';
const CLASSIFIER_TIMEOUT_MS = 10_000;

const CLASSIFIER_SYSTEM_PROMPT =
  'You are a mental health safety triage classifier for a Pakistani wellness app. Analyze the LATEST user message, using the recent conversation only for context, in English, Roman Urdu, and Urdu.\n\n' +
  'Classify into exactly one of three tiers:\n' +
  'SAFE — casual complaints, stress about exams/work/family, ordinary sadness, entertainment/media references, venting, sarcasm, or ambiguous short messages with no distress content.\n' +
  'MODERATE — hopelessness, passive death wish ("I wish I could disappear", "no point in living", "everyone would be better off without me"), self-harm urges, or burden ideation, WITHOUT a stated method, plan, or timeline.\n' +
  'HIGH — explicit intent, desire, a plan, a method, a timeline to end one\'s own life or self-harm, OR any expressed intent to harm another person, even if phrased indirectly.\n\n' +
  'When genuinely uncertain between MODERATE and HIGH, choose HIGH — under-reacting to real danger is worse than over-reacting to distress. When uncertain between SAFE and MODERATE, choose MODERATE.\n\n' +
  'Respond with exactly one word: SAFE, MODERATE, or HIGH.';

// Layer 1, HIGH tier: explicit intent/plan/method to end one's life, or to
// harm someone else. This list short-circuits straight to the strongest
// response without waiting on the classifier.
const HIGH_RISK_KEYWORDS = [
  'khudkushi',
  'marna chahta',
  'marna chahti',
  'mar jana',
  'suicide',
  'kill myself',
  'end my life',
  'hurt myself',
  'harm myself',
  'zindagi khatam kar',
  'khud ko mita',
  'khud ko khatam',
  'jaan de dunga',
  'jaan de dungi',
  'maar dena',
  'kill him',
  'kill her',
  'kill them',
  'خودکشی',
  'مرنا چاہتا',
  'مرنا چاہتی',
  'خود کو ختم',
];

// Layer 1, MODERATE tier: hopelessness / passive ideation / burden language,
// without an explicit plan or method attached.
const MODERATE_RISK_KEYWORDS = [
  'koi faida nahi jine ka',
  'jeenay ka koi faida nahi',
  'zindagi mein koi maqsad nahi',
  'sab bekar hai',
  'thak gaya hoon zindagi se',
  'thak gayi hoon zindagi se',
  'i want to disappear',
  'i want to give up',
  "i can't do this anymore",
  'i cant do this anymore',
  'no point in living',
  'better off without me',
  'better off if i was gone',
  'zindagi khatam',
  'زندگی ختم',
  'جینے کا کوئی فائدہ نہیں',
];

// Created lazily so a missing API key never crashes the server at import time.
const getClient = () =>
  new OpenAI({
    apiKey: config.dashscopeApiKey,
    baseURL: DASHSCOPE_BASE_URL,
    maxRetries: 0,
  });

/** Layer 1 primitive: does the message contain an explicit HIGH-tier phrase? */
export function matchesHighRiskKeywords(message: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return HIGH_RISK_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/** Layer 1 primitive: does the message contain a MODERATE-tier phrase? */
export function matchesModerateRiskKeywords(message: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return MODERATE_RISK_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/**
 * Layer 1: deterministic keyword tiering, plus any explicit high-risk flag
 * raised by the client's own quick local check (see aiService.ts).
 */
export function checkCrisisLayer1(message: string, isCrisisFlag?: boolean): RiskTier {
  if (matchesHighRiskKeywords(message) || isCrisisFlag === true) return 'high';
  if (matchesModerateRiskKeywords(message)) return 'moderate';
  return 'none';
}

/**
 * Layer 2: AI classification for indirect risk the keyword lists cannot
 * catch. Fails open (returns 'none') on any error so the API being down
 * never blocks a user from a normal conversation.
 */
export async function checkCrisisLayer2(message: string, recentContext: string[] = []): Promise<RiskTier> {
  const key = config.dashscopeApiKey?.trim() ?? '';
  if (!key || key.startsWith('your_') || !message.trim()) {
    return 'none';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLASSIFIER_TIMEOUT_MS);

  const contextBlock = recentContext.length > 0
    ? `Recent conversation (oldest first):\n${recentContext.join('\n')}\n\nLatest message to classify: "${message}"`
    : `Message to classify: "${message}"`;

  try {
    const completion = await getClient().chat.completions.create(
      {
        model: CLASSIFIER_MODEL,
        messages: [
          { role: 'system', content: CLASSIFIER_SYSTEM_PROMPT },
          { role: 'user', content: contextBlock },
        ],
        max_tokens: 5,
        temperature: 0,
      },
      { signal: controller.signal },
    );

    const verdict = (completion.choices[0]?.message?.content ?? '').toUpperCase();
    if (verdict.includes('HIGH')) return 'high';
    if (verdict.includes('MODERATE')) return 'moderate';
    return 'none';
  } catch (error) {
    console.warn('[crisisDetector] Layer 2 classification unavailable, failing open:', error);
    return 'none';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * HIGH tier: immediate, unambiguous escalation. Full crisis-line + emergency
 * rescue framing. This content is intentionally unchanged from the original
 * single-tier system — it is now just scoped to the population that actually
 * needs it, instead of firing on every hopeless statement.
 */
export function getHighRiskResponse(language: string): CrisisResponse {
  if (language === 'roman_urdu') {
    return {
      reply: `### 🛡️ Hamnafas Hifazat aur Fauri Madad Protocol

Aapki zindagi aur aapki salamati hamare liye intehai ahem hai. Mujhe mehsoos ho raha hai ke aap is waqt shadeed takleef aur bojh mein hain.

Aap akele nahi hain. Baraye meharbani foran hamare verified Pakistani partner counselors se baat karein. Yeh bilkul **muft aur confidential** hai:

📞 **Umang Pakistan Mental Health Helpline**: [0311-7786264](tel:03117786264) *(24/7 Muft aur Mehfooz)*
📞 **Rozan Counseling Helpline**: [0800-22444](tel:080022444)
🚨 **Immediate Emergency Rescue**: [1122](tel:1122)

Mere sath abhi ek dheemi, gehri saans lein. Aap is lamhe mein mehfooz hain. Kya aap kisi qareebi dost ya helpline par foran rabta kar sakte hain?`,
      suggestedPrompts: [
        'Call Umang Helpline 0311-7786264',
        'Mujhe 1-minute Box Breathing karwayein',
        'Aap mere sath baat karte rahein',
      ],
      isCrisisAlert: true,
      riskTier: 'high',
    };
  }

  return {
    reply: `### 🛡️ Hamnafas Crisis Safety Escalation Protocol

Your safety and life are deeply valued. I can hear the profound pain in your words, and you do not have to endure this alone.

Please connect immediately with dedicated professional human counselors in Pakistan. These services are **free, compassionate, and 100% confidential**:

📞 **Umang Pakistan 24/7 Helpline**: [0311-7786264](tel:03117786264)
📞 **Rozan Emotional Support**: [0800-22444](tel:080022444)
🚨 **Immediate Emergency Rescue**: [1122](tel:1122)

Please take a gentle, deep breath with me right now. Can you reach out to someone you trust or call the helpline directly?`,
    suggestedPrompts: [
      'Connect to Umang Helpline (0311-7786264)',
      'Guide me through calming box breathing',
      'Stay with me and talk gently',
    ],
    isCrisisAlert: true,
    riskTier: 'high',
  };
}

/**
 * MODERATE tier: warm, non-alarming, stays in companion territory. Offers a
 * path to a nearby/reachable human professional via the local support
 * directory instead of an emergency framing. Deliberately no hospital /
 * ambulance language here — see file header for the reasoning.
 */
export function getModerateRiskResponse(language: string): CrisisResponse {
  if (language === 'roman_urdu') {
    return {
      reply: `Jo aap mehsoos kar rahe hain, woh sunna mere liye ahem hai — aur mujhe khushi hai ke aap ne yeh baat share ki.

Main Hamnafas hoon, aik companion — main doctor ya therapist ki jagah nahi le sakta, lekin main aapke sath hoon aur chahta hoon ke aapko sahi insaani madad bhi milay.

Agar aap chahein, toh main aapko aapke qareeb mojood counselors aur psychiatrists dikha sakta hoon jinse baat ki ja sakti hai — bilkul aapki apni raftaar par, koi jaldi nahi.

Kya aap abhi thodi baat karna chahenge, ya "mere qareeb madad dikhayein" dekhna chahenge?`,
      suggestedPrompts: [
        'Mere qareeb madad dikhayein',
        'Filhaal sirf baat karna chahta hoon',
        'Mujhe ek chhoti calming exercise karwayein',
      ],
      isCrisisAlert: true,
      riskTier: 'moderate',
    };
  }

  return {
    reply: `Thank you for telling me that — what you're carrying right now matters, and I'm glad you didn't keep it to yourself.

I'm Hamnafas, a companion — I'm not a replacement for a doctor or therapist, but I'm here with you, and I'd also like to help you reach real human support if that feels right.

Whenever you're ready, I can show you counselors and psychiatrists you could reach out to nearby — no pressure, at your own pace.

Would you like to keep talking for now, or see support options near you?`,
    suggestedPrompts: [
      'Show me support near me',
      'I just want to talk for now',
      'Guide me through a short calming exercise',
    ],
    isCrisisAlert: true,
    riskTier: 'moderate',
  };
}

/** Returns the correct templated response for a non-'none' tier. */
export function getCrisisResponse(language: string, riskTier: 'moderate' | 'high'): CrisisResponse {
  return riskTier === 'high' ? getHighRiskResponse(language) : getModerateRiskResponse(language);
}

/**
 * Runs both safety layers in order. Layer 1 short-circuits HIGH so explicit
 * crisis language never waits on a network round-trip. Layer 2 only raises
 * the tier — it never downgrades a HIGH result from Layer 1.
 */
export async function runCrisisCheck(
  message: string,
  language: string,
  isCrisisFlag?: boolean,
  recentContext: string[] = [],
): Promise<CrisisCheckResult> {
  const layer1Tier = checkCrisisLayer1(message, isCrisisFlag);

  if (layer1Tier === 'high') {
    return { isCrisis: true, riskTier: 'high', response: getCrisisResponse(language, 'high') };
  }

  const layer2Tier = await checkCrisisLayer2(message, recentContext);

  // Take the higher of the two tiers found so far.
  const finalTier: RiskTier = layer2Tier === 'high' ? 'high' : layer1Tier === 'moderate' ? 'moderate' : layer2Tier;

  if (finalTier === 'none') {
    return { isCrisis: false, riskTier: 'none' };
  }

  return { isCrisis: true, riskTier: finalTier, response: getCrisisResponse(language, finalTier) };
}
