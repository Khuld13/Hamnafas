import { CareRoutineItem } from '../types';

// Intentionally small (4 items) and low-pressure. This is a self-reported
// checklist, not a monitored task list — the point is a tiny sense of
// momentum, never guilt for missing a day.
export const DAILY_CARE_ITEMS: CareRoutineItem[] = [
  {
    id: 'checkin',
    emoji: '👋',
    labelEn: 'Said hi & shared a mood',
    labelRomanUrdu: 'Mood batayein ya salaam karein',
  },
  {
    id: 'exercise',
    emoji: '🌬️',
    labelEn: 'Did one calming exercise',
    labelRomanUrdu: 'Ek calming exercise ki',
  },
  {
    id: 'gratitude',
    emoji: '✨',
    labelEn: 'Noted one good moment',
    labelRomanUrdu: 'Ek achi baat likhi',
  },
  {
    id: 'sound',
    emoji: '🎧',
    labelEn: 'Took a minute of quiet sound',
    labelRomanUrdu: 'Aik minute sukoon se suna',
  },
];
