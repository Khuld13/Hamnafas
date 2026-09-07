import { ScreeningQuestion, ScreeningOption, ScreeningResult, CrisisPartnerResource } from '../types';

export const SCREENING_OPTIONS: ScreeningOption[] = [
  {
    value: 0,
    labelEn: 'Not at all',
    labelRomanUrdu: 'Bilkul nahi',
    labelUrdu: 'بالکل نہیں',
  },
  {
    value: 1,
    labelEn: 'Several days',
    labelRomanUrdu: 'Kuch din',
    labelUrdu: 'کچھ دن',
  },
  {
    value: 2,
    labelEn: 'More than half the days',
    labelRomanUrdu: 'Aadhay se zyada din',
    labelUrdu: 'آدھے سے زیادہ دن',
  },
  {
    value: 3,
    labelEn: 'Nearly every day',
    labelRomanUrdu: 'Taqreeban har roz',
    labelUrdu: 'تقریباً ہر روز',
  },
];

// Validated PHQ-9 (Patient Health Questionnaire - Depression Screening)
export const PHQ9_QUESTIONS: ScreeningQuestion[] = [
  {
    id: 1,
    textEn: 'Little interest or pleasure in doing things?',
    textRomanUrdu: 'Kaam karne ya kisi cheez mein dilchaspi/khushi ka kam hona?',
    textUrdu: 'کاموں میں دلچسپی یا خوشی کا نہ ہونا؟',
  },
  {
    id: 2,
    textEn: 'Feeling down, depressed, or hopeless?',
    textRomanUrdu: 'Udaasi, mayoosi ya be-hisaabi mehsoos karna?',
    textUrdu: 'مایوسی، اداسی یا دل ڈوبا ہوا محسوس ہونا؟',
  },
  {
    id: 3,
    textEn: 'Trouble falling or staying asleep, or sleeping too much?',
    textRomanUrdu: 'Neend aane mein mushkil, bar bar ankh khulna ya bohat zyada sona?',
    textUrdu: 'نیند کا نہ آنا، جلدی آنکھ کھلنا یا ضرورت سے زیادہ سونا؟',
  },
  {
    id: 4,
    textEn: 'Feeling tired or having little energy?',
    textRomanUrdu: 'Thakawat mehsoos hona ya taaqat/energy ki shadeed kami?',
    textUrdu: 'تھکاوٹ یا جسم میں توانائی کی کمی محسوس ہونا؟',
  },
  {
    id: 5,
    textEn: 'Poor appetite or overeating?',
    textRomanUrdu: 'Bhook na lagna ya be-waqt bohat zyada khana khana?',
    textUrdu: 'بھوک کا ختم ہو جانا یا ضرورت سے زیادہ کھانا؟',
  },
  {
    id: 6,
    textEn: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
    textRomanUrdu: 'Apne baare mein bura mehsoos karna, khud ko nakaam samjhna ya ghar walon ko mayoos karna?',
    textUrdu: 'اپنے آپ کو ناکام یا خاندان کی امیدوں پر پورا نہ اترنے والا سمجھنا؟',
  },
  {
    id: 7,
    textEn: 'Trouble concentrating on things, such as reading or watching television?',
    textRomanUrdu: 'Kisi kaam par tawajjoh (focus) dene mein mushkil hona (maslan parhai ya baat cheet)?',
    textUrdu: 'توجہ مرکوز کرنے میں دشواری ہونا (جیسے اخبار پڑھنا یا گفتگو سننا)؟',
  },
  {
    id: 8,
    textEn: 'Moving or speaking so slowly that other people could have noticed? Or being so fidgety or restless?',
    textRomanUrdu: 'Bohat dheere chalna ya bolna, ya phir be-chaini se idhar udhar harkat karna?',
    textUrdu: 'بہت سست ہو جانا کہ دوسرے محسوس کریں، یا بے حد بے چین رہنا؟',
  },
  {
    id: 9,
    textEn: 'Thoughts that you would be better off dead, or of hurting yourself in some way?',
    textRomanUrdu: 'Aise khayalaat ke marna behtar hai ya khud ko nuqsan pohanchana?',
    textUrdu: 'ایسے خیالات کہ مر جانا بہتر ہے یا خود کو نقصان پہنچانا؟',
  },
];

