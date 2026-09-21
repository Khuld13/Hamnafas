import React, { useState } from 'react';
import { SquarePen, Search, Clock3, Settings, HeartHandshake, PanelLeftClose, Trash2, ClipboardCheck, ShieldCheck, LogIn, FileText, Sparkles } from 'lucide-react';
import { Conversation, UserProfile } from '../types';

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
  conversations, activeConversationId, userProfile, isOpen, onToggleSidebar, onSelectConversation,
  onNewConversation, onDeleteConversation, onOpenSettings, onOpenSelfHelp, onOpenScreening,
  onOpenCrisis, authUser, onOpenAuth, onOpenProgressReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredConversations = conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-[#173d60]/20 backdrop-blur-sm lg:hidden" onClick={onToggleSidebar} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[286px] flex-col border-r border-[#c9dfed] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
        <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
          <div className="flex items-center justify-between">
            <button onClick={onNewConversation} className="flex items-center gap-2.5 text-left" aria-label="Open Hamnafas and start a new conversation">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcebf8] text-[#173d60]"><HeartHandshake className="h-5 w-5" /></span>
              <span><span className="block font-serif text-[1.5rem] leading-none text-[#173d60]">Hamnafas</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.13em] text-[#8197aa]">Your private space</span></span>
            </button>
            <button onClick={onToggleSidebar} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5f7488] hover:bg-white hover:text-[#173d60]" title="Close menu"><PanelLeftClose className="h-5 w-5" /></button>
          </div>

          <button id="new-conversation-btn" onClick={onNewConversation} className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#173d60] text-sm font-bold text-white hover:bg-[#102f4b]"><SquarePen className="h-4 w-4" /> New conversation</button>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={onOpenScreening} className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#dce8f2] bg-white text-xs font-bold text-[#49657f] hover:bg-[#f4f8fb]"><ClipboardCheck className="h-3.5 w-3.5" /> Screening</button>
            <button onClick={onOpenCrisis} className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#ecdcdc] bg-[#fffafa] text-xs font-bold text-[#805555] hover:bg-[#edf5fc]"><ShieldCheck className="h-3.5 w-3.5" /> Support</button>
          </div>

          <div className="mt-3 grid gap-2">
            {onOpenSelfHelp && <button onClick={() => onOpenSelfHelp()} className="flex h-10 items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-[#49657f] hover:bg-white"><Sparkles className="h-4 w-4 text-[#2d638f]" /> Exercises</button>}
            {onOpenProgressReport && <button onClick={onOpenProgressReport} className="flex h-10 items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-[#49657f] hover:bg-white"><FileText className="h-4 w-4 text-[#2d638f]" /> Progress</button>}
          </div>

          <div className="mt-5 flex min-h-0 flex-1 flex-col">
            <label htmlFor="search-conversations-input" className="sr-only">Search conversations</label>
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f7488]" /><input id="search-conversations-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search conversations" className="h-10 w-full rounded-xl border border-[#dce8f2] bg-white pl-9 pr-3 text-xs text-[#173d60] outline-none placeholder:text-[#5f7488] focus:border-[#9ebdd4]" /></div>
            <div className="mt-5 flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#5f7488]"><Clock3 className="h-3.5 w-3.5" /> Conversations</div>
            <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {filteredConversations.length === 0 ? <p className="px-2 py-4 text-xs leading-5 text-[#5f7488]">{searchQuery ? 'No matching conversations.' : 'Your conversations will appear here.'}</p> : filteredConversations.map((c) => {
                const active = c.id === activeConversationId;
                return <div key={c.id} id={`conversation-item-${c.id}`} onClick={() => onSelectConversation(c.id)} className={`group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-xs ${active ? 'bg-[#e4f0f8] font-bold text-[#173d60]' : 'text-[#607990] hover:bg-white hover:text-[#173d60]'}`}><span className="truncate">{c.title}</span><button onClick={(e) => onDeleteConversation(c.id, e)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#9aabba] opacity-0 group-hover:opacity-100 hover:bg-[#edf5fc] hover:text-[#a44f4f]" title="Delete conversation" aria-label={`Delete ${c.title}`}><Trash2 className="h-3.5 w-3.5" /></button></div>;
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-[#c9dfed] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#173d60] text-xs font-bold text-white">{authUser ? authUser.email.charAt(0).toUpperCase() : (userProfile.initial || 'G')}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#173d60]">{authUser ? authUser.email.split('@')[0] : userProfile.name}</p>{authUser ? <p className="mt-0.5 text-[10px] font-semibold text-[#2d638f]">Signed in</p> : <button onClick={onOpenAuth} className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#5f7488] hover:text-[#173d60]"><LogIn className="h-3 w-3" /> Sign in to sync</button>}</div>
            <button onClick={onOpenSettings} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5f7488] hover:bg-white hover:text-[#173d60]" title="Settings"><Settings className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
    </>
  );
};
