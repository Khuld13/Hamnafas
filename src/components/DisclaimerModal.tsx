import React from 'react';
import { ShieldCheck, Heart, Stethoscope, ArrowRight } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  lang?: SupportedLanguage;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onAcknowledge,
  lang = 'roman_urdu',
}) => {
  if (!isOpen) return null;

  const isRu = lang === 'roman_urdu';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a192f]/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#fefcfc] rounded-3xl border border-rose-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-rose-50 border-b border-rose-200 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-950">
              {isRu ? 'Shuru karne se pehle' : 'Before you begin'}
            </h3>
            <p className="text-xs text-rose-800">
              {isRu
                ? 'Hamnafas ke istemal aur hifazat ke baare mein ahem maloomat'
                : 'Important notice regarding safety and professional medical care'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-sm text-rose-950 leading-relaxed space-y-2">
            <p className="font-semibold flex items-center gap-2 text-rose-900">
              <Heart className="w-4 h-4 text-rose-600 fill-rose-600/30 shrink-0" />
              <span>{isRu ? 'Aapki zehni sehat hamari awwaleen tarjeeh hai' : 'Your well-being is our priority'}</span>
            </p>
            <p>
              {isRu
                ? 'Hamnafas ek AI screening aur emotional support companion hai — yeh koi tibbi (medical) tashkhees (diagnosis) ya ilaj (treatment) nahi hai.'
                : 'Hamnafas is a screening and emotional support companion. It does not provide medical diagnoses or clinical treatment.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e2ecf5] text-xs text-[#334e68] leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold text-sm">
              <Stethoscope className="w-4 h-4 text-[#2b5984] shrink-0" />
              <span>{isRu ? 'Professional Doctor / Therapist ki Zaroorat' : 'Professional Healthcare Advisory'}</span>
            </div>
            <p>
              {isRu
                ? 'Agar aap kisi musalsal pareshani, shadeed bechaini ya takleef se guzar rahe hain, toh kisi mustanad doctor ya psychologist/therapist se milna behad zaroori aur mufeed hai. Hamnafas doctor ki jagah nahi le sakta, balki unki dekhbhal ke sath ek sathi ke tor par kaam karta hai.'
                : 'If you are dealing with persistent distress, clinical symptoms, or ongoing challenges, a visit to a qualified doctor or licensed therapist is strongly encouraged. Hamnafas works alongside professional care, not in place of it.'}
            </p>
            <p className="text-[11px] text-[#627d98]">
              {isRu
                ? 'Emergency ya shadeed khatray ki soorat mein foran 1122 ya hamari helplines screen se rabta karein.'
                : 'In life-threatening emergencies, dial 1122 or access partner crisis hotlines immediately.'}
            </p>
          </div>

          {/* Action Button - single, non-dismissible */}
          <div className="pt-2">
            <button
              onClick={onAcknowledge}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#1e3a5f] hover:bg-[#102a43] active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>{isRu ? 'Theek hai, aage badhein' : 'I understand, continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
