import { getServerDb } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();

    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { hospital_id, pet_id, reservation_date, reservation_time, department, chief_complaint } = await req.json();

    if (!hospital_id || !reservation_date || !reservation_time || !department) {
      return Response.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const { data: hospital } = await db
      .from('hospitals')
      .select('id')
      .eq('id', hospital_id)
      .eq('is_partner', true)
      .single();

    if (!hospital) {
      return Response.json({ error: '유효하지 않은 병원입니다.' }, { status: 400 });
    }

    const { data: reservation, error } = await db
      .from('hospital_reservations')
      .insert({
        user_id: user.id,
        hospital_id,
        pet_id: pet_id || null,
        reservation_date,
        reservation_time,
        department,
        chief_complaint: chief_complaint || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Reservation error:', error);
      return Response.json({ error: '예약 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return Response.json({ reservation });
  } catch (error) {
    console.error('Reservation error:', error);
    return Response.json({ error: '예약 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();

    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { data: reservations, error } = await db
      .from('hospital_reservations')
      .select(`
        *,
        hospital:hospitals(id, name, address, phone),
        pet:pets(id, name)
      `)
      .eq('user_id', user.id)
      .order('reservation_date', { ascending: false });

    if (error) {
      console.error('Fetch reservations error:', error);
      return Response.json({ error: '예약 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return Response.json({ reservations });
  } catch (error) {
    console.error('Fetch reservations error:', error);
    return Response.json({ error: '예약 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
