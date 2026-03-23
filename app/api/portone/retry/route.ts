import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerDb } from '@/lib/supabase-server';
import { payWithBillingKey } from '@/lib/portone';

const PLAN_PRICES: Record<string, { amount: number; orderName: string }> = {
  premium: { amount: 14900, orderName: '프리미엄 플랜' },
  clinic:  { amount: 49000, orderName: '병원용 플랜' },
};

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 결제 실패 후 기존 빌링키로 재결제
export async function POST() {
  const supabase = await getServerDb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = adminDb();

  const { data: profile } = await db
    .from('profiles')
    .select('nicepay_bid, subscription_plan, subscription_status')
    .eq('user_id', user.id)
    .single();

  if (!profile?.nicepay_bid) {
    return NextResponse.json({ error: '등록된 카드가 없습니다.' }, { status: 400 });
  }
  if (!PLAN_PRICES[profile.subscription_plan]) {
    return NextResponse.json({ error: '유효하지 않은 플랜입니다.' }, { status: 400 });
  }
  if (profile.subscription_status !== 'payment_failed') {
    return NextResponse.json({ error: '재결제가 필요한 상태가 아닙니다.' }, { status: 400 });
  }

  const { amount, orderName } = PLAN_PRICES[profile.subscription_plan];
  const paymentId = `retry-${profile.subscription_plan}-${user.id.replace(/-/g, '')}-${Date.now()}`;

  const result = await payWithBillingKey({
    paymentId,
    billingKey: profile.nicepay_bid,
    orderName,
    amount,
    customerId: user.id,
  });

  const success = !result.code && result.status !== 'FAILED';

  // 결제 내역 기록
  await db.from('payment_history').insert({
    user_id: user.id,
    payment_id: paymentId,
    plan: profile.subscription_plan,
    amount,
    status: success ? 'success' : 'failed',
    type: 'renewal',
  });

  if (!success) {
    return NextResponse.json(
      { error: result.message || '재결제에 실패했습니다.' },
      { status: 400 }
    );
  }

  await db
    .from('profiles')
    .update({
      subscription_status: 'active',
      plan_started_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
