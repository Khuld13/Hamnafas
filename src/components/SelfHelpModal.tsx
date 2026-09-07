import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Wind,
  Sparkles,
  Compass,
  BookOpen,
  Headphones,
  ShieldAlert,
  Play,
  Pause,
  Check,
  ClipboardCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Waves,
  Moon,
  Fan,
  Music2,
  Flame,
} from 'lucide-react';
import { SELF_HELP_RESOURCES } from '../data/mockData';
import { SelfHelpResource, ScreeningType, SupportedLanguage, SoundscapeType, CareRoutineItem, CareStreakData } from '../types';
import { CareStreak } from './CareStreak';

interface SelfHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScreening?: (type: ScreeningType) => void;
  activeSound: string | null;
  onToggleSound: (type?: SoundscapeType) => void;
  onOpenCrisis: () => void;
  lang?: SupportedLanguage;
  careItems?: CareRoutineItem[];
  careStreak?: CareStreakData;
  onToggleCareItem?: (id: string) => void;
  initialExerciseId?: string | null;
}

const SOUND_OPTIONS: { id: SoundscapeType; icon: any; labelEn: string; labelRu: string }[] = [
  { id: 'rain', icon: CloudRain, labelEn: 'Soft Rain', labelRu: 'Barish' },
  { id: 'breeze', icon: Wind, labelEn: 'Cool Breeze', labelRu: 'Thandi Hawa' },
  { id: 'river', icon: Waves, labelEn: 'Flowing River', labelRu: 'Behta Pani' },
  { id: 'night', icon: Moon, labelEn: 'Quiet Night', labelRu: 'Khamosh Raat' },
  { id: 'fan', icon: Fan, labelEn: 'Steady Fan', labelRu: 'Pankha' },
  { id: 'tanpura', icon: Music2, labelEn: 'Gentle Tanpura', labelRu: 'Halka Tanpura' },
];

// One card at a time, framed as a gentle guided moment rather than a list of
// answer options — this used to render like a multiple-choice question.
const GROUNDING_STEPS = [
  { count: '5', emoji: '\ud83d\udc40', en: 'Name 5 things you can SEE around you right now.', ru: '5 cheezein jo aap abhi DEKH sakte hain.' },
  { count: '4', emoji: '\u270b', en: 'Notice 4 things you can physically TOUCH.', ru: '4 cheezein jo aap CHOO sakte hain.' },
  { count: '3', emoji: '\ud83d\udc42', en: 'Listen for 3 sounds you can HEAR.', ru: '3 aawazein jo aap SUN sakte hain.' },
  { count: '2', emoji: '\ud83d\udc43', en: 'Notice 2 things you can SMELL.', ru: '2 khushbuein jo aap SOONGH sakte hain.' },
  { count: '1', emoji: '\ud83d\ude4f', en: 'Find 1 thing you can TASTE, or one kind thought about yourself.', ru: '1 cheez jo CHAKHEIN, ya apne liye ek nayak khayal.' },
];

const fireConfetti = () => {
  confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 32,
    origin: { y: 0.5 },
    colors: ['#7ba8c9', '#a8c98a', '#f0b784', '#1e3a5f'],
  });
};

