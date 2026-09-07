import React from 'react';
import {
  ArrowRight,
  ChevronRight,
  Heart,
  PanelLeftOpen,
  Volume2,
  VolumeX,
  ClipboardCheck,
  ShieldAlert,
  Sparkles,
  Globe,
  Wind,
  Compass,
  BookOpen,
  Home as HomeIcon,
  CloudRain,
  Waves,
  Moon,
  Fan,
  Music2,
  UserCircle2,
  Flame,
} from 'lucide-react';
import { MoodType, UserProfile, SupportedLanguage, AuthUser, CareRoutineItem, CareStreakData, SoundscapeType } from '../types';
import { MoodSelector } from './MoodSelector';
import { CareStreak } from './CareStreak';
import cozySceneImg from '../assets/images/hamnafas_cozy_scene_1788081010760.jpg';

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Kept to one short, plain-language line per idea — no stacked
// English + Roman Urdu + clinical paragraph. Shown in whichever
// language the person has already chosen, same as the hero copy.
const HOW_IT_WORKS_STEPS = [
  {
    icon: HomeIcon,
    en: 'No account needed — start talking whenever you need a listening ear.',
    ru: 'Koi account nahi chahiye — jab bhi baat karni ho, foran shuru karein.',
  },
  {
    icon: Globe,
    en: 'Here for the everyday moments between doctor visits — daily check-ins, coping exercises, and someone to talk to.',
    ru: 'Doctor ke dauron ke darmiyan rozmarra lamhon ke liye — rozana check-in, pur-sukoon mashqein aur guftagu.',
  },
  {
    icon: Heart,
    en: "Works alongside a doctor's care, not instead of it — a gentle companion for your wellbeing journey.",
    ru: 'Doctor ya therapist ki dekhbhal ke sath sathi ban kar kaam karta hai — unki jagah nahi leta.',
  },
  {
    icon: ShieldAlert,
    en: 'We quietly watch for serious risk and connect you with verified human helplines and doctors if needed.',
    ru: 'Shadeed takleef par khamoshi se hifazat karta hai aur foran verified insani helplines se jorta hai.',
  },
];

interface ExercisePreview {
  icon: any;
  en: string;
  ru: string;
  durationEn: string;
  accent: 'blue' | 'sage' | 'peach';
  exerciseId: string;
}

const EXERCISE_PREVIEWS: ExercisePreview[] = [
  { icon: Wind, en: 'Box Breathing', ru: 'Box Breathing', durationEn: '2 min', accent: 'blue', exerciseId: 'breathing-box' },
  { icon: Sparkles, en: 'Slow Breath for Sleep', ru: 'Neend Wali Saans', durationEn: '3 min', accent: 'peach', exerciseId: 'breathing-478' },
  { icon: Compass, en: 'Notice What\u2019s Around You', ru: 'Ird-gird Dhyan', durationEn: '4 min', accent: 'sage', exerciseId: 'grounding-54321' },
  { icon: BookOpen, en: 'One Good Thing Today', ru: 'Aaj ki Achi Baat', durationEn: '2 min', accent: 'blue', exerciseId: 'gratitude-journal' },
];

const ACCENT_STYLES: Record<ExercisePreview['accent'], string> = {
  blue: 'bg-[#e3effa] text-[#2b5984]',
  sage: 'bg-[#e9f0e3] text-[#4c6b43]',
  peach: 'bg-[#faead9] text-[#b8703a]',
};

const CALMING_REFLECTIONS = [
  { en: "You don't have to have it figured out today.", ru: 'Aaj sab kuch samajhna zaroori nahi.' },
  { en: "Rest isn't something you earn. It's something you're allowed.", ru: 'Aaraam kamana nahi parta, yeh haq hai.' },
  { en: 'Small steps still count as moving forward.', ru: 'Chhote qadam bhi aage barhna hi hote hain.' },
];

interface SoundOption {
  id: SoundscapeType;
  icon: any;
  labelEn: string;
  labelRu: string;
}

const SOUND_OPTIONS: SoundOption[] = [
  { id: 'rain', icon: CloudRain, labelEn: 'Soft Rain', labelRu: 'Barish' },
  { id: 'breeze', icon: Wind, labelEn: 'Cool Breeze', labelRu: 'Thandi Hawa' },
  { id: 'river', icon: Waves, labelEn: 'Flowing River', labelRu: 'Behta Pani' },
  { id: 'night', icon: Moon, labelEn: 'Quiet Night', labelRu: 'Khamosh Raat' },
  { id: 'fan', icon: Fan, labelEn: 'Steady Fan', labelRu: 'Pankha' },
  { id: 'tanpura', icon: Music2, labelEn: 'Gentle Tanpura', labelRu: 'Halka Tanpura' },
];

