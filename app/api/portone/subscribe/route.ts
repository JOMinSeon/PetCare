import { NextRequest, NextResponse } from 'next/server';
import { getServerDb, requestPayment } from '@/lib/portone';
import { PLAN_MAP } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    const { billingKey, planId } = await req.json();

    if (!billingKey || !planId) {
      return NextResponse.json({ error: 'billingKey and planId are required' }, { status: 400 });
    }

    const plan = PLAN_MAP[planId as keyof typeof PLAN_MAP];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const supabase = await getServerDb();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, phone')
      .eq('user_id', user.id)
      .single();

    const billingKeyCustomerId = user.id.replace(/-/g, '');

    if (profile?.subscription_status === 'active' && profile?.subscription_plan === planId) {
      return NextResponse.json({ error: '이미 구독 중입니다.' }, { status: 409 });
    }

    const { data: billingData, error: billingError } = await supabase
      .from('billing_keys')
      .select('billing_key')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    console.log('billing key lookup:', { userId: user.id, billingError, billingData: billingData?.billing_key?.slice(0, 20) });

    if (billingError) {
      console.error('Billing key lookup error:', billingError);
      return NextResponse.json({ error: '빌링키 조회 중 오류가 발생했습니다.' }, { status: 400 });
    }

    if (!billingData) {
      return NextResponse.json({ error: '등록된 카드가 없습니다. 다시 카드 등록을 진행해 주세요.' }, { status: 400 });
    }

    const idempotencyKey = `${user.id}-${planId}-${Math.floor(Date.now() / 1000)}`;
    const orderId = `order-${user.id.replace(/-/g, '')}-${idempotencyKey}`;
    const orderName = `${plan.label} 플랜 구독`;

    const paymentResult = await requestPayment(
      billingData.billing_key,
      plan.monthlyPrice,
      orderId,
      orderName,
      billingKeyCustomerId,
      user.email ?? undefined,
      profile?.phone ?? undefined
    );

    console.log('PortOne payment result:', JSON.stringify(paymentResult));

    if (paymentResult.status === 406) {
      console.error('PortOne 406:', paymentResult.body);
      return NextResponse.json({ error: paymentResult.body?.message || '결제가 거절되었습니다.' }, { status: 406 });
    }

    if (paymentResult.body?.error) {
      return NextResponse.json({ error: paymentResult.body?.error?.message || '결제 처리 중 오류가 발생했습니다.' }, { status: 400 });
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
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    const { error: historyError } = await supabase.from('payment_history').insert({
      user_id: user.id,
      payment_id: paymentResult.body.transactionId || orderId,
      plan: planId,
      amount: plan.monthlyPrice,
      status: 'success',
      type: 'subscribe',
    });

    if (historyError) {
      console.error('Failed to insert payment history:', historyError);
    }

    return NextResponse.json({
      success: true,
      transactionId: paymentResult.body.transactionId,
    });
  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
