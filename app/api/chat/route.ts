import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getServerDb } from '@/lib/supabase-server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { messages, petContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: `당신은 반려동물 건강 전문가입니다.
        현재 반려동물 정보: ${JSON.stringify(petContext)}
        항상 수의사 상담을 권고하며, 근거 기반 조언을 제공하세요.`,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return Response.json({ error: '채팅 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
