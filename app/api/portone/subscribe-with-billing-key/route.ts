import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerDb } from '@/lib/supabase-server';
import { payWithBillingKey, getPayment, deleteBillingKey, getBillingKey } from '@/lib/portone';
import { getPlanAmount, getOrderName, type PlanId, type BillingCycle } from '@/lib/plans';

const VALID_PLANS: PlanId[] = ['premium', 'clinic'];

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const supabase = await getServerDb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { billingKey, planId, billingCycle, couponCode, changeCard } = await req.json();

  if (!billingKey) {
    return NextResponse.json({ error: '빌링키가 없습니다.' }, { status: 400 });
  }

  // 빌링키 소유권 검증
  const billingKeyInfo = await getBillingKey(billingKey);
  if (
    billingKeyInfo.code ||
    billingKeyInfo.customer?.customerId !== user.id.replace(/-/g, '')
  ) {
    return NextResponse.json({ error: '유효하지 않은 빌링키입니다.' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('nicepay_bid')
    .eq('user_id', user.id)
    .single();

  // 카드 변경 모드: 결제 없이 빌링키만 교체
  if (changeCard) {
    const db = adminDb();
    const oldBillingKey = profile?.nicepay_bid;
    if (oldBillingKey && oldBillingKey !== billingKey) {
      await deleteBillingKey(oldBillingKey).catch(() => null);
    }
    const { error } = await db
      .from('profiles')
      .update({ nicepay_bid: billingKey })
      .eq('user_id', user.id);
    if (error) return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // 구독 결제 모드
  const cycle: BillingCycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
  if (!planId || !VALID_PLANS.includes(planId as PlanId)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const baseAmount = getPlanAmount(planId as PlanId, cycle);

  // 쿠폰 할인 적용
  let couponDiscount = 0;
  let couponId: string | null = null;
  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('id, type, discount_value, applicable_plans, expires_at, max_uses, used_count')
      .eq('code', (couponCode as string).toUpperCase())
      .eq('is_active', true)
      .single();

    if (coupon && (!coupon.expires_at || new Date(coupon.expires_at) >= new Date())) {
      const withinLimit = coupon.max_uses === null || coupon.used_count < coupon.max_uses;
      const planAllowed = !coupon.applicable_plans || coupon.applicable_plans.includes(planId);
      if (withinLimit && planAllowed) {
        couponId = coupon.id;
        couponDiscount = coupon.type === 'fixed'
          ? coupon.discount_value
          : Math.floor(baseAmount * (coupon.discount_value / 100));
      }
    }
  }

  const amount = Math.max(0, baseAmount - couponDiscount);
  const orderName = getOrderName(planId as PlanId, cycle);
  const paymentId = `pay-${planId}-${cycle}-${user.id.replace(/-/g, '')}-${Date.now()}`;

  const result = await payWithBillingKey({ paymentId, billingKey, orderName, amount, customerId: user.id });
  if (result.code || result.status === 'FAILED') {
    return NextResponse.json({ error: result.message || '결제에 실패했습니다.' }, { status: 400 });
  }

  if (result.paymentId) {
    const payment = await getPayment(result.paymentId);
    if (payment.amount?.total !== amount) {
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });
    }
  }

  if (couponId) {
    const db = adminDb();
    await db.from('coupon_usages').insert({ coupon_id: couponId, user_id: user.id });
    await db.rpc('increment_coupon_used_count', { coupon_id: couponId });
  }

  const db = adminDb();
  const now = new Date();
  const nextBillingAt = new Date(now);
  if (cycle === 'yearly') nextBillingAt.setFullYear(nextBillingAt.getFullYear() + 1);
  else nextBillingAt.setMonth(nextBillingAt.getMonth() + 1);

  const { error } = await db
    .from('profiles')
    .update({
      nicepay_bid: billingKey,
      subscription_plan: planId,
      billing_cycle: cycle,
      plan_started_at: now.toISOString(),
      next_billing_at: nextBillingAt.toISOString(),
      subscription_status: 'active',
    })
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 });

  await db.from('payment_history').insert({
    user_id: user.id,
    payment_id: paymentId,
    plan: planId,
    amount,
    discount_amount: couponDiscount > 0 ? couponDiscount : undefined,
    coupon_id: couponId ?? undefined,
    status: 'success',
    type: 'subscribe',
  });

  return NextResponse.json({ success: true });
}
