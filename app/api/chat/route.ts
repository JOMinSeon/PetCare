import { getServerDb } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rate-limit';

const RATE_LIMIT = 6;
const RATE_WINDOW_MS = 60 * 1000;

export async function GET(_req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { data: consultations, error } = await db
      .from('vet_consultations')
      .select(`
        id,
        status,
        scheduled_at,
        chief_complaint,
        created_at,
        updated_at,
        pet:pets(id, name, species, breed),
        vet:vets(id, name, avatar_url, specialty)
      `)
      .eq('user_id', user.id)
      .in('status', ['pending', 'confirmed', 'chat', 'completed'])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Chat API] Failed to fetch consultations:', error);
      return Response.json({ error: '채팅방 목록을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    const consultationsWithLastMessage = await Promise.all(
      (consultations || []).map(async (consultation) => {
        const { data: lastMessage } = await db
          .from('consultation_messages')
          .select('content, created_at, sender_role')
          .eq('consultation_id', consultation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { count: unreadCount } = await db
          .from('consultation_messages')
          .select('*', { count: 'exact', head: true })
          .eq('consultation_id', consultation.id)
          .neq('sender_id', user.id);

        return {
          ...consultation,
          lastMessage: lastMessage || null,
          unreadCount: unreadCount || 0,
        };
      })
    );

    return Response.json({ consultations: consultationsWithLastMessage });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return Response.json({ error: '채팅방 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    if (!checkRateLimit(`vet-chat:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return Response.json({ error: '메시지 전송이 너무 빠릅니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const { consultation_id, content } = await req.json();

    if (!consultation_id || !content) {
      return Response.json({ error: 'consultation_id와 content가 필요합니다.' }, { status: 400 });
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return Response.json({ error: '메시지 내용이 비어있습니다.' }, { status: 400 });
    }

    if (content.length > 1000) {
      return Response.json({ error: '메시지는 1000자 이내로 입력해주세요.' }, { status: 400 });
    }

    const { data: consultation } = await db
      .from('vet_consultations')
      .select('id, user_id, status')
      .eq('id', consultation_id)
      .single();

    if (!consultation) {
      return Response.json({ error: '존재하지 않는 채팅방입니다.' }, { status: 404 });
    }

    if (consultation.user_id !== user.id) {
      return Response.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    const { data: message, error } = await db
      .from('consultation_messages')
      .insert({
        consultation_id,
        sender_id: user.id,
        sender_role: 'user',
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Chat API] Failed to send message:', error);
      return Response.json({ error: '메시지 전송에 실패했습니다.' }, { status: 500 });
    }

    if (consultation.status === 'confirmed') {
      await db
        .from('vet_consultations')
        .update({ status: 'chat', updated_at: new Date().toISOString() })
        .eq('id', consultation_id);
    }

    return Response.json(message, { status: 201 });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return Response.json({ error: '메시지 전송 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { consultation_id, status } = await req.json();

    if (!consultation_id || !status) {
      return Response.json({ error: 'consultation_id와 status가 필요합니다.' }, { status: 400 });
    }

    const validStatuses = ['pending', 'confirmed', 'chat', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return Response.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 });
    }

    const { data: consultation } = await db
      .from('vet_consultations')
      .select('id, user_id, vet_id')
      .eq('id', consultation_id)
      .single();

    if (!consultation) {
      return Response.json({ error: '존재하지 않는 채팅방입니다.' }, { status: 404 });
    }

    if (consultation.user_id !== user.id && consultation.vet_id !== user.id) {
      return Response.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    const { error } = await db
      .from('vet_consultations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', consultation_id);

    if (error) {
      console.error('[Chat API] Failed to update status:', error);
      return Response.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return Response.json({ error: '상태 변경 중 오류가 발생했습니다.' }, { status: 500 });
  }
}