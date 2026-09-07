import React, { useState } from 'react';
import { 
  SquarePen, 
  Search, 
  Clock, 
  Settings, 
  Heart, 
  PanelLeftClose, 
  Trash2,
  ClipboardCheck,
  ShieldAlert,
  Sparkles,
  LogIn,
  FileText
} from 'lucide-react';
import { Conversation, UserProfile } from '../types';
import pottedPlantImg from '../assets/images/potted_plant_icon_1788081031250.jpg';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  userProfile: UserProfile;
  isOpen: boolean;
  onToggleSidebar: () => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
  onOpenSelfHelp: (exerciseId?: string) => void;
  onOpenScreening: () => void;
  onOpenCrisis: () => void;
  authUser?: { userId: string; email: string } | null;
  onOpenAuth?: () => void;
  onOpenProgressReport?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  userProfile,
  isOpen,
  onToggleSidebar,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onOpenSettings,
  onOpenSelfHelp,
  onOpenScreening,
  onOpenCrisis,
  authUser,
  onOpenAuth,
  onOpenProgressReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [heartLiked, setHeartLiked] = useState(false);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0f2438]/25 backdrop-blur-xs z-30 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 h-full w-[280px] sm:w-[300px] bg-[#f8fbfe]/95 lg:bg-[#f8fbfe] border-r border-[#d4e4f2] flex flex-col justify-between p-4 sm:p-5 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${!isOpen ? 'lg:hidden' : ''}`}
      >
        {/* Top Section: Brand & Action Controls */}
        <div className="flex flex-col space-y-3 sm:space-y-3.5">
          {/* Logo & Collapse Header */}
          <div className="flex items-center justify-between pt-1">
            <div 
              onClick={onNewConversation}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              {/* Heart in Chat Icon */}
              <div className="w-8 h-8 rounded-xl bg-[#e2eef8] text-[#1e3a5f] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  <path d="M12 8.5c-.8-1.2-2.5-1.1-3.2 0-.6 1-.1 2.2 1.2 3.2l2 1.8 2-1.8c1.3-1 1.8-2.2 1.2-3.2-.7-1.1-2.4-1.2-3.2 0z" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-serif italic text-[#1e3a5f] tracking-tight font-medium block leading-none">
                  Hamnafas
                </span>
                <span className="text-[10px] text-[#627d98] font-sans tracking-wide">
                  Mental Health AI
                </span>
              </div>
            </div>

            {/* Sidebar toggle button */}
            <button
              id="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              className="p-1.5 text-[#627d98] hover:text-[#102a43] hover:bg-[#e4eff9] rounded-lg transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              <PanelLeftClose className="w-5 h-5 stroke-[1.6]" />
            </button>
          </div>

          {/* New Conversation Button */}
          <button
            id="new-conversation-btn"
            onClick={onNewConversation}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#dcebf8] text-[#1e3a5f] hover:bg-[#cee3f6] active:scale-[0.98] transition-all duration-150 font-medium text-sm shadow-xs cursor-pointer"
          >
            <SquarePen className="w-4 h-4 stroke-[2]" />
            <span>New Conversation</span>
          </button>

          {/* Screening & Crisis Shortcuts */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenScreening}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white hover:bg-[#eaf2f9] text-[#1e3a5f] border border-[#d6e7f7] text-xs font-medium transition-colors cursor-pointer shadow-xs"
              title="Take PHQ-9 or GAD-7 clinical assessment"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-[#3b668f] shrink-0" />
              <span className="truncate">Screening</span>
            </button>

            <button
              onClick={onOpenCrisis}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Pakistan Emergency Helplines"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">Helplines</span>
            </button>
          </div>

          {/* Progress Report Button */}
          {onOpenProgressReport && (
            <button
              onClick={onOpenProgressReport}
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-white hover:bg-[#eaf2f9] text-[#1e3a5f] border border-[#d6e7f7] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="View your 10-day observational progress report"
            >
              <FileText className="w-3.5 h-3.5 text-[#2b5984] shrink-0" />
              <span>View Progress Report</span>
            </button>
          )}

          {/* Search Conversations Field */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#829ab1] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-conversations-input"
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-transparent hover:bg-[#edf4fa]/60 focus:bg-white text-sm italic text-[#334e68] placeholder:text-[#829ab1] placeholder:italic rounded-lg border border-transparent focus:border-[#b8d5ed] focus:outline-none transition-colors"
            />
          </div>

          {/* History Section */}
          <div className="pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#486581] uppercase tracking-wider mb-2 px-1">
              <Clock className="w-3.5 h-3.5 stroke-[2]" />
              <span>History</span>
            </div>

            <div className="space-y-1 max-h-[calc(100vh-460px)] overflow-y-auto pr-1">
              {filteredConversations.length === 0 ? (
                <p className="text-xs text-[#829ab1] italic px-2 py-3">
                  {searchQuery ? 'No matching conversations' : 'No previous conversations yet'}
                </p>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = activeConversationId === c.id;
                  return (
                    <div
                      key={c.id}
                      id={`conversation-item-${c.id}`}
                      onClick={() => onSelectConversation(c.id)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 text-sm ${
                        isActive
                          ? 'bg-[#d8eaf7] text-[#102a43] font-medium shadow-xs'
                          : 'text-[#486581] hover:bg-[#eaf2f9] hover:text-[#102a43]'
                      }`}
                    >
                      <span className="truncate italic pr-2 font-normal">
                        {c.title}
                      </span>

                      <button
                        onClick={(e) => onDeleteConversation(c.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 hover:bg-white/80 rounded transition-opacity"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Profile & Uplifting Daily Card */}
        <div className="space-y-3 pt-3 border-t border-[#e2ecf5]">
          {/* User Profile Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                {authUser ? authUser.email.charAt(0).toUpperCase() : (userProfile.initial || 'M')}
              </div>
              <div>
                <span className="text-sm font-medium text-[#102a43] block leading-none">
                  {authUser ? authUser.email.split('@')[0] : userProfile.name}
                </span>
                {authUser ? (
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Signed in
                  </span>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="flex items-center gap-1 text-[10px] text-[#627d98] hover:text-[#1e3a5f] font-semibold cursor-pointer transition-colors"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Sign in</span>
                  </button>
                )}
              </div>
            </div>

            <button
              id="open-settings-btn"
              onClick={onOpenSettings}
              className="p-1.5 text-[#627d98] hover:text-[#102a43] hover:bg-[#e4eff9] rounded-lg transition-colors cursor-pointer"
              title="Settings & Backend architecture"
            >
              <Settings className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>

          {/* Inspirational Widget Card */}
          <div className="relative p-3 rounded-2xl bg-[#e5f0fa]/80 border border-[#d2e4f3] flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={pottedPlantImg}
                alt="Plant"
                className="w-9 h-9 object-contain rounded-lg shrink-0"
              />
              <p className="text-xs text-[#243b53] font-medium leading-snug">
                Small steps today,<br />brighter tomorrow.
              </p>
            </div>

            <button
              id="inspiration-heart-btn"
              onClick={() => setHeartLiked(!heartLiked)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                heartLiked ? 'text-rose-500 bg-rose-50' : 'text-[#627d98] hover:text-rose-500 hover:bg-white/60'
              }`}
              title={heartLiked ? 'Loved' : 'Send positive intention'}
            >
              <Heart
                className="w-4 h-4"
                fill={heartLiked ? 'currentColor' : 'none'}
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
