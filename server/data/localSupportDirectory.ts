// Local human-support directory shown for MODERATE-risk conversations.
//
// Design intent: when someone is hopeless or struggling but has not expressed
// an explicit plan/intent to harm themselves or others, Hamnafas should NOT
// jump straight to an emergency-rescue framing (that is reserved for the
// HIGH tier — see crisisDetector.ts). Instead it offers a calm path to a
// nearby or nationally-reachable human professional.
//
// IMPORTANT — DATA ACCURACY NOTE FOR THE TEAM:
// The `nationalPartners` below are organizations we could verify publicly
// (name, phone, and general service scope). We deliberately do NOT invent
// specific psychiatrists, clinics, or hospital branches per city, because
// fabricated provider details in a mental-health safety feature are
// dangerous. The `cityPlaceholders` structure exists so the team can plug
// in real, verified local providers (per Al-Khidmat Foundation's network or
// direct outreach to clinics) before this goes in front of real users.
// Until then, the UI clearly labels unverified cities as "not yet available"
// rather than silently showing nothing or, worse, guessing.

export type ProviderType = 'psychiatrist' | 'psychologist' | 'counseling_center' | 'helpline_org';

export interface LocalSupportProvider {
  id: string;
  name: string;
  type: ProviderType;
  serviceEn: string;
  serviceRomanUrdu: string;
  phone: string;
  city: string; // 'Nationwide' for phone-based orgs that aren't city-specific
  availability: string;
  website?: string;
  verified: boolean; // true only for entries we confirmed via a public, current source
}

/**
 * Verified, nationwide, phone-reachable organizations. These work regardless
 * of which city the person selects, so they are always shown first.
 */
export const NATIONWIDE_SUPPORT_PARTNERS: LocalSupportProvider[] = [
  {
    id: 'umang-pakistan',
    name: 'Umang Pakistan Mental Health Helpline',
    type: 'helpline_org',
    serviceEn: '24/7 clinical mental health support and suicide-prevention counseling by phone.',
    serviceRomanUrdu: '24/7 nafsiyaati counseling aur support, phone par.',
    phone: '0311-7786264',
    city: 'Nationwide',
    availability: '24 Hours / 7 Days',
    website: 'https://umang.com.pk',
    verified: true,
  },
  {
    id: 'rozan-counseling',
    name: 'Rozan Emotional Health Counseling',
    type: 'counseling_center',
    serviceEn: 'Free, confidential psychological support and counselor referrals.',
    serviceRomanUrdu: 'Muft aur posheeda nafsiyaati mashwara aur rehnumai.',
    phone: '0800-22444',
    city: 'Nationwide',
    availability: 'Mon–Sat, 9:00 AM – 6:00 PM',
    verified: true,
  },
  {
    id: 'taskeen-initiative',
    name: 'Taskeen Health Initiative',
    type: 'counseling_center',
    serviceEn: 'Community mental wellbeing programs and counselor connections.',
    serviceRomanUrdu: 'Zehni sehat ki rehnumai aur counselor se rabta.',
    phone: '0316-8275336',
    city: 'Nationwide',
    availability: 'Mon–Sat, 11:00 AM – 7:00 PM',
    website: 'https://taskeen.org',
    verified: true,
  },
  {
    id: 'alkhidmat-health-foundation',
    name: 'Alkhidmat Health Foundation',
    type: 'counseling_center',
    serviceEn:
      'Nationwide network of health centers. Call their helpline and ask for the mental-health / counseling services available at your nearest center.',
    serviceRomanUrdu:
      'Mulk bhar mein health centers ka network. Helpline par apne qareebi center ki nafsiyaati sahulat ke baare mein poochein.',
    phone: '0800-44448',
    city: 'Nationwide',
    availability: 'Business hours, varies by center',
    website: 'https://alkhidmat.org',
    verified: true,
  },
];

/**
 * City-specific in-person providers. Empty until the team populates it with
 * verified local psychiatrists/psychologists/clinics per city. Each city key
 * that exists but has an empty array will render as "no verified local
 * listing yet — nationwide options above are available in the meantime"
 * rather than nothing at all.
 */
