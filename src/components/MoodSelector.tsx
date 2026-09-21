import React from 'react';
import { MOOD_OPTIONS } from '../data/mockData';
import { MoodType } from '../types';
import { MoodFace } from './MoodFace';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelectMood }) => (
  <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="group" aria-label="Choose how you feel">
    {MOOD_OPTIONS.map((item) => {
      const isSelected = selectedMood === item.id;
      return (
        <button
          key={item.id}
          id={`mood-card-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={() => onSelectMood(item.id)}
          aria-pressed={isSelected}
          className={`flex min-h-[82px] items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all sm:flex-col sm:justify-center sm:gap-1.5 sm:text-center ${
            isSelected
              ? 'border-[#9bbbd3] bg-white shadow-[0_8px_24px_rgba(33,72,105,.08)] ring-2 ring-[#d9e9f4]'
              : 'border-[#dce8f2] bg-white/80 hover:border-[#bfd5e5] hover:bg-white'
          }`}
        >
          <MoodFace mood={item.id} size={34} />
          <span className={`text-xs font-bold ${isSelected ? 'text-[#173d60]' : 'text-[#49657f]'}`}>{item.label}</span>
          <span className="text-[10px] text-[#5f7488]">{item.labelRomanUrdu}</span>
        </button>
      );
    })}
  </div>
);
