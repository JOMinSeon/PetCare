import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerDb } from '@/lib/supabase-server';
import { getBillingKey, deleteBillingKey } from '@/lib/portone';

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 카드 변경: 빌링키 교체만 수행 (결제 없음)
export async function POST(req: NextRequest) {
  const supabase = await getServerDb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { billingKey } = await req.json();
  if (!billingKey) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  // 빌링키 소유권 검증
  const billingKeyInfo = await getBillingKey(billingKey);
  if (
    billingKeyInfo.code ||
    billingKeyInfo.customer?.customerId !== user.id.replace(/-/g, '')
  ) {
    return NextResponse.json({ error: '빌링키 인증 실패' }, { status: 400 });
  }

  const db = adminDb();

  // 기존 빌링키 삭제
  const { data: profile } = await db
    .from('profiles')
    .select('nicepay_bid')
    .eq('user_id', user.id)
    .single();

  if (profile?.nicepay_bid && profile.nicepay_bid !== billingKey) {
    await deleteBillingKey(profile.nicepay_bid);
  }

  // 새 빌링키 저장
  const { error } = await db
    .from('profiles')
    .update({ nicepay_bid: billingKey })
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 });

  return NextResponse.json({ success: true });
}
