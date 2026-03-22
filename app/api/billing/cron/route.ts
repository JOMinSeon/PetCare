import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { payWithBillingKey } from '@/lib/portone';

const PLAN_PRICES: Record<string, { amount: number; orderName: string }> = {
  plus:    { amount: 4900,  orderName: 'Plus 플랜' },
  premium: { amount: 9900,  orderName: 'Premium 플랜' },
};

// Vercel Cron에서만 호출되도록 시크릿 검증
export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 활성 구독자 전체 조회
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, nicepay_bid, subscription_plan, plan_started_at')
    .eq('subscription_status', 'active')
    .not('nicepay_bid', 'is', null);

  if (!profiles?.length) return NextResponse.json({ processed: 0 });

  const now = new Date();
  let success = 0, failed = 0, skipped = 0;

  for (const profile of profiles) {
    if (!PLAN_PRICES[profile.subscription_plan]) {
      skipped++;
      continue;
    }

    // plan_started_at 기준 1개월 경과 여부 확인
    const lastBillAt = new Date(profile.plan_started_at);
    const nextBillAt = new Date(lastBillAt);
    nextBillAt.setMonth(nextBillAt.getMonth() + 1);

    if (nextBillAt > now) {
      skipped++;
      continue;
    }

    const { amount, orderName } = PLAN_PRICES[profile.subscription_plan];
    const paymentId = `renewal-${profile.user_id.replace(/-/g, '')}-${Date.now()}`;

    try {
      const result = await payWithBillingKey({
        paymentId,
        billingKey: profile.nicepay_bid,
        orderName,
        amount,
        customerId: profile.user_id,
      });

      if (result.code || result.status === 'FAILED') {
        throw new Error(result.message || 'Payment failed');
      }

      await supabase
        .from('profiles')
        .update({ plan_started_at: now.toISOString() })
        .eq('user_id', profile.user_id);

      await supabase.from('payment_history').insert({
        user_id: profile.user_id,
        payment_id: paymentId,
        plan: profile.subscription_plan,
        amount,
        status: 'success',
        type: 'renewal',
      });

      success++;
    } catch {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'payment_failed' })
        .eq('user_id', profile.user_id);

      await supabase.from('payment_history').insert({
        user_id: profile.user_id,
        payment_id: paymentId,
        plan: profile.subscription_plan,
        amount,
        status: 'failed',
        type: 'renewal',
      });

      failed++;
    }
  }

  return NextResponse.json({ processed: profiles.length, success, failed, skipped });
}
