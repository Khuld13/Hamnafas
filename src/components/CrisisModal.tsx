import React from 'react';
import { X, ShieldAlert, PhoneCall, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { PAKISTAN_CRISIS_PARTNERS } from '../data/screeningData';
import { SupportedLanguage } from '../types';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: SupportedLanguage;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  lang = 'roman_urdu',
}) => {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#173d60]/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#fefcfc] rounded-2xl sm:rounded-3xl border border-rose-200 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-3 sm:px-6 py-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2.5 text-rose-900">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold break-words">
                {lang === 'roman_urdu'
                  ? 'Pakistan Crisis & Helplines Network'
                  : 'Immediate Human Support in Pakistan'}
              </h3>
              <p className="text-xs leading-5 break-words text-rose-800">
                {lang === 'roman_urdu'
                  ? 'Muft, mehfooz aur confidential nafsiyaati madadi shabka'
                  : 'Free, confidential 24/7 mental health crisis support'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-700 hover:text-rose-950 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-3 py-4 sm:px-6 overflow-y-auto space-y-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 leading-relaxed">
            <p className="font-semibold mb-1 flex items-center gap-1.5 text-rose-900">
              <Heart className="w-4 h-4 text-rose-600 fill-rose-600/30" />
              <span>Aap akele nahi hain — You are not alone.</span>
            </p>
            <p>
              {lang === 'roman_urdu'
                ? 'Hamnafas AI ek safe companion hai, lekin agar aap shadeed takleef, ghair mehfooz khayalaat ya khud ko nuqsan pohanchanay ke bojh se guzar rahe hain, toh baraye meharbani foran insani counselors se baat karein. Yeh helpline bilkul muft aur posheeda hain.'
                : 'If you are experiencing overwhelming distress, painful thoughts, or self-harm ideation, please connect with professional human counselors immediately. Reaching out for help is a sign of immense courage.'}
            </p>
          </div>

          {/* Partner Hotline Cards */}
          <div className="space-y-3">
            {PAKISTAN_CRISIS_PARTNERS.map((partner) => (
              <div
                key={partner.id}
                className="p-4 rounded-2xl bg-white border border-[#e2ecf5] hover:border-[#7ba8c9] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#173d60]">{partner.name}</h4>
                    {partner.tollFree && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        Toll-Free / Free
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-5 break-words text-[#486581]">
                    {lang === 'roman_urdu' ? partner.serviceRomanUrdu : partner.serviceEn}
                  </p>
                  <span className="inline-block text-[11px] text-[#627d98] font-medium">
                    🕒 {partner.availability}
                  </span>
                </div>

                <a
                  href={`tel:${partner.phone.replace(/[^0-9]/g, '')}`}
                  className="px-4 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#173d60] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 max-w-full"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{partner.phone}</span>
                </a>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#edf5fc] rounded-xl text-center text-xs text-[#486581]">
            <span>Medical or immediate life-threatening rescue: </span>
            <a href="tel:1122" className="font-bold text-[#1e3a5f] underline ml-1">
              Dial 1122
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
