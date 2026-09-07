// Azure Speech (Cognitive Services) text-to-speech.
// Uses ur-PK-AsadNeural / ur-PK-UzmaNeural for genuine Urdu/Roman Urdu voice
// output, and en-US voices for English — real distinct male/female voices,
// unlike the browser's built-in speechSynthesis which varies by device.

import { config } from '../config.js';

export type VoiceGender = 'male' | 'female';
export type TtsLanguage = 'roman_urdu' | 'english';

const VOICE_MAP: Record<TtsLanguage, Record<VoiceGender, string>> = {
  roman_urdu: { male: 'ur-PK-AsadNeural', female: 'ur-PK-UzmaNeural' },
  english: { male: 'en-US-GuyNeural', female: 'en-US-JennyNeural' },
};

/** Escapes text for safe embedding inside SSML. */
function escapeSsml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface SynthesizeOptions {
  text: string;
  language: TtsLanguage;
  gender: VoiceGender;
  mood?: string;
}

/** Parses "+8%" / "-1%" style strings into a plain number (8, -1). */
function parsePercent(value: string): number {
  const n = Number.parseFloat(value.replace('%', ''));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Maps the user's selected mood to gentle prosody adjustments. We deliberately
 * avoid Azure's <mstts:express-as style="..."> tags here — style support
 * varies by voice/locale and an unsupported style can fail the whole
 * request; plain rate/pitch/break tuning works on every neural voice.
 */
function getProsodyForMood(mood?: string): { rate: string; pitch: string; pauseMs: number } {
  switch (mood) {
    case 'Sad':
    case 'Overwhelmed':
    case 'Anxious':
      // Percentage relative-rate format — Azure's SSML parser reliably
      // supports "+N%"/"-N%" but does NOT reliably honor bare multipliers
      // like "0.92", which is why rate changes weren't audible before.
      return { rate: '+8%', pitch: '-1%', pauseMs: 150 };
    case 'Not great':
      return { rate: '+15%', pitch: '-1%', pauseMs: 120 };
    case 'Happy':
    case 'Okay':
    default:
      return { rate: '+25%', pitch: '+1%', pauseMs: 80 };
  }
}

/**
 * Calls Azure's TTS REST endpoint and returns raw MP3 audio bytes.
 * Throws if the Azure key/region are not configured or the call fails —
 * callers should catch this and fall back to the browser's own TTS.
 */
export async function synthesizeSpeech({ text, language, gender, mood }: SynthesizeOptions): Promise<Buffer> {
  if (!config.azureSpeechKey || !config.azureSpeechRegion) {
    throw new Error('Azure Speech is not configured');
  }

  const voiceName = VOICE_MAP[language]?.[gender] ?? VOICE_MAP.english[gender];
  const cleanText = text.replace(/[*_#`~]/g, '');
  const langCode = voiceName.startsWith('ur') ? 'ur-PK' : 'en-US';
  const { rate, pitch: moodPitch, pauseMs } = getProsodyForMood(mood);

  // A touch of extra pitch lift + slightly gentler pace makes the female
  // voice read as warmer/sweeter, layered on top of the mood adjustment
  // above rather than replacing it.
  /** Formats a number back into Azure's "+N%"/"-N%" percent format. */
function formatPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n}%`;
}

const pitch = gender === 'female' ? formatPercent(parsePercent(moodPitch) + 4) : moodPitch;
  const finalRate = gender === 'female' ? formatPercent(parsePercent(rate) - 5) : rate;

  // Insert a short breath-like pause after sentence-ending punctuation for a
  // warmer, less robotic cadence.
  const withPauses = escapeSsml(cleanText).replace(
    /([.!?۔])\s+/g,
    `$1<break time="${pauseMs}ms"/> `,
  );

  const ssml = `<speak version="1.0" xml:lang="${langCode}" xmlns:mstts="https://www.w3.org/2001/mstts"><voice name="${voiceName}"><prosody rate="${finalRate}" pitch="${pitch}">${withPauses}</prosody></voice></speak>`;

  const endpoint = `https://${config.azureSpeechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': config.azureSpeechKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-64kbitrate-mono-mp3',
      'User-Agent': 'hamnafas-app',
    },
    body: ssml,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Azure TTS request failed (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
