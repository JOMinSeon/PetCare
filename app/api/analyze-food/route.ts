export const runtime = 'nodejs';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getServerDb } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rate-limit';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// 10 requests per minute per user
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

const ALLOWED_SPECIES = ['dog', 'cat'];

function validatePetInfo(raw: unknown): { species: string; age: number; weight: number } | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  if (!ALLOWED_SPECIES.includes(p.species as string)) return null;
  const age = Number(p.age);
  const weight = Number(p.weight);
  if (!Number.isFinite(age) || age < 0 || age > 30) return null;
  if (!Number.isFinite(weight) || weight <= 0 || weight > 200) return null;
  return { species: p.species as string, age, weight };
}

function buildPrompt(petInfo: { species: string; age: number; weight: number }) {
  const ageStage =
    petInfo.age < 1 ? '퍼피/키튼(0~1세)' :
    petInfo.age < 7 ? '성체(1~7세)' : '시니어(7세+)';

  return `당신은 수의학 영양 전문가입니다. 아래 반려동물 정보를 바탕으로 제공된 사료(이미지 또는 성분표 텍스트)를 철저히 분석하세요.

반려동물 정보:
- 종: ${petInfo.species}
- 나이: ${petInfo.age}세 (${ageStage})
- 체중: ${petInfo.weight}kg

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:

{
  "productName": "제품명 또는 '알 수 없음'",
  "overallScore": 3.5,
  "summary": {
    "strengths": ["강점1", "강점2"],
    "warnings": ["주의사항1", "주의사항2"]
  },
  "nutrients": [
    {
      "name": "단백질",
      "value": "실제값% 또는 '정보 없음'",
      "status": "부족|적정|과잉|정보없음",
      "recommended": "권장 범위",
      "detail": "한 줄 평가"
    },
    {
      "name": "지방",
      "value": "실제값%",
      "status": "부족|적정|과잉|정보없음",
      "recommended": "권장 범위",
      "detail": "한 줄 평가"
    },
    {
      "name": "탄수화물",
      "value": "실제값%",
      "status": "부족|적정|과잉|정보없음",
      "recommended": "권장 범위",
      "detail": "한 줄 평가"
    },
    {
      "name": "수분",
      "value": "실제값%",
      "status": "부족|적정|과잉|정보없음",
      "recommended": "권장 범위",
      "detail": "한 줄 평가"
    },
    {
      "name": "조회분(회분)",
      "value": "실제값%",
      "status": "부족|적정|과잉|정보없음",
      "recommended": "권장 범위",
      "detail": "한 줄 평가"
    }
  ],
  "harmfulIngredients": [
    {
      "name": "성분명",
      "level": "높음|중간|낮음",
      "reason": "위험 이유"
    }
  ],
  "suitability": {
    "suitable": true,
    "reason": "이 반려동물에게 적합/부적합한 이유",
    "feedingGuide": "하루 급여량 가이드 (체중 기반)"
  },
  "overallComment": "수의 전문가 스타일의 종합 평가 2~3문장"
}

평점(overallScore) 기준: 1(매우 나쁨) ~ 5(매우 좋음), 소수점 0.5 단위.
harmfulIngredients가 없으면 빈 배열 []로 표시.
수의학 AAFCO/NRC 영양 권장치를 기준으로 분석하세요.`;
}

export async function POST(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // #4 Rate limiting
    if (!checkRateLimit(`analyze:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return Response.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const ingredientsText = formData.get('ingredientsText') as string | null;
    const petInfoRaw = formData.get('petInfo') as string | null;

    if (!petInfoRaw) {
      return Response.json({ error: '반려동물 정보가 필요합니다.' }, { status: 400 });
    }
    if (!image && !ingredientsText) {
      return Response.json({ error: '이미지 또는 성분표 텍스트가 필요합니다.' }, { status: 400 });
    }

    if (image) {
      if (!ALLOWED_TYPES.includes(image.type)) {
        return Response.json({ error: 'JPG, PNG, WEBP, GIF 형식만 지원합니다.' }, { status: 400 });
      }
      if (image.size > MAX_FILE_SIZE) {
        return Response.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 });
      }
    }

    // #2 입력 검증: JSON.parse + 스키마 검증
    let petInfoParsed: unknown;
    try {
      petInfoParsed = JSON.parse(petInfoRaw);
    } catch {
      return Response.json({ error: '반려동물 정보 형식이 올바르지 않습니다.' }, { status: 400 });
    }
    const petInfo = validatePetInfo(petInfoParsed);
    if (!petInfo) {
      return Response.json({ error: '반려동물 정보가 유효하지 않습니다.' }, { status: 400 });
    }

    const prompt = buildPrompt(petInfo);

    let result: string;

    if (image) {
      const imageBytes = await image.arrayBuffer();
      const base64 = Buffer.from(imageBytes).toString('base64');

      const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', image: base64 },
              { type: 'text', text: prompt },
            ],
          },
        ],
      });
      result = text;
    } else {
      const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        messages: [
          {
            role: 'user',
            content: `성분표:\n${ingredientsText}\n\n${prompt}`,
          },
        ],
      });
      result = text;
    }

    // JSON 파싱 시도
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: '분석 결과를 파싱할 수 없습니다.' }, { status: 500 });
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return Response.json({ analysis });
  } catch (error) {
    console.error('Food analysis error:', error);
    return Response.json({ error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
