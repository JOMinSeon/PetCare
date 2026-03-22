import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerDb } from '@/lib/supabase-server';
import { payWithBillingKey, getBillingKey, getPayment } from '@/lib/portone';

const PLAN_PRICES: Record<string, { amount: number; orderName: string }> = {
  plus:    { amount: 4900,  orderName: 'Plus 플랜' },
  premium: { amount: 9900,  orderName: 'Premium 플랜' },
};

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 프론트에서 빌링키 발급 완료 후 호출 — 저장 + 첫 결제 실행
export async function POST(req: NextRequest) {
  const supabase = await getServerDb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { billingKey, planId } = await req.json();

  if (!billingKey || !planId || !PLAN_PRICES[planId]) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // 빌링키 소유권 검증: 현재 사용자가 발급한 빌링키인지 확인
  const billingKeyInfo = await getBillingKey(billingKey);
  if (
    billingKeyInfo.code ||
    billingKeyInfo.customer?.customerId !== user.id.replace(/-/g, '')
  ) {
    return NextResponse.json({ error: '빌링키 인증 실패' }, { status: 400 });
  }

  const { amount, orderName } = PLAN_PRICES[planId];
  const paymentId = `pay-${planId}-${user.id.replace(/-/g, '')}-${Date.now()}`;

  // 첫 결제 실행
  const result = await payWithBillingKey({
    paymentId,
    billingKey,
    orderName,
    amount,
    customerId: user.id,
  });

  if (result.code || result.status === 'FAILED') {
    return NextResponse.json(
      { error: result.message || '결제에 실패했습니다.' },
      { status: 400 }
    );
  }

  // 결제 금액 검증: PortOne에서 실제 청구된 금액이 플랜 가격과 일치하는지 확인
  if (result.paymentId) {
    const payment = await getPayment(result.paymentId);
    if (payment.amount?.total !== amount) {
      console.error('[PortOne] 결제 금액 불일치', { expected: amount, actual: payment.amount?.total });
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });
    }
  }

  // 빌링키 및 플랜 저장
  const { error } = await adminDb()
    .from('profiles')
    .update({
      nicepay_bid: billingKey,
      subscription_plan: planId,
      plan_started_at: new Date().toISOString(),
      subscription_status: 'active',
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('[PortOne] DB update failed:', error);
    return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