export const SelfHelpModal: React.FC<SelfHelpModalProps> = ({
  isOpen,
  onClose,
  onSelectScreening,
  activeSound,
  onToggleSound,
  onOpenCrisis,
  lang = 'roman_urdu',
  careItems,
  careStreak,
  onToggleCareItem,
  initialExerciseId,
}) => {
  const isRu = lang === 'roman_urdu';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialExerciseId) {
      setActiveExercise(initialExerciseId);
      if (initialExerciseId.startsWith('breathing')) {
        setSelectedCategory('breathing');
      } else if (initialExerciseId.startsWith('grounding')) {
        setSelectedCategory('grounding');
      } else if (initialExerciseId.startsWith('gratitude') || initialExerciseId.startsWith('journal')) {
        setSelectedCategory('journal');
      }
    } else if (!isOpen) {
      setActiveExercise(null);
    }
  }, [isOpen, initialExerciseId]);

  // Box Breathing state
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingCount, setBreathingCount] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathCycles, setBreathCycles] = useState(0);

  // Gratitude notes state
  const [gratitudeNotes, setGratitudeNotes] = useState<string[]>(['', '', '']);
  const [gratitudeSaved, setGratitudeSaved] = useState(false);

  // 5-4-3-2-1 Grounding step (0-indexed now, driving a single-card flow)
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingDone, setGroundingDone] = useState(false);

  // Box Breathing Timer Loop
  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingCount((prev) => {
          if (prev > 1) return prev - 1;
          setBreathingPhase((currPhase) => {
            if (currPhase === 'Inhale') return 'Hold';
            if (currPhase === 'Hold') return 'Exhale';
            if (currPhase === 'Exhale') return 'Rest';
            setBreathCycles((c) => c + 1);
            return 'Inhale';
          });
          return 4;
        });
      }, 1000);
    } else {
      setBreathingCount(4);
      setBreathingPhase('Inhale');
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  if (!isOpen) return null;

  const CATEGORIES = [
    { id: 'all', label: isRu ? 'Sab Tools' : 'All Tools' },
    { id: 'screening', label: isRu ? 'Clinical Checkups' : 'Clinical Screenings' },
    { id: 'breathing', label: isRu ? 'Saans' : 'Breathing' },
    { id: 'grounding', label: 'Grounding' },
    { id: 'journal', label: isRu ? 'Shukr Journal' : 'Micro-Gratitude' },
    { id: 'sounds', label: isRu ? 'Sukoon Aawazein' : 'Soundscapes' },
    { id: 'routine', label: isRu ? 'Rozana Aadatein' : 'Daily Habits' },
    { id: 'crisis', label: isRu ? 'Crisis Numbers' : 'Crisis Hotlines' },
  ];

  const filteredResources =
    selectedCategory === 'all' || selectedCategory === 'routine'
      ? SELF_HELP_RESOURCES
      : SELF_HELP_RESOURCES.filter((r) => r.category === selectedCategory);

  const markDoneAndCelebrate = (itemId: string) => {
    if (onToggleCareItem) onToggleCareItem(itemId);
    fireConfetti();
  };

  const handleStartResource = (resource: SelfHelpResource) => {
    if (resource.id === 'screening-phq9') {
      if (onSelectScreening) onSelectScreening('phq9');
      onClose();
    } else if (resource.id === 'screening-gad7') {
      if (onSelectScreening) onSelectScreening('gad7');
      onClose();
    } else if (resource.category === 'sounds') {
      onToggleSound('rain');
    } else if (resource.category === 'crisis') {
      onOpenCrisis();
    } else {
      if (resource.id === 'grounding-54321') {
        setGroundingStep(0);
        setGroundingDone(false);
      }
      setActiveExercise(resource.id);
    }
  };

  const handleSaveGratitude = () => {
    setGratitudeSaved(true);
    if (onToggleCareItem) onToggleCareItem('gratitude');
    fireConfetti();
    setTimeout(() => setGratitudeSaved(false), 3000);
  };

  const handleGroundingNext = () => {
    if (groundingStep < GROUNDING_STEPS.length - 1) {
      setGroundingStep((s) => s + 1);
    } else {
      setGroundingDone(true);
      if (onToggleCareItem) onToggleCareItem('exercise');
      fireConfetti();
    }
  };

  const currentGrounding = GROUNDING_STEPS[groundingStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a192f]/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#f8fbfe] rounded-3xl border border-[#d6e7f7] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white/95 border-b border-[#d8e7f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e3effa] text-[#1e3a5f] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#244f77]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#102a43]">{isRu ? 'Self-Help & Tools' : 'Self-Help & Tools'}</h3>
              <p className="text-xs text-[#627d98]">{isRu ? 'Thora halka mehsoos karne ke liye chhote tools.' : 'Simple tools to feel a little lighter.'}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-[#829ab1] hover:text-[#102a43] hover:bg-[#e4eff9] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-[#edf4fb] border-b border-[#d8e7f5] overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActiveExercise(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id ? 'bg-[#1e3a5f] text-white shadow-xs' : 'bg-white/80 hover:bg-white text-[#486581]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Active Exercise Views */}
          {activeExercise === 'breathing-box' && (
            <div className="p-6 rounded-2xl bg-white border border-[#d6e7f7] shadow-sm text-center space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#627d98] uppercase tracking-wider">Box Breathing</span>
                <button onClick={() => setActiveExercise(null)} className="text-xs text-[#486581] hover:underline cursor-pointer">
                  {isRu ? '\u2190 Wapas' : '\u2190 Back to tools'}
                </button>
              </div>

              <div className="py-6 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ scale: breathingPhase === 'Inhale' || breathingPhase === 'Hold' ? 1.15 : 0.9 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  className={`relative flex items-center justify-center rounded-full w-44 h-44 ${
                    breathingPhase === 'Inhale'
                      ? 'bg-[#d8eaf7] shadow-[0_0_40px_rgba(123,168,201,0.4)]'
                      : breathingPhase === 'Hold'
                      ? 'bg-[#c8e2f6] shadow-[0_0_30px_rgba(100,150,190,0.3)]'
                      : breathingPhase === 'Exhale'
                      ? 'bg-[#e4effa] shadow-[0_0_20px_rgba(123,168,201,0.2)]'
                      : 'bg-[#edf5fc]'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#244f77] block">{breathingPhase}</span>
                    <span className="text-3xl font-bold text-[#102a43]">{breathingCount}s</span>
                  </div>
                </motion.div>
                {breathCycles > 0 && (
                  <p className="text-[11px] text-[#829ab1] mt-3">
                    {isRu ? `${breathCycles} cycle mukammal` : `${breathCycles} cycle${breathCycles > 1 ? 's' : ''} completed`}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[#486581] max-w-sm mx-auto">
                  {isRu
                    ? 'Naak se saans lein (4s), rokein (4s), aaram se chhorein (4s), thora ruk jayein (4s).'
                    : 'Inhale gently (4s), hold without strain (4s), exhale smoothly (4s), rest (4s).'}
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsBreathingActive(!isBreathingActive)}
                    className="px-6 py-2.5 rounded-full bg-[#1e3a5f] hover:bg-[#102a43] text-white text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isBreathingActive ? (isRu ? 'Ruk Jayein' : 'Pause') : isRu ? 'Shuru Karein' : 'Start'}</span>
                  </button>
                  {breathCycles >= 1 && (
                    <button
                      onClick={() => markDoneAndCelebrate('exercise')}
                      className="px-5 py-2.5 rounded-full bg-[#eaf3e4] hover:bg-[#dcecd2] text-[#3c5535] text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRu ? 'Aaj Ke Liye Done' : 'Done for today'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeExercise === 'breathing-478' && (
            <div className="p-6 rounded-2xl bg-white border border-[#d6e7f7] shadow-sm text-center space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#627d98] uppercase tracking-wider">4-7-8 Relaxing Breath</span>
                <button onClick={() => setActiveExercise(null)} className="text-xs text-[#486581] hover:underline cursor-pointer">
                  {isRu ? '\u2190 Wapas' : '\u2190 Back to tools'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 py-4">
                <div className="p-4 rounded-xl bg-[#e6f2fb] border border-[#d2e4f3]">
                  <span className="text-2xl font-bold text-[#1e3a5f] block">4s</span>
                  <span className="text-xs font-medium text-[#486581]">{isRu ? 'Andar (Naak se)' : 'Inhale'}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#d8ebf9] border border-[#c3ddf3]">
                  <span className="text-2xl font-bold text-[#1e3a5f] block">7s</span>
                  <span className="text-xs font-medium text-[#486581]">{isRu ? 'Rokein' : 'Hold'}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#e6f2fb] border border-[#d2e4f3]">
                  <span className="text-2xl font-bold text-[#1e3a5f] block">8s</span>
                  <span className="text-xs font-medium text-[#486581]">{isRu ? 'Bahir' : 'Exhale'}</span>
                </div>
              </div>

              <p className="text-xs text-[#486581] max-w-sm mx-auto">
                {isRu
                  ? '4 cycles try karein sone se pehle ya jab zehan mein bohot sochein chal rahi hon.'
                  : 'Try 4 slow cycles before sleep, or whenever your thoughts feel like they\u2019re racing.'}
              </p>

              <button
                onClick={() => markDoneAndCelebrate('exercise')}
                className="mx-auto px-5 py-2.5 rounded-full bg-[#eaf3e4] hover:bg-[#dcecd2] text-[#3c5535] text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isRu ? 'Aaj Ke Liye Done' : 'Done for today'}</span>
              </button>
            </div>
          )}

          {/* Redesigned Grounding: single guided card + progress dots, not a clickable MCQ list */}
          {activeExercise === 'grounding-54321' && (
            <div className="p-6 rounded-2xl bg-white border border-[#d6e7f7] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#627d98] uppercase tracking-wider">5-4-3-2-1 Grounding</span>
                <button onClick={() => setActiveExercise(null)} className="text-xs text-[#486581] hover:underline cursor-pointer">
                  {isRu ? '\u2190 Wapas' : '\u2190 Back to tools'}
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2">
                {GROUNDING_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === groundingStep && !groundingDone ? 'w-6 bg-[#1e3a5f]' : idx < groundingStep || groundingDone ? 'w-1.5 bg-[#7ba8c9]' : 'w-1.5 bg-[#d8e7f5]'
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {!groundingDone ? (
                  <motion.div
                    key={groundingStep}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.28 }}
                    className="text-center py-6 px-4 rounded-2xl bg-gradient-to-b from-[#edf5fc] to-white border border-[#d8e7f5]"
                  >
                    <div className="text-5xl mb-3">{currentGrounding.emoji}</div>
                    <div className="text-4xl font-bold text-[#1e3a5f] mb-2">{currentGrounding.count}</div>
                    <p className="text-sm text-[#334e68] max-w-xs mx-auto leading-relaxed">
                      {isRu ? currentGrounding.ru : currentGrounding.en}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#eaf3e4] text-[#4c6b43] flex items-center justify-center mx-auto mb-3 animate-pop-in">
                      <Check className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold text-[#102a43]">
                      {isRu ? 'Zabardast! Aap yahin, is lamhe mein hain.' : 'Nicely done. You\u2019re right here, in this moment.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!groundingDone ? (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setGroundingStep((s) => Math.max(0, s - 1))}
                    disabled={groundingStep === 0}
                    className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1 text-[#486581] hover:bg-[#edf5fc] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{isRu ? 'Peechay' : 'Back'}</span>
                  </button>
                  <button
                    onClick={handleGroundingNext}
                    className="px-6 py-2.5 rounded-full bg-[#1e3a5f] hover:bg-[#102a43] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>{groundingStep === GROUNDING_STEPS.length - 1 ? (isRu ? 'Mukammal Karein' : 'Finish') : isRu ? 'Agla' : 'Next'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setGroundingStep(0);
                      setGroundingDone(false);
                    }}
                    className="px-5 py-2 rounded-full bg-[#edf5fc] hover:bg-[#dcebf8] text-[#244f77] text-xs font-semibold cursor-pointer"
                  >
                    {isRu ? 'Dobara Karein' : 'Do it again'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeExercise === 'gratitude-journal' && (
            <div className="p-6 rounded-2xl bg-white border border-[#d6e7f7] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#627d98] uppercase tracking-wider">{isRu ? 'Shukr-Guzari Journal' : 'Daily Micro-Gratitude'}</span>
                <button onClick={() => setActiveExercise(null)} className="text-xs text-[#486581] hover:underline cursor-pointer">
                  {isRu ? '\u2190 Wapas' : '\u2190 Back to tools'}
                </button>
              </div>

              <p className="text-xs text-[#486581]">
                {isRu ? 'Aaj ke 3 chhote lamhaat likhein jin se sukoon ya araam mehsoos hua:' : 'Jot down 3 small moments that brought relief, comfort, or a bit of peace today:'}
              </p>

              <div className="space-y-2.5">
                {gratitudeNotes.map((note, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#627d98] w-5">#{idx + 1}</span>
                    <input
                      type="text"
                      placeholder={isRu ? `Lamha ${idx + 1} (jaise: garam chai, thandi hawa...)` : `Moment ${idx + 1} (e.g. a warm cup of chai, quiet sunset...)`}
                      value={note}
                      onChange={(e) => {
                        const updated = [...gratitudeNotes];
                        updated[idx] = e.target.value;
                        setGratitudeNotes(updated);
                      }}
                      className="flex-1 px-3.5 py-2 bg-[#f4f8fc] border border-[#cde0f0] rounded-xl text-xs text-[#102a43] focus:border-[#7ba8c9] focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-emerald-700 font-medium">
                  {gratitudeSaved ? (isRu ? '\u2713 Aaj ke liye save ho gaya!' : '\u2713 Saved for today!') : ''}
                </span>
                <button
                  onClick={handleSaveGratitude}
                  className="px-5 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#102a43] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {isRu ? 'Save Karein' : 'Save Reflection'}
                </button>
              </div>
            </div>
          )}

          {/* Soundscapes grid — several soothing options since one sound doesn't suit everyone */}
          {!activeExercise && selectedCategory === 'sounds' && (
            <div className="space-y-3">
              <p className="text-xs text-[#829ab1] px-1">
                {isRu ? 'Har insaan ke liye alag aawaz sukoon deti hai — kuch try karein.' : 'What feels calming differs from person to person \u2014 try a few.'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SOUND_OPTIONS.map((s) => {
                  const Icon = s.icon;
                  const active = activeSound === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => onToggleSound(s.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        active ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white shadow-md' : 'bg-white border-[#cbdbe8] text-[#244f77] hover:border-[#8cb7db]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${active ? 'animate-pulse' : ''}`} />
                      <div>
                        <p className="text-sm font-bold">{s.labelEn}</p>
                        <p className="text-[11px] opacity-80">{s.labelRu}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily Habits tab — the guilt-free streak widget, full view */}
          {!activeExercise && selectedCategory === 'routine' && careItems && careStreak && onToggleCareItem && (
            <div className="p-5 rounded-2xl bg-white border border-[#d6e7f7] shadow-xs">
              <CareStreak items={careItems} data={careStreak} onToggleItem={onToggleCareItem} lang={lang} />
            </div>
          )}

          {/* Regular Resource List (screening, breathing, grounding, journal, crisis) */}
          {!activeExercise && selectedCategory !== 'sounds' && selectedCategory !== 'routine' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredResources
                .filter((r) => r.category !== 'sounds')
                .map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleStartResource(res)}
                    className="p-4 rounded-2xl bg-white border border-[#d6e7f7] hover:border-[#8cb7db] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#627d98] px-2 py-0.5 rounded-md bg-[#edf5fc]">
                          {res.category}
                        </span>
                        {res.duration && <span className="text-[11px] text-[#829ab1] font-medium">{res.duration}</span>}
                      </div>

                      <h4 className="text-sm font-bold text-[#102a43] group-hover:text-[#1e3a5f] transition-colors">{res.title}</h4>

                      {res.titleRomanUrdu && <p className="text-[11px] text-[#557e9d] italic mb-1">{res.titleRomanUrdu}</p>}

                      <p className="text-xs text-[#486581] leading-relaxed line-clamp-2">{res.description}</p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-[#f0f4f8] flex items-center justify-between text-xs font-semibold text-[#1e3a5f]">
                      <span>{isRu ? 'Kholein' : 'Open Tool'}</span>
                      <span className="group-hover:translate-x-1 transition-transform">{'\u2192'}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
