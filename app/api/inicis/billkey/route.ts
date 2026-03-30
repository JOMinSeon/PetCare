import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/portone';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let params: Record<string, string>;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      params = {};
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });
    } else if (contentType.includes('application/json')) {
      params = await req.json();
    } else {
      return NextResponse.redirect(new URL('/settings?payment=failed&reason=invalid_content_type', req.url));
    }

    const { resultCode, resultMsg, authToken, billKey, oid, planId: planIdParam } = params;

    console.log('Inicis BillKey response:', { resultCode, resultMsg, oid, hasBillKey: !!billKey, hasAuthToken: !!authToken });

    if (resultCode !== '00') {
      return NextResponse.redirect(new URL(`/settings?payment=failed&reason=${encodeURIComponent(resultMsg || '빌키 발급 실패')}`, req.url));
    }

    const extractedBillKey = billKey || authToken;
    if (!extractedBillKey) {
      return NextResponse.redirect(new URL('/settings?payment=failed&reason=no_billkey', req.url));
    }

    const supabase = await getServerDb();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const planId = planIdParam || 'premium';

    const { error: insertError } = await supabase.from('billing_keys').upsert(
      { user_id: user.id, billing_key: extractedBillKey, plan_id: planId, status: 'active' },
      { onConflict: 'user_id' }
    );

    if (insertError) {
      console.error('Billing key insert error:', insertError);
      return NextResponse.redirect(new URL('/settings?payment=failed&reason=db_error', req.url));
    }

    return NextResponse.redirect(new URL('/settings?payment=success', req.url));
  } catch (error) {
    console.error('BillKey API error:', error);
    return NextResponse.redirect(new URL('/settings?payment=failed&reason=server_error', req.url));
  }
}