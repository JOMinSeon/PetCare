import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerDb } from '@/lib/supabase-server';
import { subscribeExpire } from '@/lib/nicepay';

export async function POST(req: NextRequest) {
  // 사용자 인증 확인
  const supabase = await getServerDb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminDb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 현재 빌링키 조회
  const { data: profile } = await adminDb
    .from('profiles')
    .select('nicepay_bid')
    .eq('user_id', user.id)
    .single();

  // 빌링키가 있으면 해제
  if (profile?.nicepay_bid) {
    const orderId = `expire-${user.id.replace(/-/g, '')}-${Date.now()}`;
    await subscribeExpire(profile.nicepay_bid, orderId);
  }

  // 플랜 무료로 변경
  await adminDb
    .from('profiles')
    .update({
      subscription_plan: 'free',
      subscription_status: 'inactive',
      nicepay_bid: null,
    })
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
