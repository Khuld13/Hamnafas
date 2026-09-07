import React from 'react';
import { MOOD_OPTIONS } from '../data/mockData';
import { MoodType } from '../types';
import { MoodFace } from './MoodFace';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelectMood }) => {
  return (
    <div className="w-full flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-2">
      {MOOD_OPTIONS.map((item) => {
        const isSelected = selectedMood === item.id;
        return (
          <button
            key={item.id}
            id={`mood-card-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => onSelectMood(item.id)}
            className={`group relative flex flex-col items-center justify-center p-2.5 sm:py-3 sm:px-3.5 rounded-2xl transition-all duration-200 cursor-pointer min-w-[76px] sm:min-w-[88px] ${
              isSelected
                ? 'bg-white shadow-lg ring-2 ring-[#4a7298]/30 scale-[1.03] -translate-y-1'
                : 'bg-white/80 hover:bg-white hover:-translate-y-0.5 hover:shadow-md border border-white/90 shadow-[0_4px_16px_rgba(70,100,140,0.06)]'
            }`}
          >
            {/* Soft active glow background indicator */}
            {isSelected && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5b87ad] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#386289]"></span>
              </span>
            )}

            <div className="mb-1.5">
              <MoodFace mood={item.id} size={40} />
            </div>

            <span
              className={`text-xs sm:text-[13px] font-medium tracking-tight whitespace-nowrap transition-colors ${
                isSelected ? 'text-[#1e3a5f] font-semibold' : 'text-[#334e68]'
              }`}
            >
              {item.label}
            </span>

            {/* Subtle Roman Urdu subtitle */}
            <span className="text-[10px] text-[#627d98] font-normal italic truncate max-w-[70px]">
              {item.labelRomanUrdu}
            </span>
          </button>
        );
      })}
    </div>
  );
};
