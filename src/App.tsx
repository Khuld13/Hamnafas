/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { SelfHelpModal } from './components/SelfHelpModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { ScreeningModal } from './components/ScreeningModal';
import { CrisisModal } from './components/CrisisModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { LocalSupportModal } from './components/LocalSupportModal';
import { ProgressReportModal } from './components/ProgressReportModal';
import { Conversation, ChatMessage, MoodType, UserProfile, SupportedLanguage, ScreeningType, ScreeningResult, AuthUser, SoundscapeType, CareStreakData } from './types';
import { INITIAL_CONVERSATIONS, MOOD_OPTIONS } from './data/mockData';
import { DAILY_CARE_ITEMS } from './data/careRoutine';
import { soundscapes } from './services/soundService';

const STORAGE_KEY_CONVS = 'hamnafas_conversations_v2';
const STORAGE_KEY_PROFILE = 'hamnafas_user_profile_v2';
const STORAGE_KEY_CARE_STREAK = 'hamnafas_care_streak_v1';

const todayStr = () => new Date().toISOString().slice(0, 10);
const isYesterday = (dateStr: string) => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10) === dateStr;
};

const DEFAULT_CARE_STREAK: CareStreakData = {
  streak: 0,
  bestStreak: 0,
  lastCompletedDate: null,
  completedToday: [],
  totalCompletions: 0,
};