// Validated GAD-7 (Generalized Anxiety Disorder Screening)
export const GAD7_QUESTIONS: ScreeningQuestion[] = [
  {
    id: 1,
    textEn: 'Feeling nervous, anxious, or on edge?',
    textRomanUrdu: 'Bechaini, ghabrahat ya khauf mehsoos hona?',
    textUrdu: 'گھبراہٹ، بے چینی یا ہر وقت الجھن میں رہنا؟',
  },
  {
    id: 2,
    textEn: 'Not being able to stop or control worrying?',
    textRomanUrdu: 'Fikr aur pareshani ke khayalaat ko roknay par qaboo na hona?',
    textUrdu: 'فکر اور پریشانی کو روکنے یا قابو پانے میں ناکامی؟',
  },
  {
    id: 3,
    textEn: 'Worrying too much about different things?',
    textRomanUrdu: 'Mukhtalif baaton ke baare mein hadd se zyada sochna?',
    textUrdu: 'مختلف باتوں کے بارے میں حد سے زیادہ پریشان ہونا؟',
  },
  {
    id: 4,
    textEn: 'Trouble relaxing?',
    textRomanUrdu: 'Pur-sukoon (relax) hone mein mushkil hona?',
    textUrdu: 'پرسکون ہونے یا ریلیکس کرنے میں دشواری؟',
  },
  {
    id: 5,
    textEn: "Being so restless that it's hard to sit still?",
    textRomanUrdu: 'Itni be-chaini ke aik jagah sukoon se baithna mushkil ho?',
    textUrdu: 'اتنی بے چینی کہ ایک جگہ ٹک کر بیٹھنا مشکل ہو؟',
  },
  {
    id: 6,
    textEn: 'Becoming easily annoyed or irritable?',
    textRomanUrdu: 'Choti choti baaton par chirchira-pan ya ghussa aana?',
    textUrdu: 'جلدی چڑچڑا ہو جانا یا غصہ آ جانا؟',
  },
  {
    id: 7,
    textEn: 'Feeling afraid as if something awful might happen?',
    textRomanUrdu: 'Yeh khauf rehna ke kuch bohat bura honay wala hai?',
    textUrdu: 'یہ خوف طاری رہنا کہ کچھ برا ہونے والا ہے؟',
  },
];

// Verified Pakistan Mental Health Partner Hotlines & Crisis Networks
export const PAKISTAN_CRISIS_PARTNERS: CrisisPartnerResource[] = [
  {
    id: 'umang-pakistan',
    name: 'Umang Pakistan Mental Health Helpline',
    serviceEn: '24/7 Clinical Mental Health & Suicide Prevention Support',
    serviceRomanUrdu: '24/7 Muft aur Mehfooz Nafsiyaati Counseling Helpline',
    phone: '0311-7786264',
    availability: '24 Hours / 7 Days',
    website: 'https://umang.com.pk',
    tollFree: true,
    emergencyType: 'psychiatric',
  },
  {
    id: 'rozan-counseling',
    name: 'Rozan Emotional Health Counseling',
    serviceEn: 'Free Confidential Psychological Support & Gender-Sensitive Care',
    serviceRomanUrdu: 'Muft aur Posheeda Nafsiyaati Mashwara aur Madad',
    phone: '0800-22444',
    availability: 'Mon - Sat (9:00 AM - 6:00 PM)',
    tollFree: true,
    emergencyType: 'general_helpline',
  },
  {
    id: 'taskeen-initiative',
    name: 'Taskeen Health Initiative',
    serviceEn: 'Community Mental Wellbeing & Crisis Intervention',
    serviceRomanUrdu: 'Zehni Sehat ki Rehnumai aur Muft Counseling',
    phone: '0316-8275336',
    availability: 'Mon - Sat (11:00 AM - 7:00 PM)',
    website: 'https://taskeen.org',
    emergencyType: 'general_helpline',
  },
  {
    id: 'talk2me-pk',
    name: 'Talk2Me Pakistan Helpline',
    serviceEn: 'Youth & Adult Compassionate Crisis Listening Service',
    serviceRomanUrdu: 'Pur-Khuloos aur Humdardi se Sunne ki Helpline',
    phone: '0333-3111005',
    availability: 'Daily (2:00 PM - 12:00 AM)',
    emergencyType: 'general_helpline',
  },
  {
    id: 'emergency-rescue',
    name: 'Emergency Medical & Police Rescue',
    serviceEn: 'Immediate Life-Threatening Crisis Response',
    serviceRomanUrdu: 'Fauri Emergency Madad (Ambulance / Rescue)',
    phone: '1122',
    availability: '24/7 Toll-Free Emergency',
    emergencyType: 'immediate_rescue',
  },
];

