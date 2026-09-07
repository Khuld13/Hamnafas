export type MoodType = 'Happy' | 'Okay' | 'Not great' | 'Sad' | 'Anxious' | 'Overwhelmed';

export type SupportedLanguage = 'roman_urdu' | 'english';

export interface MoodOption {
  id: MoodType;
  label: string;
  labelRomanUrdu: string;
  labelUrdu?: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  description: string;
  descriptionRomanUrdu: string;
  initialAssistantMessage: string;
  initialAssistantMessageRomanUrdu: string;
  initialAssistantMessageUrdu?: string;
}

export type ScreeningType = 'phq9' | 'gad7';

export interface ScreeningOption {
  value: number; // 0, 1, 2, 3
  labelEn: string;
  labelRomanUrdu: string;
  labelUrdu?: string;
}

export interface ScreeningQuestion {
  id: number;
  textEn: string;
  textRomanUrdu: string;
  textUrdu?: string;
}

export interface ScreeningResult {
  id: string;
  type: ScreeningType;
  date: string;
  score: number;
  maxScore: number;
  severityLevel: 'Minimal' | 'Mild' | 'Moderate' | 'Moderately Severe' | 'Severe';
  severityLevelRomanUrdu: string;
  severityLevelUrdu?: string;
  summaryEn: string;
  summaryRomanUrdu: string;
  summaryUrdu?: string;
  recommendations: string[];
  recommendationsRomanUrdu: string[];
  crisisTriggered?: boolean;
}

export type RiskTier = 'none' | 'moderate' | 'high';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  moodTag?: MoodType;
  suggestedPrompts?: string[];
  isCrisisAlert?: boolean;
  riskTier?: RiskTier;
  screeningResult?: ScreeningResult;
  language?: SupportedLanguage;
}

export interface Conversation {
  id: string;
  serverId?: string; // real backend conversation id (undefined until first AI reply)
  title: string;
  mood?: MoodType;
  language?: SupportedLanguage;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  pinned?: boolean;
  activeScreening?: ScreeningType;
}

export interface UserProfile {
  name: string;
  initial: string;
  preferredLanguage: SupportedLanguage;
  theme: 'day' | 'evening' | 'calm';
  aiTone: 'gentle' | 'practical' | 'default';
  soundEnabled: boolean;
  voiceGender?: 'female' | 'male'; // TTS voice preference
  backendApiUrl?: string; // Optional override for the Express /api/chat backend URL (defaults to same-origin)
  alibabaCloudReady?: boolean;
  screeningHistory?: ScreeningResult[];
}

export interface SelfHelpResource {
  id: string;
  title: string;
  titleRomanUrdu?: string;
  category: 'screening' | 'breathing' | 'grounding' | 'journal' | 'sounds' | 'crisis';
  description: string;
  descriptionRomanUrdu?: string;
  duration?: string;
  iconName: string;
}

export interface CrisisPartnerResource {
  id: string;
  name: string;
  serviceEn: string;
  serviceRomanUrdu: string;
  phone: string;
  availability: string;
  website?: string;
  tollFree?: boolean;
  emergencyType?: 'psychiatric' | 'general_helpline' | 'immediate_rescue';
}

export type LocalProviderType = 'psychiatrist' | 'psychologist' | 'counseling_center' | 'helpline_org';

export interface LocalSupportProvider {
  id: string;
  name: string;
  type: LocalProviderType;
  serviceEn: string;
  serviceRomanUrdu: string;
  phone: string;
  city: string;
  availability: string;
  website?: string;
  verified: boolean;
}

export interface LocalSupportDirectory {
  nationwide: LocalSupportProvider[];
  city: string | null;
  localProviders: LocalSupportProvider[];
  supportedCities: string[];
}

export interface AuthUser {
  userId: string;
  email: string;
}

// Soothing sounds — kept intentionally varied since what feels calming
// differs from person to person (some prefer nature sounds, some prefer
// steady drone/white-noise, some prefer a familiar instrumental tone).
export type SoundscapeType = 'rain' | 'breeze' | 'river' | 'night' | 'fan' | 'tanpura';

export interface CareRoutineItem {
  id: string;
  emoji: string;
  labelEn: string;
  labelRomanUrdu: string;
}

// Guilt-free daily habit tracking: we only ever count up (streak, total),
// never surface "you broke your streak" messaging. Missing a day simply
// resets the counter quietly next time the person returns.
export interface CareStreakData {
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  completedToday: string[]; // CareRoutineItem ids done today
  totalCompletions: number;
}
