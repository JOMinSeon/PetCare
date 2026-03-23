import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { payWithBillingKey } from '@/lib/portone';

// Vercel Cron에서만 호출되도록 시크릿 검증
export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // plan_limits에서 가격 정보 로드 (하드코딩 제거)
  const { data: limits } = await supabase
    .from('plan_limits')
    .select('plan_type, monthly_price, yearly_price, order_name');

  type PlanPrice = { monthly: number; yearly: number; orderName: string };
  const planPrices: Record<string, PlanPrice> = {};
  for (const limit of limits ?? []) {
    if (limit.monthly_price > 0) {
      planPrices[limit.plan_type] = {
        monthly: limit.monthly_price,
        yearly: limit.yearly_price,
        orderName: limit.order_name,
      };
    }
  }

  // 활성 구독자 전체 조회 (billing_cycle, next_billing_at 포함)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, nicepay_bid, subscription_plan, billing_cycle, plan_started_at, next_billing_at')
    .eq('subscription_status', 'active')
    .not('nicepay_bid', 'is', null);

  if (!profiles?.length) return NextResponse.json({ processed: 0 });

  const now = new Date();
  let success = 0, failed = 0, skipped = 0;

  for (const profile of profiles) {
    const prices = planPrices[profile.subscription_plan];
    if (!prices) {
      skipped++;
      continue;
    }

    // next_billing_at 기준으로 판단 (없으면 plan_started_at + 1개월 폴백)
    const nextBillAt = profile.next_billing_at
      ? new Date(profile.next_billing_at)
      : (() => {
          const d = new Date(profile.plan_started_at);
          d.setMonth(d.getMonth() + 1);
          return d;
        })();

    if (nextBillAt > now) {
      skipped++;
      continue;
    }

    const cycle = (profile.billing_cycle ?? 'monthly') as 'monthly' | 'yearly';
    const amount = cycle === 'yearly' ? prices.yearly : prices.monthly;
    const paymentId = `renewal-${profile.user_id.replace(/-/g, '')}-${Date.now()}`;

    // 다음 결제일 계산 (billing_cycle 기준)
    const newNextBillingAt = new Date(now);
    if (cycle === 'yearly') {
      newNextBillingAt.setFullYear(newNextBillingAt.getFullYear() + 1);
    } else {
      newNextBillingAt.setMonth(newNextBillingAt.getMonth() + 1);
    }

    try {
      const result = await payWithBillingKey({
        paymentId,
        billingKey: profile.nicepay_bid,
        orderName: prices.orderName,
        amount,
        customerId: profile.user_id,
      });

      if (result.code || result.status === 'FAILED') {
        throw new Error(result.message || 'Payment failed');
      }

      await supabase
        .from('profiles')
        .update({
          plan_started_at: now.toISOString(),
          next_billing_at: newNextBillingAt.toISOString(),
        })
        .eq('user_id', profile.user_id);

      await supabase.from('payment_history').insert({
        user_id: profile.user_id,
        payment_id: paymentId,
        plan: profile.subscription_plan,
        amount,
        status: 'success',
        type: 'renewal',
        billing_cycle: cycle,
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
        billing_cycle: cycle,
      });

      failed++;
    }
  }

  return NextResponse.json({ processed: profiles.length, success, failed, skipped });
}