// Clinical Evaluation Functions
export function calculatePHQ9Result(answers: Record<number, number>): ScreeningResult {
  let score = 0;
  let hasSelfHarmThoughts = false;

  for (let i = 1; i <= 9; i++) {
    const val = answers[i] || 0;
    score += val;
    if (i === 9 && val > 0) {
      hasSelfHarmThoughts = true;
    }
  }

  let severityLevel: ScreeningResult['severityLevel'] = 'Minimal';
  let severityLevelRomanUrdu = 'Mamooli (Minimal)';
  let severityLevelUrdu = 'معمولی علامات';
  let summaryEn = '';
  let summaryRomanUrdu = '';
  let summaryUrdu = '';
  const recommendations: string[] = [];
  const recommendationsRomanUrdu: string[] = [];

  if (score <= 4) {
    severityLevel = 'Minimal';
    severityLevelRomanUrdu = 'Mamooli (0-4)';
    severityLevelUrdu = 'معمولی (0-4)';
    summaryEn = 'Your score indicates minimal to no depressive symptoms. Your emotional baseline is steady.';
    summaryRomanUrdu = 'Aapka score mamooli hai. Aapki zehni halat mutawaazan aur theek maloom hoti hai.';
    summaryUrdu = 'آپ کا اسکور ظاہر کرتا ہے کہ ڈپریشن کی علامات نہ ہونے کے برابر ہیں۔';
    recommendations.push('Maintain regular sleep, nutrition, and daily physical movement.');
    recommendations.push('Practice daily micro-gratitude and gentle breathing pauses.');
    recommendationsRomanUrdu.push('Rozana waqt par sona, achi khorak aur halki phulki walk jari rakhein.');
    recommendationsRomanUrdu.push('Shukr-guzari aur deep breathing ke chotay pauses lein.');
  } else if (score <= 9) {
    severityLevel = 'Mild';
    severityLevelRomanUrdu = 'Halka (5-9)';
    severityLevelUrdu = 'ہلکا (5-9)';
    summaryEn = 'Your score indicates mild depressive symptoms. You may be experiencing temporary fatigue, low mood, or sleep changes.';
    summaryRomanUrdu = 'Aapka score halki udaasi aur thakawat ki nishandahi karta hai. Yeh amoman thakawat ya stress ki wajah se ho sakta hai.';
    summaryUrdu = 'آپ کا اسکور ہلکے ڈپریشن کی نشاندہی کرتا ہے۔';
    recommendations.push('Engage in Behavioral Activation: pick one small pleasant activity daily.');
    recommendations.push('Talk openly with Hamnafas or a trusted friend about feelings before they bottle up.');
    recommendations.push('Utilize guided 4-7-8 and Box Breathing exercises in the self-help section.');
    recommendationsRomanUrdu.push('Rozana koi aik choti pasandeeda sargami karein (Behavioral Activation).');
    recommendationsRomanUrdu.push('Hamnafas ya kisi dost se dil ki baat karein taake bojh kam ho.');
    recommendationsRomanUrdu.push('Self-help section se Box Breathing aur Grounding karein.');
  } else if (score <= 14) {
    severityLevel = 'Moderate';
    severityLevelRomanUrdu = 'Darmiyana (10-14)';
    severityLevelUrdu = 'درمیانہ (10-14)';
    summaryEn = 'Your score indicates moderate depressive symptoms. Low energy, difficulty focusing, or feelings of hopelessness may be impacting your daily routine.';
    summaryRomanUrdu = 'Aapka score darmiyanay darjay ki udaasi dikhata hai. Tawajjoh, neend ya dilchaspi mein kami mehsoos ho sakti hai.';
    summaryUrdu = 'آپ کا اسکور درمیانے درجے کے ڈپریشن کی نشاندہی کرتا ہے۔';
    recommendations.push('Consider speaking with a licensed mental health professional or calling partner helplines (e.g. Umang: 0311-7786264).');
    recommendations.push('Break demanding tasks into micro-steps to prevent feeling overwhelmed.');
    recommendations.push('Use structured grounding routines to gently manage difficult emotional waves.');
    recommendationsRomanUrdu.push('Kisi professional counselor ya Umang Helpline (0311-7786264) se rabta karne par ghour karein.');
    recommendationsRomanUrdu.push('Barray kaamon ko chotay hisson mein baant lein taake zehni dabao kam ho.');
    recommendationsRomanUrdu.push('Grounding exercises aur deep breathing se zehan ko sakoon dein.');
  } else if (score <= 19) {
    severityLevel = 'Moderately Severe';
    severityLevelRomanUrdu = 'Shadeed ke qareeb (15-19)';
    severityLevelUrdu = 'شدید کے قریب (15-19)';
    summaryEn = 'Your score indicates moderately severe symptoms. Daily activities, relationships, and emotional wellbeing are experiencing significant strain.';
    summaryRomanUrdu = 'Aapka score shadeed udaasi ki taraf ishara kar raha hai. Rozmarra ke kaamon aur jazbaat par gehra asar par raha hai.';
    summaryUrdu = 'آپ کا اسکور شدید نوعیت کی طرف اشارہ کرتا ہے۔';
    recommendations.push('We strongly recommend reaching out to a qualified counselor or psychiatrist for tailored therapeutic support.');
    recommendations.push('Call Umang Pakistan (0311-7786264) or Rozan (0800-22444) for immediate compassionate guidance.');
    recommendations.push('Do not carry this weight alone — stay connected with someone supportive.');
    recommendationsRomanUrdu.push('Hum mashwara dete hain ke foran kisi counselor ya Umang Helpline (0311-7786264) se rabta karein.');
    recommendationsRomanUrdu.push('Rozan Helpline (0800-22444) par muft mashwara lein.');
    recommendationsRomanUrdu.push('Yeh bojh akele mat uthayein, kisi humdard se rabte mein rahein.');
  } else {
    severityLevel = 'Severe';
    severityLevelRomanUrdu = 'Shadeed (20-27)';
    severityLevelUrdu = 'شدید (20-27)';
    summaryEn = 'Your score indicates severe depressive symptoms. Clinical evaluation and professional healthcare support are essential.';
    summaryRomanUrdu = 'Aapka score shadeed depression zahir kar raha hai. Fauri tor par kisi doctor ya counselor se madad lena zaroori hai.';
    summaryUrdu = 'آپ کا اسکور شدید علامات کی نشاندہی کرتا ہے۔ فوری پیشہ ورانہ مدد حاصل کریں۔';
    recommendations.push('Please connect immediately with a healthcare provider or crisis helpline.');
    recommendations.push('Umang Pakistan Helpline: 0311-7786264 (24/7 confidential clinical counseling).');
    recommendations.push('Emergency Ambulance/Rescue: 1122.');
    recommendationsRomanUrdu.push('Baraye meharbani foran kisi zehni sehat ke mahir ya helpline se rabta karein.');
    recommendationsRomanUrdu.push('Umang Pakistan Helpline: 0311-7786264 (24/7 muft aur mehfooz).');
    recommendationsRomanUrdu.push('Fauri emergency ke liye 1122 par call karein.');
  }

  return {
    id: `phq9-${Date.now()}`,
    type: 'phq9',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    score,
    maxScore: 27,
    severityLevel,
    severityLevelRomanUrdu,
    severityLevelUrdu,
    summaryEn,
    summaryRomanUrdu,
    summaryUrdu,
    recommendations,
    recommendationsRomanUrdu,
    crisisTriggered: hasSelfHarmThoughts || score >= 20,
  };
}

