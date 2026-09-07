// Text-to-speech route: proxies to Azure Speech so the API key never
// reaches the browser. Roman Urdu is transliterated to real Urdu script
// first, because Azure's ur-PK voices can't read Latin-script Urdu.

import { Router } from 'express';
import type { Request, Response } from 'express';
import { synthesizeSpeech } from '../services/azureTts.js';
import type { TtsLanguage, VoiceGender } from '../services/azureTts.js';
import { transliterateToUrduScript } from '../services/dashscope.js';

const router = Router();

interface TtsRequestBody {
  text?: string;
  language?: TtsLanguage;
  gender?: VoiceGender;
  mood?: string;
}

router.post('/', async (req: Request, res: Response) => {
  const { text, language, gender, mood } = req.body as TtsRequestBody;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const resolvedLanguage = language ?? 'roman_urdu';
  let speechText = text.slice(0, 2000); // guard against runaway character usage

  // Roman Urdu -> Urdu script conversion. If this fails (e.g. DashScope
  // quota/network issue), we fall through and speak the original romanized
  // text — imperfect, but better than a 503 with no audio at all.
  if (resolvedLanguage === 'roman_urdu') {
    try {
      speechText = await transliterateToUrduScript(speechText);
    } catch (error) {
      console.warn('[tts] transliteration failed, speaking original text as-is:', error);
    }
  }

  try {
    const audioBuffer = await synthesizeSpeech({
      text: speechText,
      language: resolvedLanguage,
      gender: gender ?? 'female',
      mood,
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (error) {
    console.error('[tts] synthesis failed:', error);
    // 503 tells the frontend "unavailable, please fall back" rather than a hard error
    res.status(503).json({ error: 'Voice synthesis unavailable' });
  }
});

export default router;
