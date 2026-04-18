import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/supabase-server';
import { PLAN_MAP, type PlanId, type BillingCycle } from '@/lib/plans';

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
    });

    if (checkout.error) {
      console.error('LemonSqueezy checkout error:', checkout.error);
      return NextResponse.json({ error: '체크아웃 생성에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: checkout.data?.data.attributes.url });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}