interface HomeViewProps {
  userProfile: UserProfile;
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
  onStartChat: () => void;
  onOpenSelfHelp: (exerciseId?: string) => void;
  onOpenScreening: () => void;
  onOpenCrisis: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  activeSound: string | null;
  onToggleSound: (type?: SoundscapeType) => void;
  currentLanguage: SupportedLanguage;
  onChangeLanguage?: (lang: SupportedLanguage) => void;
  authUser?: AuthUser | null;
  onOpenAuth?: () => void;
  careItems?: CareRoutineItem[];
  careStreak?: CareStreakData;
  onToggleCareItem?: (id: string) => void;
  onOpenProgressReport?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  userProfile,
  selectedMood,
  onSelectMood,
  onStartChat,
  onOpenSelfHelp,
  onOpenScreening,
  onOpenCrisis,
  onToggleSidebar,
  sidebarOpen,
  activeSound,
  onToggleSound,
  currentLanguage,
  authUser,
  onOpenAuth,
  careItems,
  careStreak,
  onToggleCareItem,
  onOpenProgressReport,
}) => {
  const isRu = currentLanguage === 'roman_urdu';

  return (
    <div className="relative min-h-full flex-1 flex flex-col justify-between overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#d9ebf8] via-[#e7f2fc] to-[#eef6fb]">
      {/* Delicate watercolor botanical branch in top left */}
      <div className="absolute top-0 left-0 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none opacity-40 z-10">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#4a7298]">
          <path d="M-20 -20 C 40 40, 80 70, 130 110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M30 20 C 45 10, 60 25, 45 40 C 30 35, 25 25, 30 20 Z" fill="#6d9bbd" opacity="0.75" />
          <path d="M60 45 C 80 40, 90 60, 75 75 C 60 70, 55 55, 60 45 Z" fill="#5f8fae" opacity="0.8" />
          <path d="M95 75 C 115 65, 125 90, 110 105 C 95 100, 85 85, 95 75 Z" fill="#7ba8c9" opacity="0.75" />
          <path d="M45 55 C 30 70, 45 90, 60 85 C 65 70, 55 60, 45 55 Z" fill="#5584a4" opacity="0.7" />
          <path d="M80 90 C 70 110, 90 125, 105 115 C 105 100, 95 90, 80 90 Z" fill="#6896b7" opacity="0.65" />
          <path d="M120 105 C 140 100, 150 120, 135 135 C 120 130, 115 115, 120 105 Z" fill="#507c9b" opacity="0.75" />
        </svg>
      </div>

      {/* Atmospheric Cozy Room Artwork Background — confined to the hero only */}
      <div className="absolute top-0 right-0 w-full h-[640px] lg:w-[48%] xl:w-[50%] pointer-events-none overflow-hidden select-none z-0">
        <img
          src={cozySceneImg}
          alt="Cozy armchair and serene arched window"
          className="w-full h-full object-cover object-center lg:object-left opacity-85 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#d9ebf8] via-[#e5f1fc]/80 to-transparent w-full lg:w-[35%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#eef6fb] via-transparent to-transparent h-40 bottom-0" />
      </div>

      {/* Floating Sparkle Ambient Particles */}
      <div className="absolute top-0 left-0 right-0 h-[640px] pointer-events-none z-10 overflow-hidden">
        <div className="absolute top-[18%] left-[62%] w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_8px_white] animate-pulse" />
        <div className="absolute top-[28%] left-[78%] w-2 h-2 rounded-full bg-white/90 shadow-[0_0_10px_white] animate-ping opacity-60" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[42%] left-[68%] w-1 h-1 rounded-full bg-white/70 shadow-[0_0_6px_white] animate-pulse" style={{ animationDuration: '3s' }} />
      </div>

      {/* Top Navbar Header — single row layout */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Sidebar Opener & Crisis Quick Link */}
        <div className="flex items-center gap-2 shrink-0">
          {!sidebarOpen && (
            <button
              id="open-sidebar-main-btn"
              onClick={onToggleSidebar}
              className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-[#1e3a5f] shadow-xs border border-white/80 transition-all cursor-pointer"
              title="Open menu"
            >
              <PanelLeftOpen className="w-5 h-5 stroke-[1.8]" />
            </button>
          )}

          <button
            onClick={onOpenCrisis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50/90 hover:bg-rose-100 text-rose-800 border border-rose-200/80 text-xs font-semibold shadow-xs transition-all cursor-pointer backdrop-blur-xs shrink-0"
            title="Pakistan 24/7 Crisis Helplines"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">Pakistani Crisis Support</span>
            <span className="md:hidden">Helplines</span>
          </button>
        </div>

        {/* Center: Section Jump Nav — moved upward into the same line */}
        <nav className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap px-1">
          {[
            { id: 'home', label: 'Home' },
            { id: 'how-it-works', label: 'How It Works' },
            { id: 'exercises', label: 'Exercises' },
            { id: 'streak', label: isRu ? 'Silsila' : 'Your Streak' },
            { id: 'entertainment', label: 'Unwind' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/80 hover:bg-white text-slate-800 border border-white/90 shadow-xs transition-all cursor-pointer shrink-0"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Immediate Streak Pill, Ambient Sound, Sign In */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {careStreak && (
            <button
              onClick={() => scrollToSection('streak')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all shadow-xs border cursor-pointer shrink-0 ${
                careStreak.streak > 0
                  ? 'bg-[#faead9]/90 text-[#b8703a] border-[#f0cba0] hover:bg-[#faead9]'
                  : 'bg-white/80 text-[#627d98] border-white/90 hover:bg-white'
              }`}
              title={isRu ? 'Apna daily care silsila dekhein' : 'View your daily care streak'}
            >
              <Flame className={`w-3.5 h-3.5 ${careStreak.streak > 0 ? 'text-[#b8703a] animate-flame' : 'text-[#829ab1]'}`} />
              <span className="text-xs font-semibold">
                {careStreak.streak > 0
                  ? isRu
                    ? `${careStreak.streak} din ka silsila`
                    : `${careStreak.streak} day streak`
                  : isRu
                  ? '0 din ka silsila'
                  : '0 day streak'}
              </span>
            </button>
          )}

          {/* Ambient Sound Toggle Button */}
          <button
            id="ambient-sound-toggle-btn"
            onClick={() => onToggleSound()}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-xs border cursor-pointer shrink-0 ${
              activeSound ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white/75 hover:bg-white text-[#334e68] border-white/80'
            }`}
            title={activeSound ? `Ambient sound active (${activeSound}) - Click to mute` : 'Turn on a relaxing sound'}
          >
            {activeSound ? (
              <div className="flex items-center gap-1.5 px-1">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span className="text-xs font-medium capitalize hidden lg:inline">{activeSound}</span>
              </div>
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Sign In / Account Avatar — visible top-right for everyone, not just via sidebar */}
          <button
            id="home-sign-in-btn"
            onClick={onOpenAuth}
            className={
              authUser
                ? "w-8 h-8 rounded-full bg-[#1e3a5f] hover:bg-[#102a43] text-white font-bold flex items-center justify-center text-xs shadow-xs transition-all cursor-pointer ring-2 ring-white/60 shrink-0"
                : "flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full bg-[#1e3a5f] hover:bg-[#102a43] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
            }
            title={authUser ? authUser.email : 'Sign in to keep your history across devices'}
            aria-label={authUser ? `Account for ${authUser.email}` : 'Sign In'}
          >
            {authUser ? (
              <span>{authUser.email.charAt(0).toUpperCase()}</span>
            ) : (
              <>
                <UserCircle2 className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Center Stage */}
      <main id="home" className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-3 max-w-4xl mx-auto w-full text-center">
        {/* Main Emotional Headline */}
        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#1e3a5f] tracking-tight leading-tight">
            {currentLanguage === 'roman_urdu' ? 'Khush Amdeed,' : 'Welcome back,'}
          </h1>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif italic font-normal text-[#14324f] tracking-tight leading-tight">
            {currentLanguage === 'roman_urdu' ? 'Hamnafas aapke sath hai.' : 'Hamnafas is here for you.'}
          </h2>

          <p className="text-sm sm:text-base font-serif italic text-[#3b668f] max-w-xl mx-auto pt-1 leading-relaxed">
            &ldquo;Hamnafas — a companion to breathe with, before you&apos;re ready to talk to anyone else.&rdquo;
          </p>

          <div className="flex items-center justify-center gap-3 pt-2 pb-1">
            <div className="h-[1px] w-12 sm:w-16 bg-[#a7c5df]/60" />
            <Heart className="w-3.5 h-3.5 text-[#5e8db7] fill-[#5e8db7]/20" />
            <div className="h-[1px] w-12 sm:w-16 bg-[#a7c5df]/60" />
          </div>
        </div>

        {/* Subtitle & Check-in Prompt */}
        <div className="space-y-1 mb-4 sm:mb-5">
          <h3 className="text-xl sm:text-2xl font-semibold text-[#102a43]">
            {currentLanguage === 'roman_urdu' ? 'Aaj aap kaisa mehsoos kar rahe hain?' : 'How are you feeling today?'}
          </h3>
          <p className="text-base text-[#486581] font-normal">
            {currentLanguage === 'roman_urdu' ? 'Lafzon mein bayan karna zaroori nahi, bas apna mood chunein.' : 'You don\u2019t have to put it into words.'}
          </p>
        </div>

        {/* 6 Mood Cards in Horizontal Row */}
        <div className="w-full max-w-2xl mb-5 sm:mb-6">
          <MoodSelector selectedMood={selectedMood} onSelectMood={onSelectMood} />
        </div>

        {/* Action Banner: "Talk to Hamnafas" — Warm Peach accent border to bring the 5th palette color into play */}
        <div className="w-full max-w-2xl bg-white/75 backdrop-blur-md border border-[#f0cba0]/70 rounded-2xl p-4 sm:p-4.5 shadow-[0_8px_30px_rgba(40,80,120,0.07)] flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:bg-white/85">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#faead9] text-[#b8703a] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill="#e8a668" fillOpacity="0.4" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-[#102a43]">
                {currentLanguage === 'roman_urdu' ? 'Har waqt theek hona zaroori nahi.' : 'It\u2019s okay to not be okay.'}
              </h4>
              <p className="text-sm sm:text-base text-[#486581]">
                {currentLanguage === 'roman_urdu' ? 'Baat karne se dil halka hota hai. Hum aapki raftaar se chalenge.' : 'Talking helps. We\u2019ll go at your pace.'}
              </p>
            </div>
          </div>

          <button
            id="talk-to-hamnafas-main-btn"
            onClick={onStartChat}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1e3a5f] hover:bg-[#102a43] active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer shrink-0"
          >
            <span>Talk to Hamnafas</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Secondary Action Bar: PHQ-9 / GAD-7 Screening & Self-Help */}
        <div className="mt-4 w-full max-w-2xl flex flex-wrap items-center justify-center gap-3">
          <button
            id="take-screening-btn"
            onClick={onOpenScreening}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-[#1e3a5f] border border-[#cbdbe8] hover:border-[#8cb7db] text-xs font-semibold shadow-xs transition-all cursor-pointer backdrop-blur-xs"
          >
            <ClipboardCheck className="w-4 h-4 text-[#2b5984]" />
            <span>PHQ-9 & GAD-7 Clinical Screening</span>
          </button>

          <button
            id="explore-resources-btn"
            onClick={() => onOpenSelfHelp()}
            className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/60 hover:bg-white/90 text-[#334e68] text-xs font-medium transition-all cursor-pointer border border-[#d6e7f7]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5e8db7]" />
            <span>Self-Help & Calming Tools</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-[#5e8db7]" />
          </button>
        </div>
      </main>

      {/* Gentle divider instead of a hard color band */}
      <div className="relative z-20 max-w-md mx-auto w-full h-px bg-gradient-to-r from-transparent via-[#a7c5df]/50 to-transparent mt-10" />

      {/* ================= How Hamnafas Works ================= */}
      <section id="how-it-works" className="relative z-20 w-full px-6 py-12">
        <div className="max-w-5xl mx-auto text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1e3a5f] mb-2">
            {isRu ? 'Hamnafas Kaam Kaise Karta Hai' : 'How Hamnafas Works'}
          </h2>
          <p className="text-sm text-[#486581]">{isRu ? 'Chaar baatein, shuru karne se pehle.' : 'Four things worth knowing before you start talking.'}</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOW_IT_WORKS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white/85 border border-[#d6e7f7] shadow-xs flex gap-3.5 items-center">
                <div className="w-10 h-10 rounded-xl bg-[#e3effa] text-[#2b5984] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm text-[#334e68] leading-snug text-left">{isRu ? step.ru : step.en}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="relative z-20 max-w-md mx-auto w-full h-px bg-gradient-to-r from-transparent via-[#bcd6ac]/50 to-transparent" />

      {/* ================= Exercises ================= */}
      <section id="exercises" className="relative z-20 w-full px-6 py-12">
        <div className="max-w-5xl mx-auto text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#102a43] mb-2">{isRu ? 'Chhoti Exercises' : 'Quick Exercises'}</h2>
          <p className="text-sm text-[#486581]">{isRu ? 'Kuch minute bhi bohot farq daal sakte hain. Ek chun kar abhi try karein.' : 'A few minutes can shift a lot. Pick one and try it now.'}</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {EXERCISE_PREVIEWS.map((ex, idx) => {
            const Icon = ex.icon;
            return (
              <button
                key={idx}
                onClick={() => onOpenSelfHelp(ex.exerciseId)}
                className="group p-4 rounded-2xl bg-white border border-[#d6e7f7] hover:border-[#8cb7db] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left cursor-pointer flex flex-col gap-2"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${ACCENT_STYLES[ex.accent]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#102a43] leading-snug">{isRu ? ex.ru : ex.en}</h4>
                <p className="text-[10px] text-[#829ab1]">{ex.durationEn}</p>
              </button>
            );
          })}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => onOpenSelfHelp()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#102a43] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isRu ? 'Sab exercises dekhein' : 'See all exercises'}
          </button>
        </div>
      </section>

      <div className="relative z-20 max-w-md mx-auto w-full h-px bg-gradient-to-r from-transparent via-[#f0cba0]/60 to-transparent" />

      {/* ================= Daily Care Streak — light, guilt-free engagement ================= */}
      {careItems && careStreak && onToggleCareItem && (
        <section id="streak" className="relative z-20 w-full px-6 py-12">
          <div className="max-w-3xl mx-auto text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faead9] text-[#b8703a] text-[11px] font-semibold mb-2">
              <Flame className="w-3.5 h-3.5" />
              <span>{isRu ? 'Chhota sa silsila' : 'A tiny daily habit'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#102a43] mb-1.5">
              {isRu ? 'Aaj Aap Kya Kar Chuke Hain?' : 'What Have You Done for Yourself Today?'}
            </h2>
            <p className="text-sm text-[#486581]">
              {isRu ? 'Koi pressure nahi — bas chhoti chhoti cheezon ka hisaab, apne liye.' : 'No pressure — just a gentle tally of small things, for you.'}
            </p>
          </div>
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-white/85 border border-[#e2ecf5] shadow-xs">
            <CareStreak
              items={careItems}
              data={careStreak}
              onToggleItem={onToggleCareItem}
              lang={currentLanguage}
              onOpenProgressReport={onOpenProgressReport}
            />
          </div>
        </section>
      )}

      <div className="relative z-20 max-w-md mx-auto w-full h-px bg-gradient-to-r from-transparent via-[#a7c5df]/50 to-transparent" />

      {/* ================= Entertainment / Unwind ================= */}
      <section id="entertainment" className="relative z-20 w-full px-6 py-12">
        <div className="max-w-5xl mx-auto text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1e3a5f] mb-2">{isRu ? 'Thori Der Sukoon Se' : 'Unwind for a Moment'}</h2>
          <p className="text-sm text-[#486581]">
            {isRu ? 'Har kisi ke liye alag aawaz sukoon deti hai — kuch try karein.' : 'What feels calming differs from person to person — try a few and see what fits.'}
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {SOUND_OPTIONS.map((s) => {
            const Icon = s.icon;
            const active = activeSound === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onToggleSound(s.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  active ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white shadow-md' : 'bg-white border-[#cbdbe8] text-[#244f77] hover:border-[#8cb7db] hover:shadow-xs'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'animate-pulse' : ''}`} />
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-none truncate">{s.labelEn}</p>
                  <p className="text-[10px] opacity-75 mt-1 truncate">{s.labelRu}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CALMING_REFLECTIONS.map((r, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/80 border border-[#cbdbe8] text-center">
              <p className="text-xs text-[#244f77] italic leading-relaxed">&ldquo;{r.en}&rdquo;</p>
              <p className="text-[10px] text-[#5e8db7] mt-1.5">{r.ru}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer subtle note */}
      <footer className="relative z-10 text-center py-2.5 text-[11px] text-[#627d98]/85 font-normal px-4">
        Hamnafas is an accessible mental health screening & emotional support companion in Pakistan. High-risk conversations are safely escalated to partner healthcare networks.
      </footer>
    </div>
  );
};
