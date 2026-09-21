import React, { useEffect, useState } from 'react';
import { X, FileText, Printer, TrendingUp, Flame, Calendar, ClipboardCheck, Sparkles, AlertCircle } from 'lucide-react';
import { SupportedLanguage, CareStreakData } from '../types';

interface ScreeningHistoryItem {
  id: string;
  type: string;
  score: number;
  maxScore: number;
  severityLevel: string;
  crisisTriggered: boolean;
  createdAt: string;
}

interface ProgressReportData {
  periodDays: number;
  moodTrend: {
    totalCheckIns: number;
    recentMoods: string[];
    direction: 'improving' | 'stable' | 'worsening' | 'fluctuating';
    history: Array<{ mood: string; date: string }>;
  };
  streakCount: number;
  screeningHistory: ScreeningHistoryItem[];
  aiSummary: string;
}

interface ProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: SupportedLanguage;
  careStreak?: CareStreakData;
}

export const ProgressReportModal: React.FC<ProgressReportModalProps> = ({
  isOpen,
  onClose,
  lang = 'roman_urdu',
  careStreak,
}) => {
  const isRu = lang === 'roman_urdu';
  const [data, setData] = useState<ProgressReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const guestToken = typeof window !== 'undefined' ? localStorage.getItem('hamnafas_guest_token') : null;
    const streakParam = careStreak ? `&streak=${careStreak.streak}` : '';
    const langParam = `&lang=${encodeURIComponent(lang)}`;

    fetch(`/api/reports/summary?days=10${streakParam}${langParam}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(guestToken ? { 'x-guest-token': guestToken } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Could not generate report summary');
        return res.json();
      })
      .then((json: ProgressReportData) => {
        if (!cancelled) {
          setData(json);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('[ProgressReportModal] Fetch error:', err);
          setError(
            isRu
              ? 'Report tayyar karne mein masla pesh aya. Baraye meharbani kuch dair baad koshish karein.'
              : 'Could not load your progress report. Please try again shortly.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, careStreak?.streak, lang, isRu]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getDirectionBadge = (dir: string) => {
    switch (dir) {
      case 'improving':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: isRu ? 'Behtari (Improving)' : 'Improving',
        };
      case 'worsening':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: isRu ? 'Tawajjo Talab (Needs Attention)' : 'Needs Attention',
        };
      case 'fluctuating':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: isRu ? 'Tabdeel Pazeer (Fluctuating)' : 'Fluctuating',
        };
      default:
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          label: isRu ? 'Mustahkam (Stable)' : 'Stable',
        };
    }
  };

  const directionBadge = data ? getDirectionBadge(data.moodTrend.direction) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173d60]/40 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl bg-[#fbfdf9] rounded-3xl border border-[#c9dfed] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Header */}
        <div className="px-6 py-4 bg-[#e6f3fa] border-b border-[#c9dfed] flex items-center justify-between print:bg-white print:border-b-2">
          <div className="flex items-center gap-2.5 text-[#244f77]">
            <div className="p-2 rounded-xl bg-[#c9dfed] text-[#2b6f9f] print:hidden">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isRu ? 'Hamnafas Progress & Observational Report' : 'Hamnafas Progress & Observational Summary'}
              </h3>
              <p className="text-xs text-[#5d7890]">
                {isRu
                  ? 'Pichle 10 dinon ka khulasa — doctor ya therapist ke sath share karne ke liye'
                  : '10-day summary to share with your healthcare provider or supporting adult'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2b6f9f] hover:bg-[#245b80] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Save or Print Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isRu ? 'Print / Save' : 'Print / Save'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#2b6f9f] hover:text-[#244f77] hover:bg-[#c9dfed] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 print:overflow-visible print:p-4 text-xs sm:text-sm">
          {isLoading && (
            <div className="py-12 text-center text-[#5d7890] space-y-2">
              <div className="w-6 h-6 border-2 border-[#2b6f9f] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>{isRu ? 'Aapki report tayyar ho rahi hai...' : 'Generating your progress summary...'}</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {data && !isLoading && (
            <>
              {/* Top Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-white border border-[#c9dfed] shadow-xs">
                  <div className="flex items-center gap-1.5 text-[#5d7890] text-xs font-medium mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#2b6f9f]" />
                    <span>{isRu ? 'Muddat' : 'Period'}</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-[#244f77]">
                    {data.periodDays} {isRu ? 'Din' : 'Days'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#c9dfed] shadow-xs">
                  <div className="flex items-center gap-1.5 text-[#5d7890] text-xs font-medium mb-1">
                    <Flame className="w-3.5 h-3.5 text-[#2b6f9f]" />
                    <span>{isRu ? 'Silsila (Streak)' : 'Care Streak'}</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-[#2b6f9f]">
                    {data.streakCount} {isRu ? 'din' : 'days'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#c9dfed] shadow-xs">
                  <div className="flex items-center gap-1.5 text-[#5d7890] text-xs font-medium mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#2b6f9f]" />
                    <span>{isRu ? 'Check-ins' : 'Check-ins'}</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-[#244f77]">
                    {data.moodTrend.totalCheckIns}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#c9dfed] shadow-xs">
                  <div className="flex items-center gap-1.5 text-[#5d7890] text-xs font-medium mb-1">
                    <ClipboardCheck className="w-3.5 h-3.5 text-[#2b5984]" />
                    <span>{isRu ? 'Screenings' : 'Screenings'}</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-[#244f77]">
                    {data.screeningHistory.length}
                  </p>
                </div>
              </div>

              {/* AI Observational Summary Card */}
              <div className="p-4.5 rounded-2xl bg-[#e9f5fb] border border-[#b9d8ea] space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-[#244f77] font-bold">
                    <Sparkles className="w-4 h-4 text-[#2b6f9f]" />
                    <span>{isRu ? 'Observational Khulasa' : 'Observational Summary'}</span>
                  </div>
                  {directionBadge && (
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${directionBadge.bg}`}>
                      {directionBadge.label}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#49657f] leading-relaxed whitespace-pre-line">
                  {data.aiSummary}
                </p>
                <div className="pt-1.5 border-t border-[#c9dfed] text-[11px] text-[#5d7890] italic">
                  {isRu
                    ? '⚠️ Zaroori wazahat: Yeh summary kisi tibbi tashkhees (diagnosis) ya ilaj ki nishan-dahi nahi karti, balki doctor ya family member ke sath mufeed guftagu ke liye tayyar ki gayi hai.'
                    : '⚠️ Clinical notice: This summary is an observational engagement tracker to assist discussions with your clinician or therapist. It is not a diagnostic evaluation.'}
                </div>
              </div>

              {/* Mood History Timeline */}
              {data.moodTrend.history && data.moodTrend.history.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#2b6f9f]">
                    {isRu ? 'Recent Mood Log' : 'Recent Mood Log'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.moodTrend.history.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-white border border-[#c9dfed] text-xs text-[#244f77] inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="font-semibold">{m.mood}</span>
                        <span className="text-[10px] text-[#5f7488]">
                          {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Screening History */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#2b6f9f]">
                  {isRu ? 'Clinical Screening History (PHQ-9 / GAD-7)' : 'Clinical Screening History (PHQ-9 / GAD-7)'}
                </h4>
                {data.screeningHistory.length === 0 ? (
                  <p className="text-xs text-[#5d7890] italic bg-white p-3 rounded-xl border border-[#c9dfed]">
                    {isRu
                      ? 'Is muddat mein koi clinical screening nahi li gayi.'
                      : 'No PHQ-9 or GAD-7 screenings completed within this 10-day period.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.screeningHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-white border border-[#c9dfed] flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs uppercase text-[#173d60]">
                              {item.type.toUpperCase()}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4f8fc] border border-[#e2ecf5] text-[#1e3a5f] font-semibold">
                              {item.score} / {item.maxScore}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium">
                              {item.severityLevel}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#5f7488] mt-0.5 block">
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {item.crisisTriggered && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                            Safety review
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer note */}
          <div className="p-3 bg-[#e6f3fa] rounded-xl text-center text-xs text-[#5d7890] print:mt-4">
            <span>Hamnafas — Empathetic Mental Health Support in Pakistan. </span>
            <span className="font-semibold">www.hamnafas.pk</span>
          </div>
        </div>
      </div>
    </div>
  );
};