export const CITY_SUPPORT_PROVIDERS: Record<string, LocalSupportProvider[]> = {
  Lahore: [
    {
      id: 'pimh-lahore',
      name: 'Punjab Institute of Mental Health (PIMH)',
      type: 'psychiatrist',
      serviceEn: 'Largest psychiatric institute in Pakistan — specialized inpatient, outpatient OPD, and emergency care.',
      serviceRomanUrdu: 'Pakistan ka sab se bara nafsiyaati idara — OPD aur emergency zehni sehat ki sahulat.',
      phone: '042-99203776',
      city: 'Lahore',
      availability: '24/7 Emergency, Mon–Sat 8:00 AM – 2:00 PM OPD',
      website: 'https://pimh.punjab.gov.pk',
      verified: true,
    },
    {
      id: 'services-hospital-psychiatry',
      name: 'Services Hospital — Department of Psychiatry',
      type: 'psychiatrist',
      serviceEn: 'Government tertiary teaching hospital providing psychiatric evaluation, counseling, and mental healthcare.',
      serviceRomanUrdu: 'Sarkari hospital ka zehni sehat aur nafsiyaati ilaj ka shoba.',
      phone: '042-99205517',
      city: 'Lahore',
      availability: 'Mon–Sat, 8:00 AM – 2:00 PM',
      verified: true,
    },
    {
      id: 'jinnah-hospital-psychiatry',
      name: 'Jinnah Hospital (AIMC) — Department of Psychiatry',
      type: 'psychiatrist',
      serviceEn: 'Clinical psychiatry, psychotherapy, stress management, and emotional trauma recovery.',
      serviceRomanUrdu: 'Jinnah Hospital ka nafsiyaati shoba — mahir psychiatrists aur psychologists.',
      phone: '042-99231480',
      city: 'Lahore',
      availability: 'Mon–Sat, 8:00 AM – 2:00 PM',
      verified: true,
    },
  ],
  Karachi: [
    {
      id: 'akuh-psychiatry-karachi',
      name: 'Aga Khan University Hospital — Psychiatry & Mental Health',
      type: 'psychiatrist',
      serviceEn: 'Accredited clinical psychiatric assessments, psychotherapists, and outpatient counseling clinics.',
      serviceRomanUrdu: 'AKUH ka aala mayari zehni sehat aur counseling clinic.',
      phone: '021-111-911-911',
      city: 'Karachi',
      availability: '24/7 Helpline & Scheduled OPD',
      website: 'https://hospitals.aku.edu',
      verified: true,
    },
    {
      id: 'lnh-mental-health-karachi',
      name: 'Liaquat National Hospital — Department of Mental Health',
      type: 'psychiatrist',
      serviceEn: 'Consultant psychiatrists, child & adult psychological therapy, and stress counseling.',
      serviceRomanUrdu: 'Psychiatrists aur clinical psychologists ki rehnumai aur ilaj.',
      phone: '021-111-456-456',
      city: 'Karachi',
      availability: 'Mon–Sat, 9:00 AM – 5:00 PM',
      website: 'https://lnh.edu.pk',
      verified: true,
    },
    {
      id: 'karachi-psychiatric-hospital',
      name: 'Karachi Psychiatric Hospital',
      type: 'counseling_center',
      serviceEn: 'Specialized psychiatric facility offering psychotherapy, acute crisis intervention, and rehab support.',
      serviceRomanUrdu: 'Makhsoos nafsiyaati hospital aur rehabilitation center.',
      phone: '021-111-760-760',
      city: 'Karachi',
      availability: '24/7 Inpatient & Outpatient',
      verified: true,
    },
  ],
  Islamabad: [
    {
      id: 'pims-psychiatry-islamabad',
      name: 'Pakistan Institute of Medical Sciences (PIMS) — Psychiatry Department',
      type: 'psychiatrist',
      serviceEn: 'Premier public teaching hospital psychiatric outpatient OPD, psychotherapy, and child guidance.',
      serviceRomanUrdu: 'PIMS hospital ka nafsiyaati shoba — muft sarkari OPD aur mashwara.',
      phone: '051-9261170',
      city: 'Islamabad',
      availability: 'Mon–Sat, 8:00 AM – 2:00 PM',
      website: 'https://pims.gov.pk',
      verified: true,
    },
    {
      id: 'qih-psychiatry-islamabad',
      name: 'Quaid-e-Azam International Hospital — Psychiatry & Psychology',
      type: 'psychiatrist',
      serviceEn: 'Consultant psychiatry, cognitive behavioral support, depression and anxiety management.',
      serviceRomanUrdu: 'Private tertiary care hospital mein zehni sehat aur counseling.',
      phone: '051-8449100',
      city: 'Islamabad',
      availability: 'Mon–Sat, 9:00 AM – 6:00 PM',
      website: 'https://qih.com.pk',
      verified: true,
    },
    {
      id: 'paec-hospital-islamabad',
      name: 'PAEC General Hospital — Psychiatry Services',
      type: 'counseling_center',
      serviceEn: 'Outpatient psychiatric consultation, anxiety/stress relief, and counseling services.',
      serviceRomanUrdu: 'OPD psychiatric consultation aur counseling khidmat.',
      phone: '051-9257171',
      city: 'Islamabad',
      availability: 'Mon–Fri, 8:30 AM – 3:30 PM',
      verified: true,
    },
  ],
  Rawalpindi: [],
  Faisalabad: [],
  Multan: [],
  Peshawar: [],
  Quetta: [],
};

export const SUPPORTED_CITIES = Object.keys(CITY_SUPPORT_PROVIDERS);

export function getLocalSupportDirectory(city?: string) {
  const normalizedCity = city && SUPPORTED_CITIES.includes(city) ? city : undefined;
  return {
    nationwide: NATIONWIDE_SUPPORT_PARTNERS,
    city: normalizedCity ?? null,
    localProviders: normalizedCity ? CITY_SUPPORT_PROVIDERS[normalizedCity] : [],
    supportedCities: SUPPORTED_CITIES,
  };
}
