/**
 * Hamnafas AI & Backend Integration Service
 *
 * =========================================================================
 * 🛠️ ACTUAL ARCHITECTURE (as implemented — see server/ for source of truth):
 * =========================================================================
 *
 * ┌──────────────────────┐  fetch /api/chat   ┌───────────────────────────┐
 * │   Hamnafas Web UI    │ ─────────────────► │  Node.js / Express server  │
 * │  (React + Vite SPA)  │ ◄───────────────── │  (server/routes/chat.ts)   │
 * └──────────────────────┘   JSON response     └──────────────┬─────────────┘
 *                                                              │
 *                                       ┌──────────────────────┴───────────────────────┐
 *                                       ▼                                                ▼
 *                     ┌─────────────────────────────┐                  ┌──────────────────────────────┐
 *                     │ crisisDetector.ts            │                  │ dashscope.ts                 │
 *                     │ Layer 1: keyword tiering      │  MODERATE/HIGH   │ Alibaba Cloud DashScope       │
 *                     │  (deterministic, offline)     │ ───escalates───► │ qwen-plus (chat)               │
 *                     │ Layer 2: qwen-max classifier   │                  │ qwen-max (crisis classifier)  │
 *                     │  (fails open on error)         │                  └──────────────────────────────┘
 *                     └─────────────────────────────┘
 *
 * This file's HIGH_RISK_KEYWORDS / MODERATE_RISK_KEYWORDS below are a client-side
 * mirror of crisisDetector.ts's Layer 1, used only as an offline fallback if the
 * backend request fails outright (see the catch block in generateHamnafasResponse).
 * The authoritative, always-on crisis check runs server-side on every message.
 * =========================================================================
 */

import { ChatMessage, MoodType, RiskTier, SupportedLanguage } from '../types';

export interface AIResponsePayload {
  reply: string;
  suggestedPrompts?: string[];
  isCrisisAlert?: boolean;
  riskTier?: RiskTier;
  detectedEmotion?: string;
  conversationId?: string; // real backend thread id, so replies stay in one thread
}

// HIGH tier: explicit intent/plan/method to end one's life, or to harm
// someone else. Mirrors server/services/crisisDetector.ts so the offline
// fallback engine (used only if the backend is unreachable) applies the same
// tiering instead of collapsing everything into one crisis response.
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

// MODERATE tier: hopelessness / passive ideation / burden language, without
// an explicit plan or method attached.
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

/** Local (offline) risk tiering — only used when the backend can't be reached. */
export function detectRiskTier(text: string): RiskTier {
  const lower = text.toLowerCase();
  if (HIGH_RISK_KEYWORDS.some((kw) => lower.includes(kw))) return 'high';
  if (MODERATE_RISK_KEYWORDS.some((kw) => lower.includes(kw))) return 'moderate';
  return 'none';
}

/** @deprecated kept for backward compatibility — prefer detectRiskTier. */
export function detectCrisisIntent(text: string): boolean {
  return detectRiskTier(text) === 'high';
}

