import { NextResponse } from 'next/server';
import { getServerDb } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = await getServerDb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 서비스 롤로 조회 (RLS 없이 안정적으로 읽기)
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await db
    .from('payment_history')
    .select('id, payment_id, plan, amount, status, type, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(24); // 최대 24건 (2년치)

  if (error) {
    return NextResponse.json({ error: '결제 내역 조회 실패' }, { status: 500 });
  }

  return NextResponse.json({ history: data ?? [] });
}
