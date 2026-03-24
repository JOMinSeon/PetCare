import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/supabase-server';
import type { PlanId, BillingCycle } from '@/lib/plans';

export async function POST(req: NextRequest) {
  const supabase = await getServerDb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code, planId, billingCycle } = (await req.json()) as {
    code: string;
    planId: PlanId;
    billingCycle: BillingCycle;
  };

  if (!code || !planId || !billingCycle) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  // coupons 테이블에서 쿠폰 조회
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    return NextResponse.json({ error: '유효하지 않은 쿠폰 코드입니다.' }, { status: 400 });
  }

  // 만료일 확인
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: '만료된 쿠폰입니다.' }, { status: 400 });
  }

  // 사용 횟수 제한 확인
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: '사용 한도가 초과된 쿠폰입니다.' }, { status: 400 });
  }

  // 적용 가능한 플랜 확인 (null이면 모든 플랜 적용)
  if (coupon.applicable_plans && !coupon.applicable_plans.includes(planId)) {
    return NextResponse.json({ error: '이 플랜에 적용할 수 없는 쿠폰입니다.' }, { status: 400 });
  }

  // 이미 사용한 쿠폰인지 확인
  const { data: used } = await supabase
    .from('coupon_usages')
    .select('id')
    .eq('coupon_id', coupon.id)
    .eq('user_id', user.id)
    .single();

  if (used) {
    return NextResponse.json({ error: '이미 사용한 쿠폰입니다.' }, { status: 400 });
  }

  // 할인 금액 계산
  let discount = 0;
  if (coupon.type === 'fixed') {
    discount = coupon.discount_value;
  } else if (coupon.type === 'percent') {
    const { getPlanAmount } = await import('@/lib/plans');
    const baseAmount = getPlanAmount(planId, billingCycle);
    discount = Math.floor(baseAmount * (coupon.discount_value / 100));
  }

  return NextResponse.json({ discount, type: coupon.type });
}
