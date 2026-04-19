export type Category = 'digestive' | 'skin' | 'respiratory' | 'eyes_ears' | 'behavior';
export type Animal = 'dog' | 'cat' | 'both';
export type Urgency = 'critical' | 'moderate' | 'mild';

export interface Symptom {
  id: string;
  name: string;
  category: Category;
  animal: Animal;
}

export interface Disease {
  id: string;
  name: string;
  symptoms: string[];
  urgency: Urgency;
  description: string;
  recommendation: string;
}

export const categories: { id: Category; name: string; icon: string }[] = [
  { id: 'digestive', name: '소화기', icon: '🍽️' },
  { id: 'skin', name: '피부', icon: '🩹' },
  { id: 'respiratory', name: '호흡기', icon: '💨' },
  { id: 'eyes_ears', name: '눈/귀', icon: '👁️' },
  { id: 'behavior', name: '행동변화', icon: '🧠' },
];

export const symptoms: Symptom[] = [
  { id: 'vomiting', name: '구토', category: 'digestive', animal: 'both' },
  { id: 'diarrhea', name: '설사', category: 'digestive', animal: 'both' },
  { id: 'loss_of_appetite', name: '식욕부진', category: 'digestive', animal: 'both' },
  { id: 'bloating', name: '복부팽만', category: 'digestive', animal: 'both' },
  { id: 'bloody_stool', name: '혈변', category: 'digestive', animal: 'both' },

  { id: 'itching', name: '가려움', category: 'skin', animal: 'both' },
  { id: 'hair_loss', name: '탈모', category: 'skin', animal: 'both' },
  { id: 'skin_redness', name: '피부 발적', category: 'skin', animal: 'both' },
  { id: 'lumps', name: '종괴', category: 'skin', animal: 'both' },
  { id: 'licking', name: '핥기', category: 'skin', animal: 'both' },

  { id: 'coughing', name: '기침', category: 'respiratory', animal: 'both' },
  { id: 'sneezing', name: '재채기', category: 'respiratory', animal: 'both' },
  { id: 'difficulty_breathing', name: '호흡 곤란', category: 'respiratory', animal: 'both' },
  { id: 'nasal_discharge', name: '콧물', category: 'respiratory', animal: 'both' },
  { id: 'wheezing', name: '천명음', category: 'respiratory', animal: 'both' },

  { id: 'eye_discharge', name: '눈 분비물', category: 'eyes_ears', animal: 'both' },
  { id: 'eye_redness', name: '눈 충혈', category: 'eyes_ears', animal: 'both' },
  { id: 'ear_odor', name: '귀 냄새', category: 'eyes_ears', animal: 'both' },
  { id: 'ear_discharge', name: '귀 분비물', category: 'eyes_ears', animal: 'both' },
  { id: 'eye_squinting', name: '눈을 짜름', category: 'eyes_ears', animal: 'both' },

  { id: 'lethargy', name: '무기력', category: 'behavior', animal: 'both' },
  { id: 'aggression', name: '공격성', category: 'behavior', animal: 'both' },
  { id: 'hiding', name: '숨기', category: 'behavior', animal: 'both' },
  { id: 'anxiety', name: '불안', category: 'behavior', animal: 'both' },
  { id: 'abnormal_behavior', name: '이상 행동', category: 'behavior', animal: 'both' },
];

