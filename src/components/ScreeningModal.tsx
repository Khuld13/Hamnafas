import React, { useState } from 'react';
import { 
  X, 
  ClipboardCheck, 
  Activity, 
  AlertTriangle, 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  MessageSquare, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { ScreeningType, SupportedLanguage, ScreeningResult } from '../types';
import { 
  PHQ9_QUESTIONS, 
  GAD7_QUESTIONS, 
  SCREENING_OPTIONS, 
  calculatePHQ9Result, 
  calculateGAD7Result,
  PAKISTAN_CRISIS_PARTNERS 
} from '../data/screeningData';
import confetti from 'canvas-confetti';

interface ScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendResultToChat?: (result: ScreeningResult, messageText: string) => void;
  initialType?: ScreeningType;
  userLanguage?: SupportedLanguage;
}

export const ScreeningModal: React.FC<ScreeningModalProps> = ({
  isOpen,
  onClose,
  onSendResultToChat,
  initialType = 'phq9',
  userLanguage = 'roman_urdu',
}) => {
  const [screeningType, setScreeningType] = useState<ScreeningType>(initialType);
  const lang = userLanguage;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ScreeningResult | null>(null);

  if (!isOpen) return null;

  const questions = screeningType === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (value: number) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Completed all questions -> Calculate score
      let calculatedResult: ScreeningResult;
      if (screeningType === 'phq9') {
        calculatedResult = calculatePHQ9Result(updatedAnswers);
      } else {
        calculatedResult = calculateGAD7Result(updatedAnswers);
      }
      setResult(calculatedResult);

      // Celebratory confetti only fits low-distress results. Never fire it
      // alongside a crisis escalation banner or a Moderately Severe/Severe
      // result — that reads as tone-deaf right when someone has disclosed
      // serious symptoms or self-harm thoughts (PHQ-9 item 9).
      const isCelebratoryResult =
        !calculatedResult.crisisTriggered &&
        calculatedResult.severityLevel !== 'Moderately Severe' &&
        calculatedResult.severityLevel !== 'Severe';

      if (isCelebratoryResult) {
        confetti({
          particleCount: 50,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#7ba8c9', '#a7deb9', '#fad976'],
        });
      }
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
  };

  const handleSwitchType = (type: ScreeningType) => {
    setScreeningType(type);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
  };

  const handleDiscussInChat = () => {
    if (!result) return;
    const typeLabel = result.type === 'phq9' ? 'PHQ-9 Depression Screening' : 'GAD-7 Anxiety Screening';
    const msg =
      lang === 'roman_urdu'
        ? `Maine abhi apna **${typeLabel}** mukammal kiya hai. Mera score **${result.score}/${result.maxScore} (${result.severityLevelRomanUrdu})** aaya hai. Kya hum iske baare mein baat kar sakte hain?`
        : `I just completed my **${typeLabel}**. My score is **${result.score}/${result.maxScore} (${result.severityLevel})**. Can we talk through these findings together?`;

    if (onSendResultToChat) {
      onSendResultToChat(result, msg);
    }
    onClose();
  };

  const getQuestionText = () => {
    if (lang === 'roman_urdu') return currentQuestion.textRomanUrdu;
    return currentQuestion.textEn;
  };

  const getOptionLabel = (opt: typeof SCREENING_OPTIONS[0]) => {
    if (lang === 'roman_urdu') return opt.labelRomanUrdu;
    return opt.labelEn;
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'Minimal':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Mild':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Moderate':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Moderately Severe':
      case 'Severe':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a192f]/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#f8fbfe] rounded-3xl border border-[#d6e7f7] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white/95 border-b border-[#d8e7f5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e3effa] text-[#1e3a5f] flex items-center justify-center shadow-xs">
              {screeningType === 'phq9' ? (
                <ClipboardCheck className="w-5 h-5 text-[#244f77]" />
              ) : (
                <Activity className="w-5 h-5 text-[#244f77]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#102a43] flex items-center gap-2">
                <span>{screeningType === 'phq9' ? 'PHQ-9 Depression Screening' : 'GAD-7 Anxiety Screening'}</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#dcebf8] text-[#1e3a5f]">
                  Validated Clinical Framework
                </span>
              </h3>
              <p className="text-xs text-[#627d98]">
                {screeningType === 'phq9'
                  ? 'Standard 9-item Patient Health Questionnaire for mood & fatigue'
                  : 'Standard 7-item Generalized Anxiety scale for tension & worry'}
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

        {/* Sub-bar: Type Selector & Language Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 bg-[#edf4fb] border-b border-[#d8e7f5]">
          {/* Framework tabs */}
          <div className="inline-flex p-0.5 bg-white/80 rounded-xl border border-[#d2e4f3] shadow-xs">
            <button
              onClick={() => handleSwitchType('phq9')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                screeningType === 'phq9' ? 'bg-[#1e3a5f] text-white shadow-xs' : 'text-[#486581] hover:text-[#102a43]'
              }`}
            >
              PHQ-9 (Depression)
            </button>
            <button
              onClick={() => handleSwitchType('gad7')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                screeningType === 'gad7' ? 'bg-[#1e3a5f] text-white shadow-xs' : 'text-[#486581] hover:text-[#102a43]'
              }`}
            >
              GAD-7 (Anxiety)
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!result ? (
            /* ================= QUESTION FLOW ================= */
            <div className="space-y-6">
              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-[#486581] mb-1.5">
                  <span>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span>{progressPercent}% completed</span>
                </div>
                <div className="w-full h-2 bg-[#dcebf8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1e3a5f] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Timeframe Instruction */}
              <div className="p-3 bg-[#e8f2fa] rounded-xl border border-[#d2e4f3] text-xs text-[#244f77] flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-[#3b668f]" />
                <span>
                  {lang === 'roman_urdu'
                    ? 'Pichle 2 hafton ke dauran, aapko darj zail masail ka kitna saamna raha?'
                    : 'Over the last 2 weeks, how often have you been bothered by the following?'}
                </span>
              </div>

              {/* Current Question Box */}
              <div className="p-5 rounded-2xl bg-white border border-[#d8e7f5] shadow-xs">
                <span className="inline-block text-xs font-bold text-[#627d98] mb-1">
                  Item #{currentQuestion.id}
                </span>
                <h4 className="text-base sm:text-lg font-medium text-[#102a43] leading-snug">
                  {getQuestionText()}
                </h4>
              </div>

              {/* Option Selection List */}
              <div className="space-y-2.5">
                {SCREENING_OPTIONS.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectOption(opt.value)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-sm'
                          : 'bg-white hover:bg-[#edf5fc] text-[#102a43] border-[#d4e4f2]'
                      }`}
                    >
                      <span className="text-sm font-medium">{getOptionLabel(opt)}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#eaf2f9] text-[#486581]'
                        }`}
                      >
                        +{opt.value} pt{opt.value !== 1 ? 's' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#486581] hover:bg-[#e4eff9] disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleReset}
                  className="text-xs text-[#829ab1] hover:text-[#102a43] underline transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            /* ================= RESULT CARD ================= */
            <div className="space-y-5">
              {/* Crisis Escalation Banner if triggered */}
              {result.crisisTriggered && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-rose-900">
                        {lang === 'roman_urdu'
                          ? 'Fauri Madad aur Hifazat ki Zaroorat'
                          : 'Immediate Care & Safety Recommended'}
                      </h4>
                      <p className="text-xs leading-relaxed text-rose-800">
                        {lang === 'roman_urdu'
                          ? 'Aapke jawabaat shadeed bojh ya mushkil khayalaat ki taraf ishara kar rahe hain. Hamnafas AI ek dost hai, lekin aisi soorat mein insani mahireen se rabta karna intehai zaroori hai.'
                          : 'Your screening indicates high distress or thoughts of self-harm. You deserve safe, dedicated human care. Please call verified Pakistani partner helplines below.'}
                      </p>
                      <div className="pt-2 flex flex-wrap gap-2">
                        <a
                          href="tel:03117786264"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call Umang Helpline (0311-7786264)</span>
                        </a>
                        <a
                          href="tel:080022444"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-semibold"
                        >
                          <span>Rozan (0800-22444)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Score & Severity Summary Box */}
              <div className="p-5 rounded-2xl bg-white border border-[#d6e7f7] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#edf4fb]">
                  <div>
                    <span className="text-xs font-bold text-[#627d98] uppercase tracking-wider">
                      {result.type === 'phq9' ? 'PHQ-9 Total Score' : 'GAD-7 Total Score'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-bold text-[#102a43]">{result.score}</span>
                      <span className="text-sm font-medium text-[#627d98]">/ {result.maxScore}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <span className="text-xs font-semibold text-[#627d98] mb-1">Severity Level</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityBadgeClass(
                        result.severityLevel
                      )}`}
                    >
                      {lang === 'roman_urdu'
                        ? result.severityLevelRomanUrdu
                        : result.severityLevel}
                    </span>
                  </div>
                </div>

                {/* Score Visual Meter */}
                <div>
                  <div className="h-3 w-full bg-[#edf4fb] rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        result.score <= 4
                          ? 'bg-emerald-500'
                          : result.score <= 9
                          ? 'bg-amber-500'
                          : result.score <= 14
                          ? 'bg-orange-500'
                          : 'bg-rose-600'
                      }`}
                      style={{ width: `${Math.min(100, (result.score / result.maxScore) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#829ab1] mt-1 font-medium">
                    <span>Minimal (0)</span>
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe ({result.maxScore})</span>
                  </div>
                </div>

                {/* Summary Explanation */}
                <p className="text-sm text-[#243b53] leading-relaxed">
                  {lang === 'roman_urdu'
                    ? result.summaryRomanUrdu
                    : result.summaryEn}
                </p>
              </div>

              {/* Actionable Tailored Recommendations */}
              <div className="p-4 rounded-2xl bg-[#edf5fc] border border-[#d2e4f3] space-y-2.5">
                <h4 className="text-xs font-bold text-[#102a43] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3b668f]" />
                  <span>
                    {lang === 'roman_urdu'
                      ? 'Tajweez Karda Iqdamaat (Tailored Coping Steps)'
                      : 'Recommended Evidence-Based Actions'}
                  </span>
                </h4>
                <ul className="space-y-1.5">
                  {(lang === 'roman_urdu' ? result.recommendationsRomanUrdu : result.recommendations).map(
                    (rec, idx) => (
                      <li key={idx} className="text-xs text-[#334e68] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4a7298] mt-1.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Bottom Action Triggers */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#cbdbe8] hover:bg-white text-xs font-medium text-[#486581] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Screening</span>
                </button>

                <button
                  onClick={handleDiscussInChat}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1e3a5f] hover:bg-[#102a43] active:scale-98 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuss with Hamnafas in Chat →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
