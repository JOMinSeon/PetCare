import { getServerDb } from '@/lib/supabase-server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ consultationId: string }> }
) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { consultationId } = await params;

    const { data: consultation } = await db
      .from('vet_consultations')
      .select('id, user_id, vet_id')
      .eq('id', consultationId)
      .single();

    if (!consultation) {
      return Response.json({ error: '존재하지 않는 채팅방입니다.' }, { status: 404 });
    }

    if (consultation.user_id !== user.id && consultation.vet_id !== user.id) {
      return Response.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    const { data: messages, error } = await db
      .from('consultation_messages')
      .select(`
        id,
        consultation_id,
        sender_id,
        sender_role,
        content,
        attachment_url,
        created_at
      `)
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Chat API] Failed to fetch messages:', error);
      return Response.json({ error: '메시지를 불러오는데 실패했습니다.' }, { status: 500 });
    }

    const { data: consultationDetails } = await db
      .from('vet_consultations')
      .select(`
        id,
        status,
        scheduled_at,
        chief_complaint,
        pet:pets(id, name, species, breed),
        vet:vets(id, name, avatar_url, specialty)
      `)
      .eq('id', consultationId)
      .single();

    return Response.json({
      messages: messages || [],
      consultation: consultationDetails,
    });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return Response.json({ error: '메시지를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}