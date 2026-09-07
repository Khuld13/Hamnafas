import React, { useEffect, useRef } from 'react';
import { Flame, Check, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CareRoutineItem, CareStreakData, SupportedLanguage } from '../types';

interface CareStreakProps {
  items: CareRoutineItem[];
  data: CareStreakData;
  onToggleItem: (id: string) => void;
  lang: SupportedLanguage;
  compact?: boolean;
  onOpenProgressReport?: () => void;
}

export const CareStreak: React.FC<CareStreakProps> = ({
  items,
  data,
  onToggleItem,
  lang,
  compact,
  onOpenProgressReport,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const prevAllDone = useRef(false);
  const allDone = items.every((it) => data.completedToday.includes(it.id));

  // Small celebratory confetti burst exactly once, the moment every item for
  // today gets checked off — a tiny reward, not a demand.
  useEffect(() => {
    if (allDone && !prevAllDone.current && items.length > 0) {
      const rect = wrapRef.current?.getBoundingClientRect();
      confetti({
        particleCount: 60,
        spread: 65,
        startVelocity: 28,
        gravity: 0.9,
        scalar: 0.8,
        colors: ['#7ba8c9', '#a8c98a', '#f0b784', '#1e3a5f'],
        origin: rect
          ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + 20) / window.innerHeight }
          : { y: 0.6 },
      });
    }
    prevAllDone.current = allDone;
  }, [allDone, items.length]);

  const isRu = lang === 'roman_urdu';

  return (
    <div ref={wrapRef} className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              data.streak > 0 ? 'bg-[#f7e3ce] text-[#b8703a]' : 'bg-[#edf5fc] text-[#7ba8c9]'
            }`}
          >
            <Flame className={`w-4.5 h-4.5 ${data.streak > 0 ? 'animate-flame' : ''}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#102a43] leading-none">
              {data.streak > 0
                ? isRu
                  ? `${data.streak} din ka silsila`
                  : `${data.streak}-day streak`
                : isRu
                ? 'Aaj se shuru karein'
                : 'Start today'}
            </p>
            <p className="text-[11px] text-[#829ab1] mt-0.5">
              {isRu
                ? 'Din chhoot jaye to bhi koi baat nahi — hum yahin hain.'
                : "Miss a day and it's completely fine — we'll still be here."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {data.bestStreak > 0 && (
            <span className="text-[10px] font-semibold text-[#829ab1] bg-[#f4f8fc] px-2.5 py-1 rounded-full border border-[#e2ecf5]">
              {isRu ? `Best: ${data.bestStreak} din` : `Best: ${data.bestStreak}d`}
            </span>
          )}
          {onOpenProgressReport && (
            <button
              onClick={onOpenProgressReport}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f] hover:bg-[#102a43] text-white text-[11px] font-semibold shadow-xs transition-colors cursor-pointer"
              title={isRu ? 'Apni progress report dekhein' : 'View your progress report'}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isRu ? 'Meri Report' : 'Progress Report'}</span>
            </button>
          )}
        </div>
      </div>

      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-2`}>
        {items.map((item) => {
          const done = data.completedToday.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                done
                  ? 'bg-[#eaf3e4] border-[#bcd6ac] text-[#3c5535]'
                  : 'bg-white border-[#d6e7f7] text-[#334e68] hover:border-[#8cb7db]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg leading-none">{item.emoji}</span>
                {done && (
                  <span className="w-4.5 h-4.5 rounded-full bg-[#4c6b43] text-white flex items-center justify-center animate-pop-in">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium leading-snug">
                {isRu ? item.labelRomanUrdu : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
