import { getServerDb } from '@/lib/supabase-server';

export async function PATCH(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();

    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { reservation_id, cancel_reason } = await req.json();

    if (!reservation_id) {
      return Response.json({ error: '예약 ID가 필요합니다.' }, { status: 400 });
    }

    const { data: reservation } = await db
      .from('hospital_reservations')
      .select('id, status')
      .eq('id', reservation_id)
      .eq('user_id', user.id)
      .single();

    if (!reservation) {
      return Response.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (reservation.status !== 'pending') {
      return Response.json({ error: '취소할 수 없는 예약입니다.' }, { status: 400 });
    }

    const { data: updated, error } = await db
      .from('hospital_reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: cancel_reason || null
      })
      .eq('id', reservation_id)
      .select()
      .single();

    if (error) {
      console.error('Cancel reservation error:', error);
      return Response.json({ error: '예약 취소 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return Response.json({ reservation: updated });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    return Response.json({ error: '예약 취소 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
