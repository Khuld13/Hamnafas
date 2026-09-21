import React from 'react';
import {
  ArrowRight, ShieldCheck, MessageCircle, ClipboardCheck, Wind, Compass,
  BookOpen, HeartHandshake, PanelLeftOpen, Volume2, VolumeX, UserCircle2,
  Sparkles, MapPin, Music2, SunMedium, AudioLines
} from 'lucide-react';
import { MoodType, UserProfile, SupportedLanguage, AuthUser, CareRoutineItem, CareStreakData, SoundscapeType } from '../types';
import { MoodSelector } from './MoodSelector';
import { CareStreak } from './CareStreak';
import cozyScene from '../assets/images/hamnafas_cozy_scene_1788081010760.jpg';

const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

const EXERCISES = [
  { icon: Wind, titleEn: 'Box Breathing', titleRu: 'Box Breathing', meta: '2 min · Breathe', id: 'breathing-box', textEn: 'Slow the pace and give your body a simple rhythm.', textRu: 'Saans ko aahista karein aur jism ko ek simple rhythm dein.' },
  { icon: Compass, titleEn: '5–4–3–2–1 Grounding', titleRu: '5–4–3–2–1 Grounding', meta: '3 min · Ground', id: 'grounding-54321', textEn: 'Come back to what you can see, touch and hear around you.', textRu: 'Jo cheezein aap dekh, chhoo aur sun sakte hain un par wapas tawajjoh dein.' },
  { icon: BookOpen, titleEn: 'Three Good Things', titleRu: 'Three Good Things', meta: '2 min · Reflect', id: 'gratitude-journal', textEn: 'Notice three small things worth keeping from today.', textRu: 'Aaj ki teen choti achi cheezein notice karein.' },
];

