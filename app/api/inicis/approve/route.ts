import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/portone';
import { requestRecurringPayment } from '@/lib/inicis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, goodsName } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'orderId와 amount는 필수입니다.' }, { status: 400 });
    }

    const supabase = await getServerDb();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: billingKeyData, error: billingError } = await supabase
      .from('billing_keys')
      .select('billing_key, plan_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (billingError || !billingKeyData?.billing_key) {
      return NextResponse.json({ error: '등록된 결제 정보가 없습니다.' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, phone')
      .eq('user_id', user.id)
      .single();

    const paymentResult = await requestRecurringPayment({
      billKey: billingKeyData.billing_key,
      orderId,
      amount,
      goodsName: goodsName || '정기 결제',
      customerName: profile?.name,
      customerTel: profile?.phone,
    });

    const paymentRecord = {
      user_id: user.id,
      payment_id: orderId,
      plan: billingKeyData.plan_id as string,
      amount,
      status: paymentResult.success ? 'success' : 'failed',
      type: 'recurring',
    };

    await supabase.from('payment_history').insert(paymentRecord);

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.errorMsg || '결제에 실패했습니다.', errorCode: paymentResult.errorCode },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, tid: paymentResult.tid });
  } catch (error) {
    console.error('Approve API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}