import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { subscribePayments } from '@/lib/nicepay';

const PLAN_PRICES: Record<string, { amount: number; goodsName: string }> = {
  plus:    { amount: 4900,  goodsName: 'Plus 플랜' },
  premium: { amount: 9900,  goodsName: 'Premium 플랜' },
};

// Vercel Cron에서만 호출되도록 시크릿 검증
export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // service_role로 RLS 우회
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
    // 지원하지 않는 플랜 건너뜀
    if (!PLAN_PRICES[profile.subscription_plan]) {
      skipped++;
      continue;
    }

    // plan_started_at 기준 1개월 경과 여부 확인 (마지막 결제일로 사용)
    const lastBillAt = new Date(profile.plan_started_at);
    const nextBillAt = new Date(lastBillAt);
    nextBillAt.setMonth(nextBillAt.getMonth() + 1);

    if (nextBillAt > now) {
      skipped++;
      continue;
    }

    const { amount, goodsName } = PLAN_PRICES[profile.subscription_plan];
    const orderId = `renewal-${profile.user_id.replace(/-/g, '')}-${Date.now()}`;

    try {
      const result = await subscribePayments(profile.nicepay_bid, { orderId, amount, goodsName });

      if (result.resultCode !== '0000') throw new Error(result.resultMsg);

      // 다음 결제 기준일 갱신
      await supabase
        .from('profiles')
        .update({ plan_started_at: now.toISOString() })
        .eq('user_id', profile.user_id);

      success++;
    } catch {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'payment_failed' })
        .eq('user_id', profile.user_id);

      failed++;
    }
  }

  return NextResponse.json({ processed: profiles.length, success, failed, skipped });
}