const MUSIC = [
  { id: 'uplift' as SoundscapeType, icon: Sparkles, en: 'Uplift', ru: 'Mood halka karein' },
  { id: 'sunrise' as SoundscapeType, icon: SunMedium, en: 'Sunrise', ru: 'Subah jaisi warmth' },
  { id: 'flow' as SoundscapeType, icon: AudioLines, en: 'Soft Flow', ru: 'Naram musical flow' },
  { id: 'tanpura' as SoundscapeType, icon: Music2, en: 'Tanpura Calm', ru: 'Halka Tanpura' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  userProfile, selectedMood, onSelectMood, onStartChat, onOpenSelfHelp, onOpenScreening,
  onOpenCrisis, onToggleSidebar, sidebarOpen, activeSound, onToggleSound,
  currentLanguage, onChangeLanguage, authUser, onOpenAuth, careItems, careStreak,
  onToggleCareItem, onOpenProgressReport,
}) => {
  const isRu = currentLanguage === 'roman_urdu';
  const displayName = authUser?.email?.split('@')[0] || userProfile.name || 'Guest';
  const tr = (en: string, ru: string) => isRu ? ru : en;

  return (
    <div className="flex-1 h-full overflow-y-auto hm-page-bg text-[#173d60]">
      <header className="sticky top-0 z-30 border-b border-[#dce8f2] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {!sidebarOpen && <button onClick={onToggleSidebar} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce8f2] bg-white text-[#49657f] lg:hidden" aria-label="Open menu"><PanelLeftOpen className="h-5 w-5" /></button>}
            <button onClick={() => scrollToSection('home')} className="flex items-center gap-2 text-left" aria-label="Hamnafas home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcebf8] text-[#173d60]"><HeartHandshake className="h-5 w-5" /></span>
              <span><span className="block font-serif text-[1.45rem] leading-none text-[#173d60]">Hamnafas</span><span className="hidden text-[9px] font-semibold uppercase tracking-[.14em] text-[#5f7488] sm:block">For the moments in between</span></span>
            </button>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {[["how-it-works", tr('How it works','Kaise kaam karta hai')],["exercises",tr('Exercises','Exercises')],["streak",tr('Silsila','Silsila')],["entertainment",tr('Unwind','Unwind')]].map(([id,label]) => <button key={id} onClick={() => scrollToSection(id)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#49657f] hover:bg-[#edf5fb] hover:text-[#173d60]">{label}</button>)}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={onOpenCrisis} className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#49657f] hover:bg-[#edf5fb] sm:flex" title={tr('Support and emergency resources','Madad aur emergency resources')}><ShieldCheck className="h-4 w-4" /> {tr('Support','Madad')}</button>
            <button onClick={() => onToggleSound()} className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold ${activeSound ? 'border-[#173d60] bg-[#173d60] text-white' : 'border-[#dce8f2] bg-white text-[#49657f]'}`} aria-label={activeSound ? 'Mute music' : 'Play music'}>{activeSound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}<span className="hidden lg:inline">{activeSound ? 'Music' : tr('Music','Music')}</span></button>
            <button onClick={onOpenAuth} className="flex h-10 items-center gap-2 rounded-xl bg-[#173d60] px-3 text-xs font-semibold text-white" aria-label={authUser ? `Account for ${authUser.email}` : 'Sign in'}>{authUser ? <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">{authUser.email.charAt(0).toUpperCase()}</span> : <UserCircle2 className="h-4 w-4" />}<span className="hidden sm:inline">{authUser ? displayName : tr('Sign in','Sign in')}</span></button>
          </div>
        </div>
      </header>

      <main id="home">
        <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#e3f2fa]" aria-label="Hamnafas welcome">
          {/* The room is the atmosphere of the product, not a separate card. */}
          <div className="absolute inset-0">
            <img src={cozyScene} alt="A calm, sunlit room representing the Hamnafas space" className="h-full w-full object-cover object-[68%_center]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(227,242,250,.99)_0%,rgba(227,242,250,.96)_28%,rgba(227,242,250,.82)_48%,rgba(227,242,250,.34)_68%,rgba(227,242,250,.04)_86%,rgba(227,242,250,0)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(227,242,250,.30)_0%,rgba(227,242,250,0)_32%,rgba(227,242,250,.16)_100%)]" />
          </div>
          <div className="pointer-events-none absolute -left-16 top-24 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="w-full max-w-[760px] lg:w-[62%]">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#bfd8e8] bg-white/82 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#2d638f] shadow-sm">Built in Pakistan</span>
                <div className="flex rounded-full border border-[#bfd8e8] bg-white/88 p-0.5 shadow-sm" role="group" aria-label="Language">
                  <button onClick={() => onChangeLanguage?.('english')} className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${!isRu ? 'bg-[#173d60] text-white' : 'text-[#49657f]'}`}>English</button>
                  <button onClick={() => onChangeLanguage?.('roman_urdu')} className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${isRu ? 'bg-[#173d60] text-white' : 'text-[#49657f]'}`}>Roman Urdu</button>
                </div>
              </div>

              <h1 className="max-w-[760px] font-serif text-5xl leading-[.94] tracking-[-.035em] text-[#173d60] sm:text-6xl lg:text-[5.35rem]">{tr('A calmer place to put your thoughts.','Apni baaton ke liye ek pur-sukoon jagah.')}</h1>
              <p className="mt-6 max-w-[650px] text-base leading-7 text-[#365c7b] sm:text-lg">{tr('Hamnafas is an AI companion for the moments when talking to someone feels difficult. Talk naturally, check in with yourself, try a small exercise, and find human support when you need it.','Hamnafas un lamhon ka AI companion hai jab kisi se baat karna mushkil lagta hai. Apni baat karein, mood check karein, chhoti exercise try karein aur zaroorat par insani madad tak pohanchein.')}</p>
              <p className="mt-3 max-w-[620px] text-sm leading-6 text-[#5d7890]">{isRu ? 'Jo kehna mushkil lag raha ho, wahan se shuru karein.' : 'You do not need the right words. Start with how you feel.'}</p>

              <div className="mt-9 max-w-[760px] rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[0_20px_60px_rgba(48,91,119,.10)] backdrop-blur-[8px] sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#6e899f]">{tr('First step','Pehla qadam')}</p>
                    <h2 className="mt-1 font-serif text-2xl text-[#173d60] sm:text-3xl">{tr('How are you feeling right now?','Abhi aap kaisa mehsoos kar rahe hain?')}</h2>
                    <p className="mt-1 text-xs text-[#5e7890]">{tr('You can start with a feeling — no explanation needed.','Bas apna mood choose karein — koi explanation zaroori nahi.')}</p>
                  </div>
                  <span className="rounded-full bg-[#eaf4fb]/90 px-2.5 py-1 text-[10px] font-bold text-[#2d638f]">{tr('Mood check-in','Mood check-in')}</span>
                </div>
                <div className="mt-5">
                  <MoodSelector selectedMood={selectedMood} onSelectMood={onSelectMood} />
                </div>
              </div>

              {careItems && careStreak && onToggleCareItem && (
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => scrollToSection('streak')}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/62 px-3.5 py-2 text-left shadow-[0_8px_24px_rgba(48,91,119,.07)] backdrop-blur-[8px] transition hover:bg-white/82"
                    aria-label={tr('Open daily care streak','Rozana care streak kholen')}
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full ${careStreak.streak > 0 ? 'bg-[#f7e3ce] text-[#2b6f9f]' : 'bg-[#edf5fc] text-[#7ba8c9]'}`}>
                      <span aria-hidden="true" className="text-sm">🔥</span>
                    </span>
                    <span>
                      <span className="block text-[11px] font-bold leading-tight text-[#173d60]">
                        {careStreak.streak > 0
                          ? `${careStreak.streak}-day ${tr('care streak','care streak')}`
                          : tr('Start your care streak','Care streak aaj se shuru karein')}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-tight text-[#668199]">
                        {careStreak.completedToday.length}/{careItems.length} {tr('today','aaj')} · {tr('small steps count','chhoti cheezein count karti hain')}
                      </span>
                    </span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5 text-[#6b8ca6] transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={onStartChat} className="inline-flex items-center gap-2 rounded-xl bg-[#173d60] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(23,61,96,.20)] hover:bg-[#204d74]">{tr('Talk to Hamnafas','Hamnafas se baat karein')} <ArrowRight className="h-4 w-4" /></button>
                <button onClick={() => scrollToSection('exercises')} className="inline-flex items-center gap-2 rounded-xl border border-white/90 bg-white/78 px-5 py-3 text-sm font-bold text-[#173d60] shadow-sm backdrop-blur-sm hover:bg-white">{tr('Try an exercise','Exercise karein')}</button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#e4f3fa]" aria-label="Choose your next step">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="text-center"><p className="hm-eyebrow">{tr('Choose your next step','Apna agla qadam chunain')}</p><h2 className="mt-2 font-serif text-3xl text-[#173d60] sm:text-4xl">{tr('Start from what you need right now.','Jo abhi chahiye, wahin se shuru karein.')}</h2></div>
            <div className="mx-auto mt-7 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button onClick={onStartChat} className="group rounded-2xl bg-[#173d60] p-5 text-left text-white shadow-lg"><MessageCircle className="h-5 w-5" /><h3 className="mt-4 text-sm font-bold">{tr('Talk to Hamnafas','Hamnafas se baat karein')}</h3><p className="mt-1 text-xs leading-5 text-white/75">{tr('Put the thought into words, at your pace.','Apni raftaar se jo dil mein hai likhein.')}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold">{tr('Start talking','Baat shuru karein')} <ArrowRight className="h-3.5 w-3.5" /></span></button>
              <button onClick={() => onOpenSelfHelp()} className="rounded-2xl border border-[#cbdfeD] bg-white p-5 text-left"><Wind className="h-5 w-5 text-[#2d638f]" /><h3 className="mt-4 text-sm font-bold text-[#173d60]">{tr('Exercises','Exercises')}</h3><p className="mt-1 text-xs leading-5 text-[#607990]">{tr('Breathe, ground or reflect with a short guided tool.','Saans, grounding ya reflection ke liye chhota guided tool.')}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#2d638f]">{tr('Explore','Dekhein')} <ArrowRight className="h-3.5 w-3.5" /></span></button>
              <button onClick={() => scrollToSection('entertainment')} className="rounded-2xl border border-[#cbdfeD] bg-white p-5 text-left"><Music2 className="h-5 w-5 text-[#2d638f]" /><h3 className="mt-4 text-sm font-bold text-[#173d60]">{tr('Unwind','Unwind')}</h3><p className="mt-1 text-xs leading-5 text-[#607990]">{tr('Listen to gentle musical patterns for a softer pause.','Naram musical sounds ke saath ek halka pause lein.')}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#2d638f]">{tr('Listen','Sunein')} <ArrowRight className="h-3.5 w-3.5" /></span></button>
              <button onClick={onOpenScreening} className="rounded-2xl border border-[#cbdfeD] bg-white p-5 text-left"><ClipboardCheck className="h-5 w-5 text-[#2d638f]" /><h3 className="mt-4 text-sm font-bold text-[#173d60]">{tr('Screen yourself','Apna check karein')}</h3><p className="mt-1 text-xs leading-5 text-[#607990]">{tr('Use PHQ-9 or GAD-7 as a self-screening tool, not a diagnosis.','PHQ-9 ya GAD-7 se self-screening karein — diagnosis nahi.')}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#2d638f]">{tr('Begin','Shuru karein')} <ArrowRight className="h-3.5 w-3.5" /></span></button>
            </div>
          </div>
        </section>

        <section className="bg-[#eaf6fb]" aria-labelledby="different-heading"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16"><div className="max-w-2xl"><p className="hm-eyebrow">{tr('Why Hamnafas','Hamnafas kyun')}</p><h2 id="different-heading" className="mt-3 font-serif text-4xl leading-tight text-[#173d60] sm:text-5xl">{tr('Support that starts with the person, not the form.','Madad jo form se nahi, insaan se shuru hoti hai.')}</h2></div><div className="mt-8 grid gap-4 md:grid-cols-3">{[
          [MessageCircle,tr('Speak naturally','Apni zubaan mein baat'),tr('English or Roman Urdu, without forcing your thoughts into clinical language.','English ya Roman Urdu — apni baat ko clinical alfaaz mein dhalne ki zaroorat nahi.')],
          [HeartHandshake,tr('For the moments in between','Darmiyani lamhon ke liye'),tr('Talk, reflect or try one small coping step before you are ready for anything bigger.','Baat karein, reflect karein ya ek chhota coping step try karein.')],
          [ShieldCheck,tr('Safety-aware','Safety ko samajhne wala'),tr('When risk is serious, Hamnafas points toward human support rather than pretending to replace it.','Jab risk serious ho, Hamnafas insani madad ki taraf rehnumai karta hai.')]
        ].map(([Icon,title,text]) => <div key={String(title)} className="rounded-2xl border border-[#dce8f2] bg-[#fbfdff] p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3f9] text-[#2d638f]"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-sm font-bold text-[#173d60]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#607990]">{text}</p></div>)}</div></div></section>

        <section id="how-it-works" className="bg-[#e8f5fb]"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><div className="max-w-2xl"><p className="hm-eyebrow">{tr('How it works','Kaise kaam karta hai')}</p><h2 className="mt-3 font-serif text-4xl text-[#173d60] sm:text-5xl">{tr('One calm flow, from check-in to next step.','Ek pur-sukoon flow — check-in se aglay qadam tak.')}</h2></div><div className="mt-9 grid gap-5 md:grid-cols-4">{[
          ['01',tr('Choose a mood','Mood choose karein'),tr('Your check-in becomes part of your personal progress context.','Aapka mood check-in aapki progress ka context banta hai.')],
          ['02',tr('Talk your way','Apni zubaan mein baat'),tr('Use English or Roman Urdu and start where you are.','English ya Roman Urdu mein apni baat se shuru karein.')],
          ['03',tr('Choose support','Madad ka tareeqa chunain'),tr('Talk, exercise, unwind or take a self-screening.','Baat, exercise, unwind ya self-screening mein se chunain.')],
          ['04',tr('Know when to step out','Kab insani madad leni hai'),tr('Serious risk should lead toward verified human support.','Serious risk par verified insani madad ki taraf rehnumai milti hai.')]
        ].map(([n,title,text]) => <div key={n} className="rounded-2xl border border-[#dce8f2] bg-white p-6"><span className="text-xs font-bold text-[#5f7488]">{n}</span><h3 className="mt-5 text-sm font-bold text-[#173d60]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#607990]">{text}</p></div>)}</div></div></section>

        <section id="exercises" className="bg-[#eaf6fb]"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="hm-eyebrow">{tr('Exercises','Exercises')}</p><h2 className="mt-3 font-serif text-4xl text-[#173d60] sm:text-5xl">{tr('Small actions count.','Chhoti koshishein bhi count karti hain.')}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#607990]">{tr('You do not have to solve everything right now. Pick one small guided moment.','Abhi sab kuch solve karna zaroori nahi. Ek chhota guided moment choose karein.')}</p></div><button onClick={() => onOpenSelfHelp()} className="self-start rounded-xl border border-[#cbdce9] bg-white px-4 py-2.5 text-xs font-bold text-[#173d60] sm:self-auto">{tr('See all exercises','Tamam exercises')}</button></div><div className="mt-9 grid gap-4 md:grid-cols-3">{EXERCISES.map(({icon:Icon,titleEn,titleRu,meta,id,textEn,textRu}) => <button key={id} onClick={() => onOpenSelfHelp(id)} className="group rounded-2xl border border-[#dce8f2] bg-[#fbfdff] p-6 text-left hover:border-[#b9d1e2] hover:bg-white"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3f9] text-[#2d638f]"><Icon className="h-5 w-5" /></span><span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7488]">{meta}</span></div><h3 className="mt-6 text-sm font-bold text-[#173d60]">{isRu ? titleRu : titleEn}</h3><p className="mt-2 text-sm leading-6 text-[#607990]">{isRu ? textRu : textEn}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#2d638f]">{tr('Try it','Try karein')} <ArrowRight className="h-3.5 w-3.5" /></span></button>)}</div></div></section>

        {careItems && careStreak && onToggleCareItem && <section id="streak" className="bg-[#e5f3fa]"><div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:py-16"><div className="text-center"><p className="hm-eyebrow">Silsila · {tr('small things count','chhoti cheezein count karti hain')}</p><h2 className="mt-3 font-serif text-4xl text-[#17476b] sm:text-5xl">{tr('What have you done for yourself today?','Aaj aap ne apne liye kya kiya?')}</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#5c7890]">{tr("A gentle daily ritual for noticing what helps. Missing a day doesn't erase your progress.",'Jo cheez madad karti hai usay notice karne ka halka daily ritual. Ek din miss ho jaye to progress khatam nahi hoti.')}</p></div><div className="mt-9 rounded-3xl border border-[#c9dfed] bg-white p-5 sm:p-7"><CareStreak items={careItems} data={careStreak} onToggleItem={onToggleCareItem} lang={currentLanguage} onOpenProgressReport={onOpenProgressReport} /></div></div></section>}

        <section id="entertainment" className="bg-[#e4f3fa]"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16"><div className="text-center"><p className="hm-eyebrow">Unwind</p><h2 className="mt-3 font-serif text-4xl text-[#173d60] sm:text-5xl">{tr('A softer pause, with music.','Music ke saath ek halka sa pause.')}</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#607990]">{tr('Choose a gentle musical pattern. These are mood-supportive listening experiences, not a medical treatment or a guaranteed dopamine effect.','Naram musical patterns mein se chunain. Yeh mood-supportive listening experiences hain, medical treatment ya guaranteed dopamine effect nahi.')}</p></div><div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">{MUSIC.map(({id,icon:Icon,en,ru}) => { const active=activeSound===id; return <button key={id} onClick={() => onToggleSound(id)} className={`rounded-2xl border p-5 text-left transition ${active ? 'border-[#173d60] bg-[#173d60] text-white shadow-lg' : 'border-[#d4e5ef] bg-white text-[#173d60] hover:border-[#a9c5d9]'}`}><Icon className="h-5 w-5"/><h3 className="mt-4 text-sm font-bold">{isRu ? ru : en}</h3><p className={`mt-1 text-[11px] leading-5 ${active ? 'text-white/70' : 'text-[#71889d]'}`}>{active ? tr('Playing now','Abhi chal raha hai') : tr('Play','Chalayen')}</p></button>; })}</div></div></section>

        <footer className="hm-footer" aria-label="Hamnafas footer">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
            <div className="grid gap-9 md:grid-cols-[1.6fr_1fr_1fr]">
              <div className="max-w-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl font-serif font-bold text-white">ہ</div>
                  <div>
                    <p className="font-serif text-2xl font-bold text-white">Hamnafas</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/55">ہم نفس</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/70">
                  {tr(
                    'A calm, bilingual space for reflection, small coping steps and finding human support when it matters.',
                    'Soch, chhoti coping steps aur zaroorat par insani madad tak pohanchne ke liye ek pur-sukoon bilingual jagah.'
                  )}
                </p>
                <p className="mt-4 text-xs leading-5 text-white/50">
                  {tr(
                    'Hamnafas is an AI companion, not a replacement for professional or emergency care.',
                    'Hamnafas AI companion hai — professional ya emergency care ka badal nahi.'
                  )}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/50">{tr('Explore','Explore')}</p>
                <nav className="mt-4 flex flex-col items-start gap-2.5 text-sm">
                  <button onClick={() => scrollToSection('home')} className="text-white/75 transition hover:text-white">{tr('Home','Home')}</button>
                  <button onClick={() => scrollToSection('how-it-works')} className="text-white/75 transition hover:text-white">{tr('How it works','Kaise kaam karta hai')}</button>
                  <button onClick={() => scrollToSection('exercises')} className="text-white/75 transition hover:text-white">{tr('Exercises','Exercises')}</button>
                  <button onClick={() => scrollToSection('streak')} className="text-white/75 transition hover:text-white">{tr('Daily care','Rozana care')}</button>
                  <button onClick={() => scrollToSection('entertainment')} className="text-white/75 transition hover:text-white">{tr('Unwind','Unwind')}</button>
                </nav>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/50">{tr('Safety','Safety')}</p>
                <div className="mt-4 space-y-3">
                  <button onClick={onOpenCrisis} className="flex items-start gap-2 text-left text-sm text-white/75 transition hover:text-white">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{tr('Support & crisis resources','Madad aur crisis resources')}</span>
                  </button>
                  <p className="text-xs leading-5 text-white/50">
                    {tr('For urgent or serious concerns, use verified human support rather than relying on AI alone.','Urgent ya serious concern mein verified insani madad ko AI ke bajaye tarjeeh dein.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-col gap-3 border-t border-white/10 pt-5 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 Hamnafas. {tr('All rights reserved.','Tamam huqooq mehfooz hain.')}</p>
              <p>{tr('Built with care in Pakistan · Est. 2026','Pakistan mein care ke saath tayyar kiya gaya · Est. 2026')}</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
