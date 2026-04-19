'use server';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getServerDb } from '@/lib/supabase-server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface PetContext {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string | null;
  age: number;
  weight: number;
  neutered: boolean;
  healthLogs: Array<{
    recorded_at: string;
    weight: number;
    notes: string | null;
  }>;
}

export interface HealthConsultationState {
  userId: string;
  petId: string;
  userMessage: string;
  symptom: string | null;
  severity: 'emergency' | 'concerning' | 'mild' | 'unknown' | null;
  petContext: PetContext | null;
  analysis: string | null;
  recommendations: string[];
  isEmergency: boolean;
  needsVetVisit: boolean;
  followUpScheduled: boolean;
  response: string;
  error: string | null;
}

const SeveritySchema = z.object({
  severity: z.enum(['emergency', 'concerning', 'mild', 'unknown']),
  reasoning: z.string(),
  needsVetVisit: z.boolean(),
});

const RecommendationSchema = z.object({
  recommendations: z.array(z.string()),
  summary: z.string(),
});

async function fetchPetContext(supabase: Awaited<ReturnType<typeof getServerDb>>, petId: string, userId: string): Promise<PetContext | null> {
  const { data: pet } = await supabase
    .from('pets')
    .select('id, name, species, breed, age, weight, neutered, health_logs(*)')
    .eq('id', petId)
    .eq('user_id', userId)
    .single();

  if (!pet) return null;

  const logs = (pet.health_logs ?? [])
    .sort((a: { recorded_at: string }, b: { recorded_at: string }) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
    .slice(-30)
    .map((l: { recorded_at: string; weight: number; notes: string | null }) => ({
      recorded_at: l.recorded_at,
      weight: l.weight,
      notes: l.notes,
    }));

  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    weight: pet.weight,
    neutered: pet.neutered,
    healthLogs: logs,
  };
}

async function understandSymptom(state: HealthConsultationState): Promise<Partial<HealthConsultationState>> {
  const prompt = `
당신은 반려동물 건강 상담 AI입니다. 사용자의 메시지에서 증상을 파악하고 심각도를 평가하세요.

사용자 메시지: "${state.userMessage}"

반려동물 정보:
- 이름: ${state.petContext?.name ?? '알 수 없음'}
- 종: ${state.petContext?.species === 'dog' ? '강아지' : '고양이'}
- 나이: ${state.petContext?.age ?? '알 수 없음'}세

다음 JSON 형식으로만 응답하세요:
{"severity": "emergency|concerning|mild|unknown", "reasoning": "판단 이유", "needsVetVisit": true|false}

emergency: 생명이 위험할 수 있는 증상 (숨쉬기 어려움, 심한 출혈, 의식 잃음 등)
concerning: 주의가 필요한 증상 (지속적 구토, 설사, 식욕부진 등)
mild: 가벼운 증상 (간헐적 기침, 가벼운 절름발이 등)
unknown: 증상이 불명확하거나 추가 정보 필요
`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: SeveritySchema,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      symptom: state.userMessage,
      severity: object.severity,
      needsVetVisit: object.needsVetVisit,
      isEmergency: object.severity === 'emergency',
    };
  } catch {
    return {
      symptom: state.userMessage,
      severity: 'unknown',
      needsVetVisit: false,
      isEmergency: false,
      error: '증상 분석 중 오류가 발생했습니다.',
    };
  }
}

async function analyzeWithContext(state: HealthConsultationState): Promise<Partial<HealthConsultationState>> {
  if (!state.petContext) {
    return { error: '반려동물 정보를 찾을 수 없습니다.' };
  }

  const pet = state.petContext;
  const logSummary = pet.healthLogs.length > 0
    ? pet.healthLogs.map(l => `${new Date(l.recorded_at).toLocaleDateString('ko-KR')}: ${l.weight}kg${l.notes ? ` - ${l.notes}` : ''}`).join(', ')
    : '기록 없음';

  const prompt = `
당신은 반려동물 건강 전문 AI 분석가입니다. 아래 정보를 바탕으로 분석을 제공하세요.

[반려동물 정보]
- 이름: ${pet.name}
- 종: ${pet.species === 'dog' ? '강아지' : '고양이'}
- 품종: ${pet.breed ?? '미입력'}
- 나이: ${pet.age}세
- 현재 체중: ${pet.weight}kg
- 중성화: ${pet.neutered ? '완료' : '미완료'}

[사용자가 보고한 증상]
${state.symptom}

[증상 심각도]
${state.severity}

[최근 건강 기록]
${logSummary}

JSON 형식으로 추천 사항을 제공하세요:
{"recommendations": ["조언1", "조언2", ...], "summary": "종합 분석 요약"}

${state.isEmergency ? '\n⚠️ 이 증상은 응급 상황으로 판단됩니다. 즉시 수의사 상담을 권장합니다.' : ''}
`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: RecommendationSchema,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      analysis: object.summary,
      recommendations: object.recommendations,
    };
  } catch {
    return {
      error: '분석 중 오류가 발생했습니다.',
    };
  }
}

async function generateResponse(state: HealthConsultationState): Promise<Partial<HealthConsultationState>> {
  const petName = state.petContext?.name ?? '반려동물';
  
  let response = '';

  if (state.isEmergency) {
    response = `🚨 **응급 상황이 감지되었습니다!**

${petName}님의 증상은 응급 상황을 나타낼 수 있습니다. 
**즉시 수의사 상담을 받으시기를 권장합니다.**

`;
  }

  if (state.severity === 'concerning') {
    response += `⚠️ **주의가 필요한 증상입니다.**

${petName}님의 증상을 분석한 결과, 추가 관찰이 필요할 수 있습니다.
`;
  }

  if (state.analysis) {
    response += `\n**분석 결과:**\n${state.analysis}\n`;
  }

  if (state.recommendations.length > 0) {
    response += `\n**추천 조언:**\n`;
    state.recommendations.forEach((rec, i) => {
      response += `${i + 1}. ${rec}\n`;
    });
  }

  if (state.needsVetVisit && !state.isEmergency) {
    response += `\n🏥 **수의사 방문을 권장합니다.**
증상이 지속되거나 악화되면 반드시 전문 수의사에게 상담을 받으세요.`;
  }

  response += `\n\n---\n*이 답변은 참고용이며, 응급 상황에서는 즉시 수의사 상담을 받으세요.*`;

  return { response };
}

export async function healthConsultationAgent(userId: string, petId: string, userMessage: string) {
  let state: HealthConsultationState = {
    userId,
    petId,
    userMessage,
    symptom: null,
    severity: null,
    petContext: null,
    analysis: null,
    recommendations: [],
    isEmergency: false,
    needsVetVisit: false,
    followUpScheduled: false,
    response: '',
    error: null,
  };

  const supabase = await getServerDb();

  state.petContext = await fetchPetContext(supabase, petId, userId);
  if (!state.petContext) {
    return {
      ...state,
      error: '반려동물 정보를 찾을 수 없습니다.',
    };
  }

  state = { ...state, ...(await understandSymptom(state)) };

  if (state.severity !== 'unknown') {
    state = { ...state, ...(await analyzeWithContext(state)) };
  }

  if (!state.error) {
    state = { ...state, ...(await generateResponse(state)) };
  }

  return state;
}
