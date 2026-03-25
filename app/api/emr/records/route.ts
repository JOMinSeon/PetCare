import { getServerDb } from '@/lib/supabase-server';

export async function GET(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();

    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('pet_id');

    if (!petId) {
      return Response.json({ error: 'pet_id가 필요합니다.' }, { status: 400 });
    }

    const { data: pet } = await db
      .from('pets')
      .select('id')
      .eq('id', petId)
      .eq('user_id', user.id)
      .single();

    if (!pet) {
      return Response.json({ error: '반려동물을 찾을 수 없습니다.' }, { status: 404 });
    }

    const { data: records, error } = await db
      .from('emr_records')
      .select('*')
      .eq('pet_id', petId)
      .order('visit_date', { ascending: false });

    if (error) {
      console.error('EMR fetch error:', error);
      return Response.json({ error: 'EMR 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return Response.json({ records: records || [] });
  } catch (error) {
    console.error('EMR fetch error:', error);
    return Response.json({ error: 'EMR 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();

    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const {
      hospital_id,
      pet_id,
      visit_date,
      visit_type,
      diagnosis,
      treatment,
      medications,
      notes,
      fhir_resource_id
    } = await req.json();

    if (!hospital_id || !pet_id || !visit_date || !visit_type) {
      return Response.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const { data: pet } = await db
      .from('pets')
      .select('id')
      .eq('id', pet_id)
      .eq('user_id', user.id)
      .single();

    if (!pet) {
      return Response.json({ error: '반려동물을 찾을 수 없습니다.' }, { status: 404 });
    }

    const { data: record, error } = await db
      .from('emr_records')
      .insert({
        user_id: user.id,
        hospital_id,
        pet_id,
        visit_date,
        visit_type,
        diagnosis: diagnosis || null,
        treatment: treatment || null,
        medications: medications || null,
        notes: notes || null,
        fhir_resource_id: fhir_resource_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('EMR create error:', error);
      return Response.json({ error: 'EMR 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return Response.json({ record });
  } catch (error) {
    console.error('EMR create error:', error);
    return Response.json({ error: 'EMR 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
