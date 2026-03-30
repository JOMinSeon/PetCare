import { NextRequest, NextResponse } from 'next/server';
import { getServerDb, requestPayment } from '@/lib/portone';
import { PLAN_MAP } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    const { billingKey, planId } = await req.json();

    if (!billingKey || !planId) {
      return NextResponse.json({ error: 'billingKey와 planId가 필요합니다.' }, { status: 400 });
    }

    const plan = PLAN_MAP[planId as keyof typeof PLAN_MAP];
    if (!plan) {
      return NextResponse.json({ error: '유효하지 않은 플랜입니다.' }, { status: 400 });
    }

    const supabase = await getServerDb();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, phone')
      .eq('user_id', user.id)
      .single();

    if (profile?.subscription_status === 'active' && profile?.subscription_plan === planId) {
      return NextResponse.json({ error: '이미 구독 중입니다.' }, { status: 409 });
    }

    const idempotencyKey = `${user.id}-${planId}-${Math.floor(Date.now() / 1000)}`;
    const orderId = `order-${user.id.replace(/-/g, '')}-${idempotencyKey}`;
    const orderName = `${plan.label} 플랜 구독`;
    const customerId = user.id.replace(/-/g, '');

    const paymentResult = await requestPayment(
      billingKey,
      plan.monthlyPrice,
      orderId,
      orderName,
      customerId,
      user.email ?? undefined,
      profile?.phone ?? undefined
    );

    console.log('PortOne payment result:', JSON.stringify(paymentResult));

    if (paymentResult.status !== 200) {
      console.error('PortOne payment error:', paymentResult.status, paymentResult.body);
      const errorMsg = paymentResult.body?.message || paymentResult.body?.error?.message || '결제에 실패했습니다.';
      return NextResponse.json({ error: errorMsg }, { status: paymentResult.status || 400 });
    }

    if (paymentResult.body?.status === 'FAILED' || paymentResult.body?.error) {
      const errorMsg = paymentResult.body?.message || paymentResult.body?.error?.message || '결제가 거절되었습니다.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: planId,
        subscription_status: 'active',
        plan_started_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: '구독 정보 업데이트에 실패했습니다.' }, { status: 500 });
    }

    const transactionId = paymentResult.body?.transactionId || orderId;

    await supabase.from('payment_history').insert({
      user_id: user.id,
      payment_id: transactionId,
      plan: planId,
      amount: plan.monthlyPrice,
      status: 'success',
      type: 'subscribe',
    });

    return NextResponse.json({
      success: true,
      transactionId,
    });
  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
