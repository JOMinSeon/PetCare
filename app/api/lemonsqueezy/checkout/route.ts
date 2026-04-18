import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/supabase-server';
import { PLAN_MAP, type PlanId, type BillingCycle } from '@/lib/plans';

const VARIANT_IDS: Record<PlanId, string | undefined> = {
  free: undefined,
  premium: process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID,
  clinic: process.env.LEMONSQUEEZY_CLINIC_VARIANT_ID,
};

export async function POST(req: NextRequest) {
  try {
    const { planId, billingCycle } = await req.json();

    if (!planId || !billingCycle) {
      return NextResponse.json({ error: 'planId와 billingCycle이 필요합니다.' }, { status: 400 });
    }

    if (!PLAN_MAP[planId as PlanId]) {
      return NextResponse.json({ error: '유효하지 않은 플랜입니다.' }, { status: 400 });
    }

    if (planId === 'free') {
      return NextResponse.json({ error: '무료 플랜은 체크아웃이 필요 없습니다.' }, { status: 400 });
    }

    const variantId = VARIANT_IDS[planId as PlanId];
    if (!variantId) {
      console.error('Missing variantId for planId:', planId, 'VARIANT_IDS:', VARIANT_IDS);
      return NextResponse.json({ error: '해당 플랜은 아직 구매할 수 없습니다. (variantId missing)' }, { status: 400 });
    }

    console.log('Checkout request:', { planId, billingCycle, variantId });

    const supabase = await getServerDb();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const userEmail = profile?.email || user.email || '';

    const { createLemonSqueezyCheckout } = await import('@/lib/lemonsqueezy');

    const checkout = await createLemonSqueezyCheckout({
      planId: planId as PlanId,
      billingCycle: billingCycle as BillingCycle,
      userId: user.id,
      userEmail,
      userName,
      variantId,
    });

    if (checkout.error) {
      console.error('LemonSqueezy checkout error:', JSON.stringify(checkout.error));
      return NextResponse.json({ error: checkout.error.message || '체크아웃 생성에 실패했습니다.' }, { status: 500 });
    }

    const checkoutUrl = checkout.data?.data?.attributes?.url;
    if (!checkoutUrl) {
      console.error('No checkout URL in response:', JSON.stringify(checkout.data));
      return NextResponse.json({ error: '체크아웃 URL을 생성하지 못했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Checkout API error:', error);
    const message = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}