export default function App() {
  // Load saved state or default
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
    return INITIAL_CONVERSATIONS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.preferredLanguage === 'urdu') {
          parsed.preferredLanguage = 'roman_urdu';
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Profile read failed:', e);
    }
    return {
      name: 'Guest',
      initial: 'G',
      preferredLanguage: 'roman_urdu',
      theme: 'day',
      aiTone: 'gentle',
      soundEnabled: true,
      backendApiUrl: '',
      alibabaCloudReady: true,
      screeningHistory: [],
    };
  });

  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    userProfile.preferredLanguage || 'roman_urdu'
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>('Okay');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [isSelfHelpOpen, setIsSelfHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScreeningOpen, setIsScreeningOpen] = useState(false);
  const [activeScreeningType, setActiveScreeningType] = useState<ScreeningType>('phq9');
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isLocalSupportOpen, setIsLocalSupportOpen] = useState(false);
  const [isProgressReportOpen, setIsProgressReportOpen] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selfHelpInitialExercise, setSelfHelpInitialExercise] = useState<string | null>(null);
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState<boolean>(
    () => localStorage.getItem('hamnafas_disclaimer_seen') === 'true'
  );

  // Guilt-free daily care streak — self-reported, local-only, and reset
  // silently (no "you broke your streak" copy anywhere in the UI).
  const [careStreak, setCareStreak] = useState<CareStreakData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CARE_STREAK);
      if (saved) {
        const parsed: CareStreakData = JSON.parse(saved);
        // If the saved "today" isn't actually today anymore, clear today's
        // checklist. Only zero out the streak number if more than a day
        // was missed — a single missed day doesn't reset it, out of the
        // same anti-guilt spirit as the crisis/support design.
        if (parsed.lastCompletedDate !== todayStr()) {
          const stillOnStreak = parsed.lastCompletedDate ? isYesterday(parsed.lastCompletedDate) : false;
          return {
            ...parsed,
            completedToday: [],
            streak: stillOnStreak ? parsed.streak : 0,
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Care streak read failed:', e);
    }
    return DEFAULT_CARE_STREAK;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Profile save failed:', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CARE_STREAK, JSON.stringify(careStreak));
    } catch (e) {
      console.warn('Care streak save failed:', e);
    }
  }, [careStreak]);

  // Toggle one of today's small care-checklist items. Streak only ever goes
  // up here; there is no "undo my streak" punishment path.
  const handleToggleCareItem = (itemId: string) => {
    setCareStreak((prev) => {
      const today = todayStr();
      const alreadyToday = prev.lastCompletedDate === today;
      const currentlyDone = alreadyToday && prev.completedToday.includes(itemId);

      if (currentlyDone) {
        // Allow unchecking a mis-tap, but never below zero / never touches streak count.
        return { ...prev, completedToday: prev.completedToday.filter((id) => id !== itemId) };
      }

      const nextCompleted = alreadyToday ? [...prev.completedToday, itemId] : [itemId];
      const isFirstToday = nextCompleted.length === 1 && !alreadyToday;
      const nextStreak = isFirstToday
        ? prev.lastCompletedDate && isYesterday(prev.lastCompletedDate)
          ? prev.streak + 1
          : 1
        : prev.streak || 1;

      return {
        streak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
        lastCompletedDate: today,
        completedToday: nextCompleted,
        totalCompletions: prev.totalCompletions + 1,
      };
    });
  };

  // Guest session initialization
  // Tracks whether we've finished figuring out who's using the app (guest vs.
  // logged-in) so we don't fetch conversation history with the wrong identity.
  const [authChecked, setAuthChecked] = useState(false);

  /** Ensures a guest session token exists in localStorage, creating one if needed. */
  const ensureGuestToken = async (): Promise<string | null> => {
    const existing = localStorage.getItem('hamnafas_guest_token');

    if (existing) {
      // A token minted against a different backend/database (e.g. a fresh
      // dev database after a folder swap, or a server-side reset) will
      // 401 forever otherwise — verify it and mint a new one if it's stale,
      // instead of silently failing on every request from here on.
      try {
        const check = await fetch('/api/guest', {
          credentials: 'include',
          headers: { 'X-Guest-Token': existing },
        });
        if (check.ok) return existing;
        localStorage.removeItem('hamnafas_guest_token');
      } catch {
        // Network hiccup while verifying — don't discard a possibly-good
        // token over a transient blip, just proceed with it as-is.
        return existing;
      }
    }

    try {
      const response = await fetch('/api/guest', { method: 'POST', credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('hamnafas_guest_token', data.guestId);
        return data.guestId as string;
      }
    } catch (err) {
      console.warn('Could not create guest session:', err);
    }
    return null;
  };

  /**
   * Loads this identity's real conversation history from the backend and
   * replaces local state with it. Called on first load and every time the
   * logged-in identity changes (login, logout, signup).
   */
  const loadConversationsFromBackend = async () => {
    const guestToken = await ensureGuestToken();

    try {
      const listRes = await fetch('/api/chat/conversations', {
        credentials: 'include',
        headers: guestToken ? { 'X-Guest-Token': guestToken } : {},
      });

      if (!listRes.ok) {
        // 401 for a brand-new guest/account with no history yet is expected.
        setConversations([]);
        return;
      }

      const { conversations: summaries } = await listRes.json();

      const loaded: Conversation[] = await Promise.all(
        summaries.map(async (summary: any) => {
          const msgRes = await fetch(`/api/chat/conversations/${summary.id}/messages`, {
            credentials: 'include',
            headers: guestToken ? { 'X-Guest-Token': guestToken } : {},
          });
          const messagesData = msgRes.ok ? await msgRes.json() : { messages: [] };

          const messages: ChatMessage[] = (messagesData.messages || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedPrompts: m.suggestedPrompts,
            isCrisisAlert: m.isCrisisAlert,
          }));

          return {
            id: summary.id,
            serverId: summary.id,
            title: summary.title || 'Conversation',
            mood: summary.mood || undefined,
            language: summary.language || undefined,
            createdAt: summary.createdAt,
            updatedAt: summary.updatedAt,
            messages,
          } as Conversation;
        })
      );

      setConversations(loaded);
    } catch (err) {
      console.warn('Could not load conversation history:', err);
      setConversations([]);
    }
  };

  // Check if user is already authenticated (JWT cookie), then load the
  // correct history for whichever identity that turns out to be.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAuthUser({ userId: data.userId, email: data.email });
        }
      } catch {
        // Not authenticated — continue as guest
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  // Runs exactly once we know the real identity (guest or logged-in), and
  // again every time that identity changes — i.e. on login, logout, signup.
  useEffect(() => {
    if (!authChecked) return;
    loadConversationsFromBackend();
    setActiveConversationId(null);
  }, [authUser, authChecked]);

  const handleChangeLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    setUserProfile((prev) => ({ ...prev, preferredLanguage: lang }));
  };

  // Handle Mood selection
  const handleSelectMood = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  // Start chat from Home screen with selected mood & language
  const handleStartChatFromHome = () => {
    const activeMoodData = MOOD_OPTIONS.find((m) => m.id === selectedMood);
    let initialGreeting = "Assalam-o-Alaikum Meera. Main aapke sath hoon. Aap kaisa mehsoos kar rahe hain?";

    if (activeMoodData) {
      if (currentLanguage === 'roman_urdu') {
        initialGreeting = activeMoodData.initialAssistantMessageRomanUrdu;
      } else {
        initialGreeting = activeMoodData.initialAssistantMessage;
      }
    }

    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: selectedMood
        ? `Check-in: ${selectedMood} (${activeMoodData?.labelRomanUrdu || ''})`
        : 'Reflective check-in',
      mood: selectedMood || undefined,
      language: currentLanguage,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedPrompts:
            currentLanguage === 'roman_urdu'
              ? [
                  '1-minute calming breath karwayein',
                  'PHQ-9 Depression Checkup shuru karein',
                  'Dil par bojh hai, baat karte hain',
                ]
              : [
                  "Let's do a 1-minute breathing pause",
                  'Start PHQ-9 Depression screening',
                  'I have something on my mind to share',
                ],
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  // Create a brand new conversation
  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const greeting =
      currentLanguage === 'roman_urdu'
        ? `Assalam-o-Alaikum ${userProfile.name}. Main baghair kisi tanqeed ke aapko sunne ke liye hazir hoon. Jitna waqt chahiye lein. Aaj dil mein kya chal raha hai?`
        : `Welcome, ${userProfile.name}. I'm here to listen without judgment. Take all the space and time you need. How are you feeling right now?`;

    const newConv: Conversation = {
      id: newId,
      title: 'New Conversation',
      mood: selectedMood || undefined,
      language: currentLanguage,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedPrompts:
            currentLanguage === 'roman_urdu'
              ? [
                  'Aaj thori ghabrahat ho rahi hai',
                  'PHQ-9 ya GAD-7 screening karein',
                  'Box Breathing se zehan relax karein',
                ]
              : [
                  "I'm feeling a bit anxious today",
                  'Take PHQ-9 / GAD-7 assessment',
                  "Let's do a quick grounding exercise",
                ],
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  // Switch to an existing conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  // Delete a conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  // Update active conversation after messages change
  const handleUpdateConversation = (updated: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  // Ambient sound toggle — accepts an explicit type so different UI entry
  // points (header button, Unwind section grid, Self-Help modal) can each
  // offer any soothing sound independently, while still toggling off on
  // repeat clicks of the same sound.
  const handleToggleAmbientSound = (type: SoundscapeType = 'rain') => {
    const started = soundscapes.toggleSoundscape(type);
    setActiveSound(started);
  };

  // Screening handler
  const handleOpenScreening = (type: ScreeningType = 'phq9') => {
    setActiveScreeningType(type);
    setIsScreeningOpen(true);
  };

  // Send screening result to chat
  const handleSendScreeningResultToChat = (result: ScreeningResult, messageText: string) => {
    const activeConv = conversations.find((c) => c.id === activeConversationId);
    const targetConvId = activeConv ? activeConv.id : `conv-${Date.now()}`;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const typeTitle = result.type === 'phq9' ? 'PHQ-9 Depression Screening' : 'GAD-7 Anxiety Screening';
    const recsList = (currentLanguage === 'roman_urdu' ? result.recommendationsRomanUrdu : result.recommendations)
      .map((r, i) => `${i + 1}. ${r}`)
      .join('\n');

    const assistantContent =
      currentLanguage === 'roman_urdu'
        ? `Shukriya Meera. Humne aapka **${typeTitle}** record kar liya hai.

📊 **Score**: ${result.score} / ${result.maxScore} (${result.severityLevelRomanUrdu})
📋 **Assessment**: ${result.summaryRomanUrdu}

✨ **Tajweez Karda Iqdamaat**:
${recsList}

Aap bilkul fikar na karein. Hum is par aahista aahista kaam kar sakte hain. Kis baat par pehle tawajjoh dena chahte hain?`
        : `Thank you Meera. I have received your **${typeTitle}** results.

📊 **Score**: ${result.score} / ${result.maxScore} (${result.severityLevel})
📋 **Assessment**: ${result.summaryEn}

✨ **Personalized Coping Recommendations**:
${recsList}

How are you feeling seeing these findings? We can unpack them together with care.`;

    const assistantMsg = {
      id: `asst-${Date.now() + 1}`,
      role: 'assistant' as const,
      content: assistantContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCrisisAlert: result.crisisTriggered,
      suggestedPrompts: [
        'Guide me through the first step',
        'Let us do a 1-minute calming breath',
        'Tell me more about this score',
      ],
    };

    // Persist screening result to backend (fire-and-forget)
    try {
      const guestToken = localStorage.getItem('hamnafas_guest_token');
      if (guestToken) {
        fetch('/api/screening', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Guest-Token': guestToken,
          },
          body: JSON.stringify({
            type: result.type,
            score: result.score,
            maxScore: result.maxScore,
            severityLevel: result.severityLevel,
            answers: {},
            crisisTriggered: result.crisisTriggered || false,
          }),
        }).catch((err) => console.warn('Screening persistence failed:', err));
      }
    } catch (err) {
      // Silently fail — frontend flow continues unaffected
    }

    if (activeConv) {
      const updated = {
        ...activeConv,
        messages: [...activeConv.messages, userMsg, assistantMsg],
        updatedAt: 'Just now',
      };
      handleUpdateConversation(updated);
    } else {
      const newConv: Conversation = {
        id: targetConvId,
        title: `${typeTitle} (${result.score}/${result.maxScore})`,
        language: currentLanguage,
        createdAt: 'Just now',
        updatedAt: 'Just now',
        messages: [userMsg, assistantMsg],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(targetConvId);
    }
  };

  const handleAuthSuccess = (user: AuthUser) => {
    // Clear stale UI immediately; the [authUser] effect fetches this
    // account's real history right after.
    setConversations([]);
    setActiveConversationId(null);
    setAuthUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Continue with local logout even if network fails
    }

    // Clear the UI now so nothing from this account lingers on screen.
    setConversations([]);
    setActiveConversationId(null);

    // Rotate the guest token so it can never re-attach to the next account
    // that signs up in this browser.
    localStorage.removeItem('hamnafas_guest_token');
    await ensureGuestToken();

    setAuthUser(null);
  };

  // Active conversation object
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#d9ebf8] text-[#243b53] select-none font-sans">
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        userProfile={userProfile}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSelfHelp={(exerciseId) => {
          setSelfHelpInitialExercise(exerciseId ?? null);
          setIsSelfHelpOpen(true);
        }}
        onOpenScreening={() => handleOpenScreening('phq9')}
        onOpenCrisis={() => setIsCrisisOpen(true)}
        authUser={authUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProgressReport={() => setIsProgressReportOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {activeConversationId && activeConversation ? (
          <ChatView
            conversation={activeConversation}
            userProfile={userProfile}
            onUpdateConversation={handleUpdateConversation}
            onBackToHome={() => setActiveConversationId(null)}
            onOpenSelfHelp={(exerciseId) => {
              setSelfHelpInitialExercise(exerciseId ?? null);
              setIsSelfHelpOpen(true);
            }}
            onOpenScreening={() => handleOpenScreening('phq9')}
            onOpenCrisis={() => setIsCrisisOpen(true)}
            onOpenLocalSupport={() => setIsLocalSupportOpen(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
            currentLanguage={currentLanguage}
            onChangeLanguage={handleChangeLanguage}
            authUser={authUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        ) : (
          <HomeView
            userProfile={userProfile}
            selectedMood={selectedMood}
            onSelectMood={handleSelectMood}
            onStartChat={handleStartChatFromHome}
            onOpenSelfHelp={(exerciseId) => {
              setSelfHelpInitialExercise(exerciseId ?? null);
              setIsSelfHelpOpen(true);
            }}
            onOpenScreening={() => handleOpenScreening('phq9')}
            onOpenCrisis={() => setIsCrisisOpen(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
            activeSound={activeSound}
            onToggleSound={handleToggleAmbientSound}
            currentLanguage={currentLanguage}
            onChangeLanguage={handleChangeLanguage}
            authUser={authUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            careItems={DAILY_CARE_ITEMS}
            careStreak={careStreak}
            onToggleCareItem={handleToggleCareItem}
            onOpenProgressReport={() => setIsProgressReportOpen(true)}
          />
        )}
      </div>

      {/* Mandatory First-Moment Consent & Disclaimer Gate */}
      <DisclaimerModal
        isOpen={!hasSeenDisclaimer}
        onAcknowledge={() => {
          localStorage.setItem('hamnafas_disclaimer_seen', 'true');
          setHasSeenDisclaimer(true);
        }}
        lang={currentLanguage}
      />

      {/* Clinical Screening Modal (PHQ-9 & GAD-7) */}
      <ScreeningModal
        isOpen={isScreeningOpen}
        onClose={() => setIsScreeningOpen(false)}
        initialType={activeScreeningType}
        userLanguage={currentLanguage}
        onSendResultToChat={handleSendScreeningResultToChat}
      />

      {/* Pakistan Crisis & Helplines Modal */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
        lang={currentLanguage}
      />

      {/* Local Support Directory Modal — MODERATE-tier warm handoff to nearby/reachable professionals */}
      <LocalSupportModal
        isOpen={isLocalSupportOpen}
        onClose={() => setIsLocalSupportOpen(false)}
        lang={currentLanguage}
      />

      {/* 10-Day Progress & Observational Report Modal */}
      <ProgressReportModal
        isOpen={isProgressReportOpen}
        onClose={() => setIsProgressReportOpen(false)}
        lang={currentLanguage}
        careStreak={careStreak}
      />

      {/* Interactive Self Help Modal */}
      <SelfHelpModal
        isOpen={isSelfHelpOpen}
        onClose={() => {
          setIsSelfHelpOpen(false);
          setSelfHelpInitialExercise(null);
        }}
        initialExerciseId={selfHelpInitialExercise}
        onSelectScreening={handleOpenScreening}
        activeSound={activeSound}
        onToggleSound={handleToggleAmbientSound}
        onOpenCrisis={() => {
          setIsSelfHelpOpen(false);
          setIsCrisisOpen(true);
        }}
        lang={currentLanguage}
        careItems={DAILY_CARE_ITEMS}
        careStreak={careStreak}
        onToggleCareItem={handleToggleCareItem}
      />

      {/* Settings & Architecture Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        onSaveProfile={(updated) => {
          setUserProfile(updated);
          if (updated.preferredLanguage) setCurrentLanguage(updated.preferredLanguage);
        }}
        authUser={authUser}
        onOpenAuth={() => {
          setIsSettingsOpen(false);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
