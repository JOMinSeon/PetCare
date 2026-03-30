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

    const { data: billingData, error: billingError } = await supabase
      .from('billing_keys')
      .select('billing_key')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (billingError || !billingData) {
      return NextResponse.json({ error: 'No active billing key found' }, { status: 400 });
    }

    const orderId = `order-${user.id.replace(/-/g, '')}-${Date.now()}`;
    const orderName = `${plan.label} 플랜 구독`;

    const paymentResult = await requestPayment(
      billingData.billing_key,
      plan.monthlyPrice,
      orderId,
      orderName
    );

    if (paymentResult.error) {
      return NextResponse.json({ error: paymentResult.error.message }, { status: 400 });
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
      payment_id: paymentResult.transactionId || orderId,
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
      transactionId: paymentResult.transactionId,
    });
  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