export const diseases: Disease[] = [
  {
    id: 'gastritis',
    name: '위염',
    symptoms: ['vomiting', 'loss_of_appetite', 'bloating'],
    urgency: 'moderate',
    description: '위 점막의 염증으로 구토와 식욕부진을 일으킵니다.',
    recommendation: '12시간 이상 금식 후 점진적 식이 회복. 증상이 지속되면 수의사 상담.',
  },
  {
    id: 'intestinal_parasites',
    name: '장내 기생충',
    symptoms: ['diarrhea', 'bloody_stool', 'loss_of_appetite', 'weight_loss'],
    urgency: 'moderate',
    description: '기생충 감염으로 설사와 혈변을 유발합니다.',
    recommendation: '분변 검사 후 항충제 처방. 환경 청소 필수.',
  },
  {
    id: 'food_allergy',
    name: '음식 알레르기',
    symptoms: ['itching', 'skin_redness', 'hair_loss', 'licking'],
    urgency: 'moderate',
    description: '특정 음식 성분에 대한 알레르기 반응입니다.',
    recommendation: ' Elimination diet로 원인 식품 확인. 수의사 상담 권장.',
  },
  {
    id: 'atopic_dermatitis',
    name: '아토피성 피부염',
    symptoms: ['itching', 'skin_redness', 'licking', 'hair_loss'],
    urgency: 'moderate',
    description: '환경 알레르겐에 인한 만성 피부 염증입니다.',
    recommendation: '알레르기 검사 및 면역억제제 치료. 정기적 목욕.',
  },
  {
    id: 'kennel_cough',
    name: '케넬코프',
    symptoms: ['coughing', 'sneezing', 'nasal_discharge'],
    urgency: 'moderate',
    description: '전염성 호흡기 질환으로 기침과 재채기를 유발합니다.',
    recommendation: '격리 치료. 증상이 심하면 항생제 투여. 예방접종 확인.',
  },
  {
    id: 'feline_upper_respiratory',
    name: '고양이 상피 호흡기 감염',
    symptoms: ['sneezing', 'nasal_discharge', 'eye_discharge', 'lethargy'],
    urgency: 'moderate',
    description: '바이러스 또는 세균 감염으로 인한 상호 호흡기 질환입니다.',
    recommendation: '보호성 치료. 식욕 유지 확인. 심한 경우 항생제.',
  },
  {
    id: 'otitis_externa',
    name: '외이도염',
    symptoms: ['ear_odor', 'ear_discharge', 'head_shaking', 'scratching_ears'],
    urgency: 'moderate',
    description: '외이도의 염증으로 귀 분비물과 냄새를 유발합니다.',
    recommendation: '귀 청소 및 항생제/항진균제 치료. 정기적 귀 관리.',
  },
  {
    id: 'conjunctivitis',
    name: '결막염',
    symptoms: ['eye_discharge', 'eye_redness', 'eye_squinting', 'swollen_eyes'],
    urgency: 'moderate',
    description: '눈 결막의 염증으로 분비물과 충혈을 유발합니다.',
    recommendation: '항생제 안약 치료. 손으로 눈을 만지지 않도록 주의.',
  },
  {
    id: 'pancreatitis',
    name: '췌장염',
    symptoms: ['vomiting', 'diarrhea', 'loss_of_appetite', 'lethargy', 'abdominal_pain'],
    urgency: 'critical',
    description: '췌장의 급성 또는 만성 염증입니다.',
    recommendation: '즉시 동물병원 방문. 금식 및 수액 치료 필요.',
  },
  {
    id: 'urinary_tract_infection',
    name: '목욕감염',
    symptoms: ['frequent_urination', 'bloody_urine', 'pain_urinating', 'lethargy'],
    urgency: 'critical',
    description: '요로 감염으로 배뇨 문제와 통증을 유발합니다.',
    recommendation: '즉시 동물병원 방문. 항생제 치료 필수.',
  },
  {
    id: 'heartworm',
    name: '심장사상충증',
    symptoms: ['coughing', 'difficulty_breathing', 'lethargy', 'weight_loss'],
    urgency: 'critical',
    description: '심장사에 감염되어 호흡기 증상과 심부전을 유발합니다.',
    recommendation: '즉시 동물병원 방문. 예방약으로 예방 가능.',
  },
  {
    id: 'anxiety_disorder',
    name: '불안장애',
    symptoms: ['anxiety', 'hiding', 'abnormal_behavior', 'lethargy'],
    urgency: 'mild',
    description: '스트레스나 불안으로 인한 행동 변화입니다.',
    recommendation: '환경 개선 및 행동 치료. 심각한 경우 약물 치료.',
  },
];

export function getSymptomsByCategory(category: Category): Symptom[] {
  return symptoms.filter((s) => s.category === category);
}

export function getSymptomsByAnimal(animal: Animal): Symptom[] {
  if (animal === 'both') return symptoms;
  return symptoms.filter((s) => s.animal === animal || s.animal === 'both');
}

export function getFrequentSymptoms(animal: Animal): Symptom[] {
  const dogFrequent = ['vomiting', 'diarrhea', 'itching', 'coughing', 'lethargy', 'loss_of_appetite'];
  const catFrequent = ['vomiting', 'lethargy', 'loss_of_appetite', 'eye_discharge', 'ear_odor', 'hiding'];
  const frequentIds = animal === 'cat' ? catFrequent : dogFrequent;
  return symptoms.filter((s) => frequentIds.includes(s.id) && (s.animal === animal || s.animal === 'both'));
}

export function diagnose(selectedSymptomIds: string[]): { disease: Disease; matchCount: number; probability: number }[] {
  const results: { disease: Disease; matchCount: number; probability: number }[] = [];

  for (const disease of diseases) {
    const matchCount = disease.symptoms.filter((s) => selectedSymptomIds.includes(s)).length;
    if (matchCount > 0) {
      const probability = Math.min((matchCount / disease.symptoms.length) * 100, 95);
      results.push({ disease, matchCount, probability: Math.round(probability) });
    }
  }

  return results.sort((a, b) => b.probability - a.probability);
}
