import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { payWithBillingKey } from '@/lib/portone';

const PLAN_PRICES: Record<string, { amount: number; orderName: string }> = {
  plus:    { amount: 4900,  orderName: 'Plus 플랜' },
  premium: { amount: 9900,  orderName: 'Premium 플랜' },
};

// 내부/cron에서 호출하는 빌링키 결제 실행 API
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
    .select('nicepay_bid, subscription_plan')
    .eq('user_id', userId)
    .single();

  if (error || !profile?.nicepay_bid || !PLAN_PRICES[profile.subscription_plan]) {
    return NextResponse.json({ error: 'Invalid profile or billing key' }, { status: 400 });
  }

  const { amount, orderName } = PLAN_PRICES[profile.subscription_plan];
  const paymentId = `renewal-${userId.replace(/-/g, '')}-${Date.now()}`;

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

  return NextResponse.json({ success: true, paymentId: result.paymentId });
}
