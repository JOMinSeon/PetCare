import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getServerDb } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rate-limit';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;

export async function POST(req: Request) {
  console.log('[AI-Chat API] Request received');
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    console.log('[AI-Chat API] User:', user?.id);
    if (!user) {
      console.log('[AI-Chat API] No user - returning 401');
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    if (!checkRateLimit(`ai-chat:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      console.log('[AI-Chat API] Rate limit exceeded');
      return Response.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const { messages, petId } = await req.json();
    console.log('[AI-Chat API] Received messages count:', messages?.length, 'petId:', petId);

    if (!messages || !Array.isArray(messages)) {
      console.log('[AI-Chat API] Invalid messages format');
      return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }
    if (messages.length > 50) {
      return Response.json({ error: '메시지 수가 너무 많습니다.' }, { status: 400 });
    }
    const ALLOWED_ROLES = new Set(['user', 'assistant']);

    const coreMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object') {
        return Response.json({ error: '잘못된 메시지 형식입니다.' }, { status: 400 });
      }
      if (!ALLOWED_ROLES.has(msg.role)) {
        return Response.json({ error: '허용되지 않는 메시지 역할입니다.' }, { status: 400 });
      }
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
      coreMessages.push({ role: msg.role as 'user' | 'assistant', content: text });
    }

    let petSystemInfo = '';
    if (petId && typeof petId === 'string') {
      const { data: pet } = await db
        .from('pets')
        .select('name, species, age, weight, neutered')
        .eq('id', petId)
        .eq('user_id', user.id)
        .single();
      console.log('[AI-Chat API] Pet lookup:', pet ? 'found' : 'not found');

      if (pet) {
        petSystemInfo = `현재 반려동물 정보: 이름=${pet.name}, 종=${pet.species}, 나이=${pet.age}세, 체중=${pet.weight}kg, 중성화=${pet.neutered ? '예' : '아니오'}`;
      }
    }

    console.log('[AI-Chat API] Starting streamText');
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: `당신은 반려동물 건강 전문가입니다.
        ${petSystemInfo}
        항상 수의사 상담을 권고하며, 근거 기반 조언을 제공하세요.`,
      messages: coreMessages as Array<{ role: 'user' | 'assistant'; content: string }>,
    });

    console.log('[AI-Chat API] Returning stream response');
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[AI-Chat API] Error:', error);
    return Response.json({ error: '채팅 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}