export function calculateGAD7Result(answers: Record<number, number>): ScreeningResult {
  let score = 0;
  for (let i = 1; i <= 7; i++) {
    score += answers[i] || 0;
  }

  let severityLevel: ScreeningResult['severityLevel'] = 'Minimal';
  let severityLevelRomanUrdu = 'Mamooli (Minimal)';
  let severityLevelUrdu = 'معمولی بے چینی';
  let summaryEn = '';
  let summaryRomanUrdu = '';
  let summaryUrdu = '';
  const recommendations: string[] = [];
  const recommendationsRomanUrdu: string[] = [];

  if (score <= 4) {
    severityLevel = 'Minimal';
    severityLevelRomanUrdu = 'Mamooli (0-4)';
    severityLevelUrdu = 'معمولی (0-4)';
    summaryEn = 'Your score indicates minimal anxiety. Your nervous system is in a balanced, adaptable state.';
    summaryRomanUrdu = 'Aapka score mamooli bechaini dikhata hai. Aapka zehan pur-sukoon halat mein hai.';
    summaryUrdu = 'آپ کے اسکور کے مطابق بے چینی اور گھبراہٹ نہ ہونے کے برابر ہے۔';
    recommendations.push('Continue mindful daily habits, adequate hydration, and relaxing routines.');
    recommendationsRomanUrdu.push('Rozana ke pur-sukoon routine aur paani peene ka khayal rakhein.');
  } else if (score <= 9) {
    severityLevel = 'Mild';
    severityLevelRomanUrdu = 'Halka (5-9)';
    severityLevelUrdu = 'ہلکی گھبراہٹ (5-9)';
    summaryEn = 'Your score indicates mild anxiety. You may be experiencing periods of worry or physical tension.';
    summaryRomanUrdu = 'Aapka score halki ghabrahat aur fikr ki nishandahi karta hai.';
    summaryUrdu = 'آپ کا اسکور ہلکی بے چینی کی نشاندہی کرتا ہے۔';
    recommendations.push('Practice daily Box Breathing (4-4-4-4) to reduce cortisol and calm adrenaline spikes.');
    recommendations.push('Try "Worry Postponement": write down racing worries and schedule 10 minutes to review them later.');
    recommendationsRomanUrdu.push('Box Breathing (4-4-4-4) karein taake ghabrahat kam ho.');
    recommendationsRomanUrdu.push('Apni pareshaniyon ko likh lein taake dimagh halka mehsoos kare.');
  } else if (score <= 14) {
    severityLevel = 'Moderate';
    severityLevelRomanUrdu = 'Darmiyana (10-14)';
    severityLevelUrdu = 'درمیانی بے چینی (10-14)';
    summaryEn = 'Your score indicates moderate anxiety. Excessive worry, muscle tension, or restlessness may be frequently disturbing your peace.';
    summaryRomanUrdu = 'Aapka score darmiyanay darjay ki bechaini dikhata hai. Jism mein khichao ya fikr zyada reh sakti hai.';
    summaryUrdu = 'آپ کا اسکور درمیانے درجے کی بے چینی کی نشاندہی کرتا ہے۔';
    recommendations.push('Consider structured Cognitive Behavioral Therapy (CBT) techniques or speaking to a counselor.');
    recommendations.push('Practice the 5-4-3-2-1 Sensory Grounding exercise whenever you feel panic building.');
    recommendations.push('Call Umang Helpline (0311-7786264) for compassionate, confidential counseling.');
    recommendationsRomanUrdu.push('Counselor se rabta karne par ghour karein ya Umang Helpline (0311-7786264) par baat karein.');
    recommendationsRomanUrdu.push('Ghabrahat ke waqt 5-4-3-2-1 Sensory Grounding ka istemaal karein.');
  } else {
    severityLevel = 'Severe';
    severityLevelRomanUrdu = 'Shadeed (15-21)';
    severityLevelUrdu = 'شدید بے چینی (15-21)';
    summaryEn = 'Your score indicates severe anxiety symptoms. Symptoms may feel overwhelming or trigger panic sensations.';
    summaryRomanUrdu = 'Aapka score shadeed anxiety/ghabrahat zahir kar raha hai. Fauri mahir-e-nafsiyaat se madad lena zaroori hai.';
    summaryUrdu = 'آپ کا اسکور شدید بے چینی ظاہر کرتا ہے۔ ماہر نفسیات سے فوری رجوع کریں۔';
    recommendations.push('Please seek professional evaluation from a psychologist or psychiatrist.');
    recommendations.push('Contact Umang Pakistan (0311-7786264) or Rozan (0800-22444) for immediate support.');
    recommendations.push('Remember: anxiety symptoms are uncomfortable, but you are physically safe. One breath at a time.');
    recommendationsRomanUrdu.push('Baraye meharbani kisi psychiatrist ya Umang Helpline (0311-7786264) se rabta karein.');
    recommendationsRomanUrdu.push('Rozan Helpline (0800-22444) par baat karein.');
    recommendationsRomanUrdu.push('Yaad rakhein: ghabrahat guzar jayegi, aap bilkul mehfooz hain.');
  }

  return {
    id: `gad7-${Date.now()}`,
    type: 'gad7',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    score,
    maxScore: 21,
    severityLevel,
    severityLevelRomanUrdu,
    severityLevelUrdu,
    summaryEn,
    summaryRomanUrdu,
    summaryUrdu,
    recommendations,
    recommendationsRomanUrdu,
    crisisTriggered: score >= 15,
  };
}
