import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getServerDb } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rate-limit';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// 20 requests per minute per user
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;

export async function POST(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // #4 Rate limiting
    if (!checkRateLimit(`chat:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return Response.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    // 플랜별 월 사용량 제한 (Free: 10회/월)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: profile } = await db.from('profiles')
      .select('subscription_plan, ai_monthly_usage, ai_usage_reset_month, is_admin')
      .eq('user_id', user.id)
      .single();

    const plan = profile?.subscription_plan ?? 'free';
    if (plan === 'free' && !profile?.is_admin) {
      const sameMonth = profile?.ai_usage_reset_month === currentMonth;
      const usage = sameMonth ? (profile?.ai_monthly_usage ?? 0) : 0;
      if (usage >= 10) {
        return Response.json({
          error: 'AI 상담 월 10회 한도를 초과했습니다. Plus 플랜으로 업그레이드하면 무제한으로 이용할 수 있어요.',
        }, { status: 429 });
      }
      await db.from('profiles').upsert({
        user_id: user.id,
        ai_monthly_usage: sameMonth ? usage + 1 : 1,
        ai_usage_reset_month: currentMonth,
      });
    }

    const { messages, petId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }
    if (messages.length > 50) {
      return Response.json({ error: '메시지 수가 너무 많습니다.' }, { status: 400 });
    }
    for (const msg of messages) {
      if (typeof msg?.content === 'string' && msg.content.length > 4000) {
        return Response.json({ error: '메시지가 너무 깁니다.' }, { status: 400 });
      }
    }

    // #1 Prompt Injection 방지: 클라이언트 petContext 대신 서버에서 DB 조회
    let petSystemInfo = '';
    if (petId && typeof petId === 'string') {
      const { data: pet } = await db
        .from('pets')
        .select('name, species, age, weight, neutered')
        .eq('id', petId)
        .eq('user_id', user.id)
        .single();

      if (pet) {
        petSystemInfo = `현재 반려동물 정보: 이름=${pet.name}, 종=${pet.species}, 나이=${pet.age}세, 체중=${pet.weight}kg, 중성화=${pet.neutered ? '예' : '아니오'}`;
      }
    }

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: `당신은 반려동물 건강 전문가입니다.
        ${petSystemInfo}
        항상 수의사 상담을 권고하며, 근거 기반 조언을 제공하세요.`,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return Response.json({ error: '채팅 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
