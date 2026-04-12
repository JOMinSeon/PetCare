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
  console.log('[Chat API] Request received');
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    console.log('[Chat API] User:', user?.id);
    if (!user) {
      console.log('[Chat API] No user - returning 401');
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // #4 Rate limiting
    if (!checkRateLimit(`chat:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      console.log('[Chat API] Rate limit exceeded');
      return Response.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }
    console.log('[Chat API] Rate limit passed');

    // 플랜별 월 사용량 제한 (Free: 5회/월)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: profile } = await db.from('profiles')
      .select('subscription_plan, ai_monthly_usage, ai_usage_reset_month, is_admin')
      .eq('user_id', user.id)
      .single();

    const plan = profile?.subscription_plan ?? 'free';
    if (plan === 'free' && !profile?.is_admin) {
      const sameMonth = profile?.ai_usage_reset_month === currentMonth;
      const usage = sameMonth ? (profile?.ai_monthly_usage ?? 0) : 0;
      if (usage >= 5) {
        console.log('[Chat API] Monthly limit exceeded');
        return Response.json({
          error: 'AI 상담 월 5회 한도를 초과했습니다. 프리미엄 플랜으로 업그레이드하면 무제한으로 이용할 수 있어요.',
        }, { status: 429 });
      }
      console.log('[Chat API] Monthly usage OK');
      await db.from('profiles').upsert({
        user_id: user.id,
        ai_monthly_usage: sameMonth ? usage + 1 : 1,
        ai_usage_reset_month: currentMonth,
      }, { onConflict: 'user_id' });
    }

    const { messages, petId } = await req.json();
    console.log('[Chat API] Received messages count:', messages?.length, 'petId:', petId);

    if (!messages || !Array.isArray(messages)) {
      console.log('[Chat API] Invalid messages format');
      return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }
    if (messages.length > 50) {
      return Response.json({ error: '메시지 수가 너무 많습니다.' }, { status: 400 });
    }
    const ALLOWED_ROLES = new Set(['user', 'assistant']);
    
    // AI SDK v6 UIMessage → CoreMessage 변환
    const coreMessages: Array<{ role: string; content: string }> = [];
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object') {
        return Response.json({ error: '잘못된 메시지 형식입니다.' }, { status: 400 });
      }
      // role 화이트리스트 검증 (system 역할 주입 방지)
      if (!ALLOWED_ROLES.has(msg.role)) {
        return Response.json({ error: '허용되지 않는 메시지 역할입니다.' }, { status: 400 });
      }
      // AI SDK v6 UIMessage: parts 배열에서 text 추출
      let text = '';
      if (Array.isArray(msg.parts)) {
        for (const part of msg.parts) {
          if (part?.type === 'text' && typeof part.text === 'string') {
            if (part.text.length > 4000) {
              return Response.json({ error: '메시지가 너무 깁니다.' }, { status: 400 });
            }
            text += part.text;
          }
        }
      } else if (typeof msg.content === 'string') {
        text = msg.content;
      }
      coreMessages.push({ role: msg.role, content: text });
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
      console.log('[Chat API] Pet lookup:', pet ? 'found' : 'not found');

      if (pet) {
        petSystemInfo = `현재 반려동물 정보: 이름=${pet.name}, 종=${pet.species}, 나이=${pet.age}세, 체중=${pet.weight}kg, 중성화=${pet.neutered ? '예' : '아니오'}`;
      }
    }

    console.log('[Chat API] Starting streamText');
    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: `당신은 반려동물 건강 전문가입니다.
        ${petSystemInfo}
        항상 수의사 상담을 권고하며, 근거 기반 조언을 제공하세요.`,
      messages: coreMessages,
    });

    console.log('[Chat API] Returning stream response');
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return Response.json({ error: '채팅 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