// Built-in intelligent empathetic response generator (multilingual: Roman Urdu, Urdu, English)
export async function generateHamnafasResponse(
  userMessage: string,
  history: ChatMessage[],
  currentMood?: MoodType,
  customBackendUrl?: string,
  preferredLanguage: SupportedLanguage = 'roman_urdu',
  tone?: string,
  conversationId?: string // pass the thread's real backend id to keep replies in the same conversation
): Promise<AIResponsePayload> {
  const localRiskTier = detectRiskTier(userMessage);
  const isCrisis = localRiskTier !== 'none';

  const backendUrl =
    customBackendUrl && customBackendUrl.trim() !== ''
      ? `${customBackendUrl.replace(/\/$/, '')}/api/chat`
      : '/api/chat';

  const guestToken = typeof window !== 'undefined' ? localStorage.getItem('hamnafas_guest_token') : null;

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      credentials: 'include', // send the JWT auth cookie so logged-in identity is used, not just the guest token
      headers: {
        'Content-Type': 'application/json',
        ...(guestToken ? { 'X-Guest-Token': guestToken } : {}),
      },
      body: JSON.stringify({
        message: userMessage,
        mood: currentMood,
        language: preferredLanguage,
        tone,
        // Only an explicit HIGH-tier local match forces the server's fast
        // path — a moderate/passive-ideation match should still go through
        // the server's own tiering rather than being force-escalated here.
        is_crisis_flag: localRiskTier === 'high',
        conversationId, // keep this exchange in the same backend thread instead of creating a new one every message
        messages: history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        reply: data.reply || data.response || data.content || 'I heard you. I am here with you.',
        suggestedPrompts: data.suggestedPrompts || ['Tell me more', 'Guide my breath', 'What else is on your mind?'],
        isCrisisAlert: data.isCrisisAlert || isCrisis,
        riskTier: (data.riskTier as RiskTier) ?? localRiskTier,
        conversationId: data.conversationId, // capture the real thread id the backend assigned
      };
    }
  } catch (err) {
    console.warn('Backend call failed, using built-in engine:', err);
  }

  // Simulated natural latency for real-time human-like conversation pacing
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 500));

  const lower = userMessage.toLowerCase();

  // ================= 1. TIERED SAFETY ESCALATION (offline fallback) =================
  // HIGH: explicit intent/plan/method — immediate crisis-line + rescue framing.
  if (localRiskTier === 'high') {
    if (preferredLanguage === 'roman_urdu') {
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
    } else {
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
  }

  // MODERATE: hopelessness / passive ideation — warm, stays in companion
  // mode, offers the local support directory instead of an emergency framing.
  if (localRiskTier === 'moderate') {
    if (preferredLanguage === 'roman_urdu') {
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
    } else {
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
  }

  // ================= 2. PHQ-9 / GAD-7 SCREENING TRIGGER =================
  if (lower.includes('phq') || lower.includes('gad') || lower.includes('screening') || lower.includes('test') || lower.includes('checkup') || lower.includes('assessment')) {
    if (preferredLanguage === 'roman_urdu') {
      return {
        reply: `Hamnafas mein do structured, validated clinical screening frameworks mojood hain jo aapke jazbaati baseline ko check karne mein madad karte hain:

1. 📋 **PHQ-9 (Depression Screening)**: 9 sawalat ka standard test jo pichle 2 hafton ki thakawat, dilchaspi aur udaasi ki shiddat ko 0-27 score par naptay hai.
2. 🌊 **GAD-7 (Anxiety Screening)**: 7 sawalat ka validated scale jo bechaini, ghabrahat aur hadd se zyada fikr ko 0-21 score par calculate karta hai.

Aap upar **Self-Help Tools** ya **Take Screening** button par click kar ke foran test de sakte hain, ya mujhe batayein hum yahan chat mein shuru kar lein!`,
        suggestedPrompts: [
          'PHQ-9 Depression Screening shuru karein',
          'GAD-7 Anxiety Screening shuru karein',
          'Mera score kya zahir karta hai?',
        ],
      };
    } else {
      return {
        reply: `Hamnafas provides two internationally validated clinical assessment frameworks:

1. 📋 **PHQ-9 (Patient Health Questionnaire)**: A 9-item scale evaluating depressive symptoms, sleep disruptions, energy levels, and mood over the past 2 weeks (Scores 0–27).
2. 🌊 **GAD-7 (Generalized Anxiety Scale)**: A 7-item scale assessing worry severity, physical tension, and restlessness (Scores 0–21).

You can open the interactive screening tool above to calculate your score with tailored clinical coping steps, or take it directly here with me!`,
        suggestedPrompts: [
          'Start PHQ-9 Depression Screening',
          'Start GAD-7 Anxiety Screening',
          'Explain what clinical scores mean',
        ],
      };
    }
  }

  // ================= 3. BREATHING & SOMATIC REGULATION =================
  if (lower.includes('saans') || lower.includes('breath') || lower.includes('box breath') || lower.includes('breathing')) {
    if (preferredLanguage === 'roman_urdu') {
      return {
        reply: `Aayein mere sath aik pur-sukoon **Box Breathing (4-4-4-4)** ka cycle karte hain:

🌿 **Saans Andar (Inhale)**: 4 second ke liye naak se dheemi saans lein... *(1... 2... 3... 4)*
🤍 **Rokain (Hold)**: 4 second ke liye saans ko narmi se rokain... *(1... 2... 3... 4)*
🕊️ **Saans Bahir (Exhale)**: 4 second ke liye moonh se saans nikaalein... *(1... 2... 3... 4)*
✨ **Sukoon (Rest)**: 4 second ke liye aaram karein... *(1... 2... 3... 4)*

Kaisa mehsoos hua aapko seene mein? Kya hum aik aur cycle karein?`,
        suggestedPrompts: [
          'Aik aur cycle karte hain',
          '5-4-3-2-1 Grounding try karein',
          'Thora sakoon mila hai',
        ],
      };
    } else {
      return {
        reply: `Let's do a soothing **4-4-4-4 Box Breath** together right now:

🌿 **Inhale** gently through your nose for 4 seconds... *(1... 2... 3... 4)*
🤍 **Hold** softly with relaxation in your shoulders... *(1... 2... 3... 4)*
🕊️ **Exhale** completely through your mouth... *(1... 2... 3... 4)*
✨ **Rest** quietly for 4 seconds... *(1... 2... 3... 4)*

How did that one cycle feel in your chest and shoulders?`,
        suggestedPrompts: [
          'Let us do another cycle together',
          'Try 5-4-3-2-1 grounding technique',
          'I feel a bit more relaxed now',
        ],
      };
    }
  }

  // ================= 4. ANXIETY & PANIC (BECHAINI / GHABRAHAT) =================
  if (lower.includes('anxious') || lower.includes('panic') || lower.includes('ghabrahat') || lower.includes('bechain') || lower.includes('pareshan') || lower.includes('dar')) {
    if (preferredLanguage === 'roman_urdu') {
      return {
        reply: `Main aapki bechaini aur ghabrahat ko samajh sakta hoon. Ghabrahat mein dil ki dharkan tez hona ya saans phoolna qudrati hai — yeh aapka nervous system aapko mehfooz rakhne ki koshish kar raha hota hai.

Aap is waqt bilkul mehfooz hain. Aayein apne ird gird nazar dorayein:
Kya aap apne aas paas koi 3 aisi cheezein dekh sakte hain jin ka rang neela ya safaid ho?`,
        suggestedPrompts: [
          'Mujhe deewar par tasveer nazar aa rahi hai',
          'Mera dil bohat tez dharak raha hai',
          'Mujhe GAD-7 Anxiety Checkup karwayein',
        ],
      };
    } else {
      return {
        reply: `I hear the anxiety in your words, and I want to remind you: you are safe here in this moment. Anxiety is your nervous system activating an alert response.

Let's bring your attention back into the physical room. Can you feel the solid floor beneath your feet and notice the room's temperature?`,
        suggestedPrompts: [
          'I feel the ground under my feet',
          'My heart is beating quite fast',
          'Let us do a guided GAD-7 assessment',
        ],
      };
    }
  }

  // ================= 5. SADNESS & DEPRESSION (UDAASI / MAYOOSI) =================
  if (lower.includes('sad') || lower.includes('udaas') || lower.includes('mayoos') || lower.includes('rona') || lower.includes('cry') || lower.includes('lonely') || lower.includes('alone') || lower.includes('akela') || lower.includes('dil bhari')) {
    if (preferredLanguage === 'roman_urdu') {
      return {
        reply: `Main aapke sath hoon. Udaasi ka bojh dil par bohat bhari hota hai, aur kisi ke samne 'sab theek hai' ka dikhawa karna mazeed thaka deta hai.

Hamnafas ke sath aapko koi parda rakhne ki zaroorat nahi. Agar aapka dil chahe toh ro lein, ya jo baat dil ko dukha rahi hai, aahista aahista yahan likh dein. Main sun raha hoon.`,
        suggestedPrompts: [
          'Bas koi sunne wala chahiye tha',
          'Mujhe bohat akelapan lag raha hai',
          'PHQ-9 Depression Screening check karein',
        ],
      };
    } else {
      return {
        reply: `I'm holding gentle space for you. It takes courage to acknowledge sadness. You don't have to put on a brave face or pretend everything is fine here.

If your sadness had words right now, what does it need most? Rest, understanding, or just someone to sit with you?`,
        suggestedPrompts: [
          'Just someone to understand without judgment',
          'I feel emotionally drained',
          'Check my PHQ-9 Depression scale',
        ],
      };
    }
  }

  // ================= 6. SLEEP ISSUES & INSOMNIA (NEEND) =================
  if (lower.includes('sleep') || lower.includes('neend') || lower.includes('tired') || lower.includes('insomnia') || lower.includes('jaag')) {
    if (preferredLanguage === 'roman_urdu') {
      return {
        reply: `Neend ka na aana ya raat ko bar bar ankh khulna zehni thakawat ki bari alamat hoti hai. Jab din ke waqt dimagh ko baatein process karne ka waqt nahi milta, toh woh raat ke sannate mein sab kuch hal karne lagta hai.

Kya hum ek chota sa 'Brain Dump' karein? Jo 2 ya 3 baatein aapko jagaye huway hain, yahan likh kar dimagh se bahir nikal lein.`,
        suggestedPrompts: [
          'Haan, main likhta/likhti hoon jo zehan mein hai',
          'Raat ke pur-sukoon soundscapes on karein',
          '4-7-8 Sleep breathing karwayein',
        ],
      };
    } else {
      return {
        reply: `Sleep disruption is so closely tied to nervous system overload. When racing thoughts dominate bedtime, the brain stays in vigilant mode.

Would it help to do a quick thought dump and write down the top two concerns keeping you awake tonight?`,
        suggestedPrompts: [
          'Yes, let me write out racing thoughts',
          'Play calming rain soundscapes',
          'Guide me through 4-7-8 relaxing breath',
        ],
      };
    }
  }

  // ================= 7. OVERWHELM & STRESS (BOJH / TENSION) =================
  if (lower.includes('overwhelm') || lower.includes('bojh') || lower.includes('tension') || lower.includes('stress') || lower.includes('deadline') || lower.includes('mushkil')) {
    if (preferredLanguage === 'roman_urdu') {
      return {
        reply: `Jab masail ka dhair lag jaye toh sab kuch aik sath theek karne ki koshish mazeed uljha deti hai.

Pura pahaar aik sath nahi hilana. Sirf agle 30 minute ke liye, konsi AIK choti si cheez hai jise hum asan bana sakte hain?`,
        suggestedPrompts: [
          'Pehle 5 minute ke kaam ko alag karein',
          'Thora break le kar saans lete hain',
          'Mujhe stress manage karne ke tips dein',
        ],
      };
    } else {
      return {
        reply: `When everything feels like a giant tangled knot, trying to pull every string at once causes more tension.

Let's isolate just ONE tiny thread. What is the single smallest action we can focus on for the next 20 minutes?`,
        suggestedPrompts: [
          'Help me prioritize just the first step',
          'Let me take a 5-minute pause first',
          'How do I handle overwhelming demands?',
        ],
      };
    }
  }

  // ================= 8. GRATITUDE & CLOSING (SHUKRIYA / BETTER) =================
  if (lower.includes('shukriya') || lower.includes('thank') || lower.includes('behtar') || lower.includes('better') || lower.includes('jazakallah')) {
    if (preferredLanguage === 'roman_urdu') {
      return {
        reply: `Aapka bohat shukriya. Apne jazbaat ko pehchanna aur un par baat karna khud aik bari himmat ki baat hai.

Hamnafas hamesha aapke sath hai — ek saans, aik lamha, aik qadam. Jab bhi zaroorat ho, main yehi hoon.`,
        suggestedPrompts: [
          'Yeh reflection save karein',
          'PHQ-9 / GAD-7 Checkup open karein',
          'Shukr-guzari journal likhein',
        ],
      };
    } else {
      return {
        reply: `You're so welcome. Taking time to honor your inner state is a genuine act of self-care.

Hamnafas is always here for you — one breath at a time. Reach out whenever you need a safe, stigma-free companion.`,
        suggestedPrompts: [
          'Save this reflection',
          'Open PHQ-9 / GAD-7 screening tool',
          'Write a quick gratitude note',
        ],
      };
    }
  }

  // ================= 9. GENERAL / MOOD-BASED FALLBACK =================
  if (preferredLanguage === 'roman_urdu') {
    return {
      reply: `Main aapki baat ghour se sun raha hoon. Chahe din jaisa bhi guzar raha ho, yaad rakhein ke hum ise aahista aahista, bina kisi dabao ke hal kar sakte hain.

Aap is waqt kaisa mehsoos kar rahe hain, aur main kis tarah aapki behtar madad kar sakta hoon?`,
      suggestedPrompts: [
        'Dil ki baat mazeed batata/batati hoon',
        'PHQ-9 / GAD-7 Screening check karein',
        'Pur-sukoon saans ka exercise karein',
      ],
    };
  }

  return {
    reply: `I hear you clearly. Thank you for sharing this space with me. Whatever you are navigating today, remember we can take it one gentle step at a time. How can I best support you right now?`,
    suggestedPrompts: [
      'Help me look at this calmly',
      'Take a PHQ-9 / GAD-7 screening',
      'Guide my breath for 1 minute',
    ],
  };
}

/**
 * Speech Synthesis (TTS) Helper for calming voice companion experience
 */
/**
 * Waits for the browser's voice list to actually be populated.
 * getVoices() often returns [] on the very first call because voices
 * load asynchronously — this fixes that race condition.
 */
function getVoicesReady(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    // Fallback in case the event never fires on some browsers
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
}

export async function speakText(
  text: string,
  onEnd?: () => void,
  options?: { language?: SupportedLanguage; gender?: 'female' | 'male' }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop any active speech
    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.92; // Slightly slower, calming pace

    const voices = await getVoicesReady();
    const gender = options?.gender ?? 'female';
    const wantsUrdu = options?.language === 'roman_urdu';

    // Web Speech API has no reliable cross-browser "gender" field, so we
    // match against known common voice names on Windows/Chrome/mac.
    const FEMALE_NAMES = ['zira', 'hazel', 'susan', 'samantha', 'female', 'heera', 'lekha', 'google uk english female', 'google us english'];
    const MALE_NAMES = ['david', 'mark', 'george', 'daniel', 'male', 'ravi', 'google uk english male'];
    const nameHasAny = (v: SpeechSynthesisVoice, list: string[]) =>
      list.some((n) => v.name.toLowerCase().includes(n));

    const urduVoice = voices.find((v) => v.lang.startsWith('ur'));
    const hiVoices = voices.filter((v) => v.lang === 'hi-IN');
    const enVoices = voices.filter((v) => v.lang.startsWith('en'));
    const nameHasGender = (v: SpeechSynthesisVoice) =>
      nameHasAny(v, gender === 'male' ? MALE_NAMES : FEMALE_NAMES);

    // Priority: (1) real Urdu voice, (2) Hindi voice matching gender name if
    // Roman/Urdu text — Hindi is phonetically the closest cousin available on
    // most devices — (3) Hindi voice of any gender, (4) English voice matching
    // gender name, (5) guaranteed-distinct English fallback, (6) anything.
    const hiGenderMatch = hiVoices.find(nameHasGender);
    const enGenderMatch = enVoices.find(nameHasGender);
    const fallbackFemale = enVoices[0];
    const fallbackMale =
      enVoices[enVoices.length - 1] !== fallbackFemale
        ? enVoices[enVoices.length - 1]
        : enVoices[1] ?? enVoices[0];

    const preferred =
      (wantsUrdu && urduVoice) ||
      (wantsUrdu && hiGenderMatch) ||
      (wantsUrdu && hiVoices[0]) ||
      enGenderMatch ||
      (gender === 'male' ? fallbackMale : fallbackFemale) ||
      voices[0];

    if (preferred) utterance.voice = preferred;

    // Only exaggerate pitch when we had no choice but to reuse the same
    // single voice for both genders (typically the lone hi-IN voice for
    // Urdu/Roman Urdu). If a genuinely distinct voice was found (e.g. real
    // English male/female voices), keep pitch natural — it's already
    // audibly different and doesn't need artificial shifting.
    const usingSharedFallbackVoice = wantsUrdu && !hiGenderMatch && !urduVoice;
    utterance.pitch = usingSharedFallbackVoice ? (gender === 'male' ? 0.75 : 1.35) : 1.0;
    utterance.rate = usingSharedFallbackVoice ? (gender === 'male' ? 0.88 : 0.95) : 0.92;

    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

let currentAudio: HTMLAudioElement | null = null;

/**
 * Primary TTS path: calls our backend, which uses Azure's real ur-PK-Asad /
 * ur-PK-Uzma neural voices. Falls back to the browser's speechSynthesis
 * (speakText above) if Azure is unavailable/unconfigured/rate-limited, so
 * voice playback never silently breaks.
 */
export async function speakTextAzure(
  text: string,
  onEnd?: () => void,
  options?: { language?: SupportedLanguage; gender?: 'female' | 'male'; mood?: string }
) {
  stopSpeaking();
  const cleanText = text.replace(/[*_#`~]/g, '');

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        language: options?.language ?? 'roman_urdu',
        gender: options?.gender ?? 'female',
        mood: options?.mood,
      }),
    });

    if (!response.ok) throw new Error(`TTS request failed: ${response.status}`);

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      if (onEnd) onEnd();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      if (onEnd) onEnd();
    };

    await audio.play();
  } catch (e) {
    console.warn('Azure TTS unavailable, falling back to browser voice:', e);
    speakText(text, onEnd, options);
  }
}
