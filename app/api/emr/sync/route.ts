import { getServerDb } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const db = await getServerDb();
    const { data: { user } } = await db.auth.getUser();

    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { hospital_id, last_sync_at } = await req.json();

    if (!hospital_id) {
      return Response.json({ error: 'hospital_id가 필요합니다.' }, { status: 400 });
    }

    const { data: hospital } = await db
      .from('hospitals')
      .select('id, name, is_partner')
      .eq('id', hospital_id)
      .eq('is_partner', true)
      .single();

    if (!hospital) {
      return Response.json({ error: '유효하지 않은 병원입니다.' }, { status: 400 });
    }

    const syncToken = generateSyncToken();
    
    const { data: syncRecord, error } = await db
      .from('emr_sync_log')
      .insert({
        user_id: user.id,
        hospital_id,
        sync_token: syncToken,
        status: 'pending',
        records_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('EMR sync init error:', error);
      return Response.json({ error: 'EMR 동기화 초기화 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return Response.json({
      sync_id: syncRecord.id,
      sync_token: syncToken,
      emr_portal_url: `https://emr.example.com/connect/${syncToken}`,
    });
  } catch (error) {
    console.error('EMR sync init error:', error);
    return Response.json({ error: 'EMR 동기화 초기화 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

function generateSyncToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
