import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getServerDb } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rate-limit';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

export interface HealthAnalysisResult {
  score: number;           // 0~100
  trend: 'improving' | 'stable' | 'declining' | 'insufficient';
  alerts: string[];        // 이상 징후
  advice: string[];        // 맞춤형 케어 조언
  summary: string;         // 종합 소견
}

export async function POST(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    if (!checkRateLimit(`health-analysis:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return Response.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const { petId } = await req.json();
    if (!petId || typeof petId !== 'string') {
      return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    // 반려동물 정보 + 건강 로그 조회 (소유자 검증 포함)
    const { data: pet } = await db
      .from('pets')
      .select('name, species, age, weight, neutered, breed, health_logs(*)')
      .eq('id', petId)
      .eq('user_id', user.id)
      .single();

    if (!pet) {
      return Response.json({ error: '반려동물을 찾을 수 없습니다.' }, { status: 404 });
    }

    const logs = (pet.health_logs ?? [])
      .sort(
        (a: { recorded_at: string }, b: { recorded_at: string }) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      )
      .slice(-30); // 최근 30개 기록만 사용

    const logSummary = logs.length > 0
      ? logs.map((l: { recorded_at: string; weight: number }) =>
          `${new Date(l.recorded_at).toLocaleDateString('ko-KR')}: ${l.weight}kg`
        ).join(', ')
      : '기록 없음';

    const prompt = `
당신은 반려동물 건강 전문 AI 분석가입니다.
아래 반려동물의 정보와 건강 기록을 분석하여 JSON 형식으로만 응답하세요.

[반려동물 정보]
- 이름: ${pet.name}
- 종: ${pet.species === 'dog' ? '강아지' : '고양이'}
- 품종: ${pet.breed ?? '미입력'}
- 나이: ${pet.age}세
- 현재 체중: ${pet.weight}kg
- 중성화: ${pet.neutered ? '완료' : '미완료'}

[최근 체중 기록 (날짜: 체중)]
${logSummary}

[분석 요청]
1. 건강 점수(score): 0~100 사이 정수. 체중 추이, 나이, 종 특성을 고려.
2. 트렌드(trend): "improving"(호전), "stable"(안정), "declining"(악화), "insufficient"(데이터 부족)
3. 이상 징후(alerts): 주의가 필요한 사항 배열 (최대 3개, 없으면 빈 배열)
4. 케어 조언(advice): 맞춤형 케어 조언 배열 (2~4개)
5. 종합 소견(summary): 2~3문장 요약

반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만:
{"score":숫자,"trend":"값","alerts":["..."],"advice":["..."],"summary":"..."}
`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
    });

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: '분석 결과를 처리할 수 없습니다.' }, { status: 500 });
    }

    const result: HealthAnalysisResult = JSON.parse(jsonMatch[0]);

    // 기본 유효성 검사
    if (
      typeof result.score !== 'number' ||
      !['improving', 'stable', 'declining', 'insufficient'].includes(result.trend) ||
      !Array.isArray(result.alerts) ||
      !Array.isArray(result.advice) ||
      typeof result.summary !== 'string'
    ) {
      return Response.json({ error: '분석 결과 형식이 올바르지 않습니다.' }, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Health analysis error:', error);
    return Response.json({ error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
