import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/portone';

export async function POST(req: NextRequest) {
  try {
    let billingKey: string | undefined;
    let planId: string | undefined;

    try {
      const body = await req.json();
      billingKey = body.billingKey;
      planId = body.planId;
    } catch {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    if (!billingKey || !planId) {
      return NextResponse.json({ error: 'billingKey와 planId가 필요합니다.' }, { status: 400 });
    }

    const supabase = await getServerDb();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { error: insertError } = await supabase.from('billing_keys').upsert({
      user_id: user.id,
      billing_key: billingKey,
      plan_id: planId,
      status: 'active',
    }, {
      onConflict: 'user_id'
    });

    if (insertError) {
      console.error('Billing key insert error:', insertError);
      return NextResponse.json({ error: '카드 정보 저장에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Billing key API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
