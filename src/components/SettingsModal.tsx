import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Globe, 
  Volume2, 
  Check, 
  Sparkles, 
  ExternalLink,
  Code2,
  LogOut,
  UserCircle
} from 'lucide-react';
import { UserProfile, SupportedLanguage } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  authUser?: { userId: string; email: string } | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  authUser,
  onOpenAuth,
  onLogout,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a192f]/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#f8fbfe] rounded-3xl border border-[#d6e7f7] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white/95 border-b border-[#d8e7f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e3effa] text-[#1e3a5f] flex items-center justify-center shadow-xs">
              <SettingsIcon className="w-5 h-5 text-[#244f77]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#102a43]">
                Settings
              </h3>
              <p className="text-xs text-[#627d98]">
                Preferences and language
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#829ab1] hover:text-[#102a43] hover:bg-[#e4eff9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="space-y-4">
              {/* Account Section */}
              <div className="p-3.5 rounded-2xl border border-[#d2e4f3] bg-[#edf5fc]">
                {authUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-semibold">
                        {authUser.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#102a43]">{authUser.email}</p>
                        <p className="text-[10px] text-[#627d98]">Signed in</p>
                      </div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#486581] hover:bg-white hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <UserCircle className="w-5 h-5 text-[#3b668f]" />
                      <div>
                        <p className="text-xs font-semibold text-[#102a43]">Create an account</p>
                        <p className="text-[10px] text-[#627d98]">Save your progress and conversations</p>
                      </div>
                    </div>
                    <button
                      onClick={onOpenAuth}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1e3a5f] hover:bg-[#102a43] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* User Name */}
              <div>
                <label className="block text-xs font-semibold text-[#102a43] mb-1.5">
                  Your Display Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value, initial: e.target.value.charAt(0).toUpperCase() || 'M' })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#cde0f0] rounded-xl text-sm text-[#102a43] focus:border-[#7ba8c9] focus:outline-none shadow-xs"
                />
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-semibold text-[#102a43] mb-1.5">
                  Default Communication Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'roman_urdu', label: 'Roman Urdu', sub: 'Theek / Pur-sukoon' },
                    { id: 'english', label: 'English', sub: 'Standard English' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, preferredLanguage: item.id as SupportedLanguage })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        profile.preferredLanguage === item.id
                          ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-xs'
                          : 'bg-white text-[#102a43] border-[#d8e7f5] hover:bg-[#edf5fc]'
                      }`}
                    >
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className={`text-[10px] ${profile.preferredLanguage === item.id ? 'text-white/80' : 'text-[#627d98]'}`}>
                        {item.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Conversational Tone */}
              <div>
                <label className="block text-xs font-semibold text-[#102a43] mb-1.5">
                  Hamnafas Conversational Tone
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'default', title: 'Default (Recommended)', desc: 'Balanced, natural conversation — no fixed personality' },
                    { id: 'gentle', title: 'Gentle & Nurturing', desc: 'Soft, slow pacing and validating space' },
                    { id: 'practical', title: 'Practical & Structured', desc: 'CBT coping exercises and actionable steps' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, aiTone: t.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        profile.aiTone === t.id
                          ? 'bg-[#dcebf8] text-[#102a43] border-[#8cb7db] font-medium shadow-xs'
                          : 'bg-white text-[#486581] border-[#d8e7f5] hover:bg-[#f0f6fb]'
                      }`}
                    >
                      <span className="text-xs font-bold block text-[#102a43]">{t.title}</span>
                      <span className="text-[11px] text-[#627d98] leading-tight block mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Companion Gender (Text-to-Speech) */}
              <div>
                <label className="block text-xs font-semibold text-[#102a43] mb-1.5">
                  Voice Companion
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'female', title: 'Female Voice' },
                    { id: 'male', title: 'Male Voice' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, voiceGender: v.id as 'female' | 'male' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        (profile.voiceGender ?? 'female') === v.id
                          ? 'bg-[#dcebf8] text-[#102a43] border-[#8cb7db] font-medium shadow-xs'
                          : 'bg-white text-[#486581] border-[#d8e7f5] hover:bg-[#f0f6fb]'
                      }`}
                    >
                      <span className="text-xs font-bold block text-[#102a43]">{v.title}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#829ab1] mt-1.5">
                  Voice availability depends on your device/browser. Some devices may not have a dedicated Urdu voice installed.
                </p>
              </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-white border-t border-[#d8e7f5] flex items-center justify-between">
          <span className="text-xs text-emerald-700 font-semibold">
            {savedSuccess ? '✓ Changes saved successfully!' : ''}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#486581] hover:bg-[#edf4fb] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#102a43] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

      
