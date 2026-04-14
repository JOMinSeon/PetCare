export const runtime = 'nodejs';

import { getServerDb } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rate-limit';
import { healthConsultationAgent } from '@/lib/agents/health-consultation-agent';

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

export async function POST(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    if (!checkRateLimit(`health-consultation:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return Response.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const { petId, message } = await req.json();
    if (!petId || typeof petId !== 'string') {
      return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return Response.json({ error: '메시지를 입력해주세요.' }, { status: 400 });
    }

    const result = await healthConsultationAgent(user.id, petId, message.trim());

    if (result.error && !result.response) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json({
      response: result.response,
      severity: result.severity,
      isEmergency: result.isEmergency,
      needsVetVisit: result.needsVetVisit,
      analysis: result.analysis,
      recommendations: result.recommendations,
    });
  } catch (error) {
    console.error('Health consultation error:', error);
    return Response.json({ error: '상담 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
