import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ClipboardCheck, 
  HeartHandshake, 
  Wind, 
  Compass, 
  PanelLeftOpen,
  Copy,
  Check,
  PhoneCall,
  ShieldAlert,
  Globe,
  UserCircle2
} from 'lucide-react';
import { ChatMessage, Conversation, MoodType, UserProfile, SupportedLanguage, ScreeningResult, AuthUser } from '../types';
import { generateHamnafasResponse, speakTextAzure, stopSpeaking } from '../services/aiService';
import { MOOD_OPTIONS } from '../data/mockData';
import { MoodFace } from './MoodFace';
import ReactMarkdown from 'react-markdown';

interface ChatViewProps {
  conversation: Conversation;
  userProfile: UserProfile;
  onUpdateConversation: (updated: Conversation) => void;
  onBackToHome: () => void;
  onOpenSelfHelp: (exerciseId?: string) => void;
  onOpenScreening: () => void;
  onOpenCrisis: () => void;
  onOpenLocalSupport: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  currentLanguage: SupportedLanguage;
  onChangeLanguage?: (lang: SupportedLanguage) => void;
  authUser?: AuthUser | null;
  onOpenAuth?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  userProfile,
  onUpdateConversation,
  onBackToHome,
  onOpenSelfHelp,
  onOpenScreening,
  onOpenCrisis,
  onOpenLocalSupport,
  onToggleSidebar,
  sidebarOpen,
  currentLanguage,
  authUser,
  onOpenAuth,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeMoodOption = MOOD_OPTIONS.find((m) => m.id === conversation.mood);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      stopSpeaking();
    };
  }, [conversation.id]);

  // Handle sending a user message
  // "Show me support near me" is offered as a suggested prompt on MODERATE
  // tier crisis replies. Clicking it should open the local support directory
  // directly rather than round-tripping through the AI as a normal message.
  const LOCAL_SUPPORT_PROMPT_MATCHES = ['show me support near me', 'mere qareeb madad dikhayein'];
  const isLocalSupportPrompt = (prompt: string) =>
    LOCAL_SUPPORT_PROMPT_MATCHES.includes(prompt.trim().toLowerCase());

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isTyping) return;

    setInputText('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation: Conversation = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: 'Just now',
    };

    // If it was the first user message, update title dynamically
    if (conversation.messages.length <= 1) {
      const cleanTitle = messageContent.length > 35 ? `${messageContent.substring(0, 32)}...` : messageContent;
      updatedConversation.title = cleanTitle;
    }

    onUpdateConversation(updatedConversation);
    setIsTyping(true);

    try {
      /**
       * =========================================================================
       * 🚀 BACKEND INTEGRATION POINT (LANGCHAIN / LANGGRAPH / ALIBABA CLOUD):
       * 
       * `generateHamnafasResponse` handles calling your custom Python/FastAPI
       * server or using the built-in empathetic response engine.
       * =========================================================================
       */
      const aiResponse = await generateHamnafasResponse(
        messageContent,
        updatedMessages,
        conversation.mood,
        userProfile.backendApiUrl,
        currentLanguage,
        userProfile.aiTone,
        conversation.serverId // reuse the real thread id once we have one; undefined on the very first message
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: aiResponse.suggestedPrompts,
        isCrisisAlert: aiResponse.isCrisisAlert,
        riskTier: aiResponse.riskTier,
      };

      onUpdateConversation({
        ...updatedConversation,
        serverId: aiResponse.conversationId ?? conversation.serverId, // lock in the backend thread id
        messages: [...updatedMessages, assistantMessage],
        updatedAt: 'Just now',
      });
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          currentLanguage === 'roman_urdu'
            ? "Main aapke sath hoon. Aik gehri, pur-sukoon saans lein. Jo baat dil mein hai, batayein."
            : "I'm right here with you. Take a slow, quiet breath. What feels most important to focus on right now?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onUpdateConversation({
        ...updatedConversation,
        messages: [...updatedMessages, fallbackMessage],
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Speech to Text (Microphone voice input)
  const toggleSpeechRecognition = () => {
    const windowObj = window as any;
    const SpeechRecognition =
      windowObj.SpeechRecognition ||
      windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your message directly.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLanguage === 'roman_urdu' ? 'ur-PK' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  // Read message aloud via TTS
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (activeSpeechId === msgId) {
      stopSpeaking();
      setActiveSpeechId(null);
    } else {
      setActiveSpeechId(msgId);
      speakTextAzure(text, () => setActiveSpeechId(null), {
        language: currentLanguage,
        gender: userProfile.voiceGender ?? 'female',
        mood: conversation.mood,
      });
    }
  };

  // Copy message
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#edf4fb] overflow-hidden">
      {/* Top Header Bar */}
      <header className="px-4 sm:px-5 py-3 bg-white/90 backdrop-blur-md border-b border-[#d8e7f5] flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 text-[#334e68] hover:text-[#102a43] hover:bg-[#e4eff9] rounded-lg transition-colors cursor-pointer"
              title="Open sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          )}

          <button
            id="chat-back-home-btn"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-medium text-[#486581] hover:text-[#102a43] hover:bg-[#e4eff9] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="h-4 w-[1px] bg-[#cbdbe8]" />

          {/* Active Conversation Title & Mood indicator */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-serif italic shadow-xs">
              H
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#102a43] leading-none">
                  Hamnafas
                </h3>
                {conversation.mood && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#e2eef9] text-[#244f77]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a7298]" />
                    {conversation.mood}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#627d98] leading-tight hidden sm:block">
                Open-Access Mental Health AI in Pakistan
              </p>
            </div>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScreening}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#dcebf8] hover:bg-[#cee3f6] text-[#1e3a5f] text-xs font-medium transition-all cursor-pointer shadow-xs"
            title="Take PHQ-9 or GAD-7 screening"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Screening</span>
          </button>

          <button
            onClick={onOpenCrisis}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-all cursor-pointer"
            title="Helplines"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">0311-7786264</span>
          </button>

          {/* Sign In / Account Avatar — reachable from anywhere */}
          <button
            onClick={onOpenAuth}
            className={
              authUser
                ? "w-8 h-8 rounded-full bg-[#1e3a5f] hover:bg-[#102a43] text-white font-bold flex items-center justify-center text-xs transition-all cursor-pointer shadow-xs ring-2 ring-white/60"
                : "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1e3a5f] hover:bg-[#102a43] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            }
            title={authUser ? authUser.email : 'Sign in to save your history'}
            aria-label={authUser ? `Account for ${authUser.email}` : 'Sign In'}
          >
            {authUser ? (
              <span>{authUser.email.charAt(0).toUpperCase()}</span>
            ) : (
              <>
                <UserCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Messages Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 max-w-3xl w-full mx-auto">
        {/* Mood Context Pill if present */}
        {activeMoodOption && (
          <div className="flex items-center justify-center mb-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#d6e7f7] shadow-xs text-xs text-[#334e68]">
              <MoodFace mood={activeMoodOption.id} size={24} />
              <span>
                Check-in feeling <strong>{activeMoodOption.label}</strong> ({activeMoodOption.labelRomanUrdu}). Hamnafas is with you.
              </span>
            </div>
          </div>
        )}

        {/* Messages List */}
        {conversation.messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`group relative max-w-[88%] sm:max-w-[80%] px-4 py-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#1e3a5f] text-white rounded-br-xs'
                    : message.riskTier === 'high'
                    ? 'bg-rose-50/90 text-rose-950 border border-rose-300 rounded-bl-xs'
                    : message.riskTier === 'moderate'
                    ? 'bg-[#eef3ea]/90 text-[#2f3e2a] border border-[#cfe0c8] rounded-bl-xs'
                    : 'bg-white text-[#102a43] border border-[#d6e7f7] rounded-bl-xs'
                }`}
              >
                {/* Assistant Markdown Content */}
                {isUser ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="markdown-body space-y-2 prose prose-sm text-[#102a43]">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}

                {/* HIGH tier: immediate hotline + rescue quick bar (unchanged) */}
                {!isUser && message.riskTier === 'high' && (
                  <div className="mt-3 pt-2.5 border-t border-rose-200 flex flex-wrap gap-2 items-center">
                    <a
                      href="tel:03117786264"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Umang: 0311-7786264</span>
                    </a>
                    <a
                      href="tel:080022444"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-semibold"
                    >
                      <span>Rozan: 0800-22444</span>
                    </a>
                    <a
                      href="tel:1122"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-rose-900 border border-rose-300 text-xs font-semibold"
                    >
                      <span>Rescue 1122</span>
                    </a>
                  </div>
                )}

                {/* MODERATE tier: calm nudge toward the local support directory — no hotline/ambulance framing */}
                {!isUser && message.riskTier === 'moderate' && (
                  <div className="mt-3 pt-2.5 border-t border-[#cfe0c8] flex flex-wrap gap-2 items-center">
                    <button
                      onClick={onOpenLocalSupport}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4c6b43] hover:bg-[#3c5535] text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>{currentLanguage === 'roman_urdu' ? 'Madad Dikhayein' : 'Find Support Near You'}</span>
                    </button>
                  </div>
                )}

                {/* Assistant Message Quick Actions (TTS & Copy) */}
                {!isUser && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f0f4f8] text-[#829ab1]">
                    <button
                      onClick={() => handleToggleSpeak(message.id, message.content)}
                      className={`p-1 rounded hover:bg-[#f0f4f8] hover:text-[#102a43] transition-colors cursor-pointer ${
                        activeSpeechId === message.id ? 'text-[#1e3a5f] bg-[#e4effa]' : ''
                      }`}
                      title={activeSpeechId === message.id ? 'Stop reading' : 'Listen with calming voice'}
                    >
                      {activeSpeechId === message.id ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopy(message.id, message.content)}
                      className="p-1 rounded hover:bg-[#f0f4f8] hover:text-[#102a43] transition-colors cursor-pointer"
                      title="Copy message"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[11px] text-[#829ab1] px-1">
                {message.timestamp}
              </span>

              {/* Suggested Follow-up Prompts */}
              {!isUser && message.suggestedPrompts && message.suggestedPrompts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {message.suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => (isLocalSupportPrompt(prompt) ? onOpenLocalSupport() : handleSendMessage(prompt))}
                      className="px-3 py-1 text-xs bg-white/85 hover:bg-white text-[#244f77] hover:text-[#102a43] border border-[#cbdbe8] rounded-full transition-all shadow-xs hover:shadow-sm cursor-pointer hover:border-[#96bede]"
                    >
                      {prompt} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-white/80 border border-[#d6e7f7] rounded-2xl rounded-bl-xs w-20 shadow-xs">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#5b87ad] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#5b87ad] animate-bounce" style={{ animationDelay: '180ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#5b87ad] animate-bounce" style={{ animationDelay: '360ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Dock */}
      <footer className="p-3.5 sm:p-4 bg-white/90 backdrop-blur-md border-t border-[#d8e7f5] z-20">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Quick Wellbeing Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => onOpenScreening()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e3effa] hover:bg-[#d4e6f6] text-[#1e3a5f] border border-[#cbdbe8] transition-colors whitespace-nowrap cursor-pointer font-medium"
            >
              <ClipboardCheck className="w-3 h-3 text-[#3b668f]" />
              <span>Take PHQ-9 / GAD-7 Test</span>
            </button>
            <button
              onClick={() => handleSendMessage("Let's do a 1-minute calming box breath.")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf5fc] hover:bg-[#dcebf8] text-[#244f77] border border-[#d2e4f3] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Wind className="w-3 h-3 text-[#4a7298]" />
              <span>Guide my breath</span>
            </button>
            <button
              onClick={() => handleSendMessage("I want to try the 5-4-3-2-1 grounding technique.")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf5fc] hover:bg-[#dcebf8] text-[#244f77] border border-[#d2e4f3] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Compass className="w-3 h-3 text-[#4a7298]" />
              <span>Grounding 5-4-3-2-1</span>
            </button>
            <button
              onClick={() => handleSendMessage("Dil par bojh hai, bas aaram se suniye.")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf5fc] hover:bg-[#dcebf8] text-[#244f77] border border-[#d2e4f3] transition-colors whitespace-nowrap cursor-pointer"
            >
              <HeartHandshake className="w-3 h-3 text-[#4a7298]" />
              <span>Dil ki baat (Just listen)</span>
            </button>
          </div>

          {/* Form Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center bg-[#f4f8fc] border border-[#cde0f0] rounded-2xl p-1.5 focus-within:border-[#7ba8c9] focus-within:ring-2 focus-within:ring-[#7ba8c9]/20 transition-all shadow-xs"
          >
            <input
              ref={inputRef}
              id="chat-message-input"
              type="text"
              placeholder={
                isListening
                  ? "Listening to your voice..."
                  : currentLanguage === 'roman_urdu'
                  ? "Jo dil mein hai, yahan likhein... (Roman Urdu ya English)"
                  : "Write whatever is on your heart..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent px-3.5 py-2 text-sm text-[#102a43] placeholder:text-[#829ab1] focus:outline-none"
            />

            {/* Speech to text mic button */}
            <button
              type="button"
              id="voice-mic-btn"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-[#627d98] hover:text-[#102a43] hover:bg-white/80'
              }`}
              title={isListening ? "Listening... Click to stop" : "Speak your message"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              id="chat-send-btn"
              disabled={!inputText.trim() || isTyping}
              className={`p-2 rounded-xl transition-all duration-150 cursor-pointer ml-1 ${
                inputText.trim() && !isTyping
                  ? 'bg-[#1e3a5f] text-white hover:bg-[#102a43] shadow-xs active:scale-95'
                  : 'bg-transparent text-[#b0c4de] cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4 stroke-[2]" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};
