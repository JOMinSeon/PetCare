import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { payWithBillingKey } from '@/lib/portone';
import { getPlanAmount, getOrderName, type PlanId, type BillingCycle } from '@/lib/plans';

// 내부/cron에서 호출하는 정기 결제 실행 API
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('nicepay_bid, subscription_plan, billing_cycle')
    .eq('user_id', userId)
    .single();

  const planId = profile?.subscription_plan as PlanId;
  const cycle: BillingCycle = profile?.billing_cycle === 'yearly' ? 'yearly' : 'monthly';

  if (error || !profile?.nicepay_bid || !['premium', 'clinic'].includes(planId)) {
    return NextResponse.json({ error: 'Invalid profile or billing key' }, { status: 400 });
  }

  const amount = getPlanAmount(planId, cycle);
  const orderName = getOrderName(planId, cycle);
  const paymentId = `renewal-${planId}-${cycle}-${userId.replace(/-/g, '')}-${Date.now()}`;

  const result = await payWithBillingKey({
    paymentId,
    billingKey: profile.nicepay_bid,
    orderName,
    amount,
    customerId: userId,
  });

  if (result.code || result.status === 'FAILED') {
    await supabase
      .from('profiles')
      .update({ subscription_status: 'payment_failed' })
      .eq('user_id', userId);
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  await supabase
    .from('profiles')
    .update({
      plan_started_at: new Date().toISOString(),
      subscription_status: 'active',
    })
    .eq('user_id', userId);

  // 결제 내역 기록
  await supabase.from('payment_history').insert({
    user_id: userId,
    payment_id: paymentId,
    plan: planId,
    amount,
    status: 'success',
    type: 'renewal',
  });

  return NextResponse.json({ success: true, paymentId: result.paymentId });
}
