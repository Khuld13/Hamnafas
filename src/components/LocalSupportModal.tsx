import React, { useEffect, useState } from 'react';
import { X, HeartHandshake, PhoneCall, MapPin, Stethoscope, Globe2 } from 'lucide-react';
import { LocalSupportDirectory, LocalSupportProvider, SupportedLanguage } from '../types';

interface LocalSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: SupportedLanguage;
}

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];

const typeLabel = (type: LocalSupportProvider['type'], lang: SupportedLanguage) => {
  const labels: Record<LocalSupportProvider['type'], { en: string; ru: string }> = {
    psychiatrist: { en: 'Psychiatrist', ru: 'Psychiatrist' },
    psychologist: { en: 'Psychologist', ru: 'Psychologist' },
    counseling_center: { en: 'Counseling Center', ru: 'Counseling Center' },
    helpline_org: { en: 'Helpline', ru: 'Helpline' },
  };
  return lang === 'roman_urdu' ? labels[type].ru : labels[type].en;
};

const ProviderCard: React.FC<{ provider: LocalSupportProvider; lang: SupportedLanguage }> = ({ provider, lang }) => (
  <div className="p-4 rounded-2xl bg-white border border-[#dbe8d6] hover:border-[#8fa989] shadow-xs flex items-start justify-between gap-3 transition-all">
    <div className="space-y-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <h4 className="text-sm font-bold text-[#2f3e2a]">{provider.name}</h4>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eef3ea] text-[#4c6b43] font-semibold border border-[#cfe0c8]">
          {typeLabel(provider.type, lang)}
        </span>
        {provider.city !== 'Nationwide' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fdf1e4] text-[#8a5a2b] font-semibold border border-[#f0d9bb] inline-flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5" /> {provider.city}
          </span>
        )}
      </div>
      <p className="text-xs text-[#5b6b55] leading-relaxed">
        {lang === 'roman_urdu' ? provider.serviceRomanUrdu : provider.serviceEn}
      </p>
      <span className="inline-block text-[11px] text-[#6f7d68] font-medium">🕒 {provider.availability}</span>
    </div>

    <a
      href={`tel:${provider.phone.replace(/[^0-9]/g, '')}`}
      className="px-4 py-2 rounded-xl bg-[#4c6b43] hover:bg-[#3c5535] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
    >
      <PhoneCall className="w-3.5 h-3.5" />
      <span>{provider.phone}</span>
    </a>
  </div>
);

export const LocalSupportModal: React.FC<LocalSupportModalProps> = ({ isOpen, onClose, lang = 'roman_urdu' }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [directory, setDirectory] = useState<LocalSupportDirectory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoading(true);

    const query = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : '';
    fetch(`/api/support/local${query}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LocalSupportDirectory | null) => {
        if (!cancelled && data) setDirectory(data);
      })
      .catch(() => {
        // Fail quietly — nationwide fallback numbers are shown from static
        // copy below regardless, so the person is never left with nothing.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedCity]);

  if (!isOpen) return null;

  const hasLocalListings = (directory?.localProviders?.length ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#243b53]/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#fbfdf9] rounded-3xl border border-[#dbe8d6] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#eef3ea] border-b border-[#dbe8d6] flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[#2f3e2a]">
            <div className="p-2 rounded-xl bg-[#dbe8d6] text-[#4c6b43]">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {lang === 'roman_urdu' ? 'Aapke Qareeb Madad' : 'Support Near You'}
              </h3>
              <p className="text-xs text-[#5b6b55]">
                {lang === 'roman_urdu'
                  ? 'Counselors aur psychiatrists jinse baat ki ja sakti hai — jab aap tayyar hon'
                  : 'Counselors and psychiatrists you can reach — whenever you feel ready'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#4c6b43] hover:text-[#2f3e2a] hover:bg-[#dbe8d6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl bg-[#eef3ea]/70 border border-[#dbe8d6] text-xs text-[#3c4a37] leading-relaxed">
            <p>
              {lang === 'roman_urdu'
                ? 'Hamnafas aik companion hai, doctor ya therapist ki jagah nahi. Neeche diye gaye log aapki madad ke liye trained hain — inse baat karna bilkul theek hai, aur aap apni raftaar par faisla kar sakte hain.'
                : "Hamnafas is a companion, not a replacement for a doctor or therapist. The people below are trained to help — reaching out is completely okay, and you decide the pace."}
            </p>
          </div>

          {/* City selector */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#4c6b43] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {lang === 'roman_urdu' ? 'Apna shehar chunein (ikhtiyari)' : 'Choose your city (optional)'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city === selectedCity ? null : city)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    selectedCity === city
                      ? 'bg-[#4c6b43] text-white border-[#4c6b43]'
                      : 'bg-white text-[#4c6b43] border-[#cfe0c8] hover:border-[#8fa989]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* City-specific listings */}
          {selectedCity && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#4c6b43] flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                {selectedCity}
              </p>
              {isLoading ? (
                <p className="text-xs text-[#7a8a73]">
                  {lang === 'roman_urdu' ? 'Talash ki ja rahi hai…' : 'Looking this up…'}
                </p>
              ) : hasLocalListings ? (
                <div className="space-y-2">
                  {directory!.localProviders.map((p) => (
                    <ProviderCard key={p.id} provider={p} lang={lang} />
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#fdf1e4] border border-[#f0d9bb] text-xs text-[#8a5a2b]">
                  {lang === 'roman_urdu'
                    ? `${selectedCity} ke liye verified local listing abhi tayyar ho rahi hai. Is dauran, neeche diye gaye nationwide numbers par foran baat ki ja sakti hai.`
                    : `Verified local listings for ${selectedCity} are still being added. In the meantime, the nationwide numbers below can be reached right away.`}
                </div>
              )}
            </div>
          )}

          {/* Nationwide partners — always shown */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#4c6b43] flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              {lang === 'roman_urdu' ? 'Mulk bhar mein foran dastyab' : 'Reachable nationwide, right now'}
            </p>
            <div className="space-y-2">
              {(directory?.nationwide ?? []).map((p) => (
                <ProviderCard key={p.id} provider={p} lang={lang} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
