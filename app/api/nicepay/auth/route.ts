import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerDb } from '@/lib/supabase-server';
import { subscribeRegist } from '@/lib/nicepay';

const PLAN_AMOUNTS: Record<string, number> = {
  plus: 4900,
  premium: 9900,
};

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 나이스페이 결제창에서 returnUrl로 POST 호출 (브라우저 리다이렉트이므로 세션 쿠키 사용 가능)
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const planId = searchParams.get('planId');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!userId || !planId || !PLAN_AMOUNTS[planId]) {
    return NextResponse.redirect(`${appUrl}/settings?payment=failed`, { status: 303 });
  }

  // IDOR 방지: 세션의 실제 사용자가 URL의 userId와 일치하는지 검증
  const supabaseAuth = await getServerDb();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${appUrl}/settings?payment=failed`, { status: 303 });
  }

  // 나이스페이는 form POST로 전송
  let resultCode: string;
  let encData: string;
  let orderId: string;

  try {
    const contentType = req.headers.get('content-type') || '';
    let body: Record<string, string> = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      fd.forEach((v, k) => { body[k] = v as string; });
    } else {
      body = await req.json();
    }

    resultCode = body.resultCode ?? '';
    encData = body.encData ?? '';
    orderId = body.orderId ?? '';
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?payment=failed`, { status: 303 });
  }

  if (resultCode !== '0000' || !encData) {
    return NextResponse.redirect(`${appUrl}/settings?payment=failed`, { status: 303 });
  }

  // 빌링키 등록 승인
  const registResult = await subscribeRegist(encData, orderId);

  if (registResult.resultCode !== '0000') {
    console.error('[NicePay] subscribeRegist failed:', registResult);
    return NextResponse.redirect(`${appUrl}/settings?payment=failed`, { status: 303 });
  }

  const bid: string = registResult.bid;

  // Supabase 업데이트
  const { error } = await adminDb()
    .from('profiles')
    .update({
      nicepay_bid: bid,
      subscription_plan: planId,
      plan_started_at: new Date().toISOString(),
      subscription_status: 'active',
    })
    .eq('user_id', userId);

  if (error) {
    console.error('[NicePay] DB update failed:', error);
    return NextResponse.redirect(`${appUrl}/settings?payment=failed`, { status: 303 });
  }

  return NextResponse.redirect(`${appUrl}/settings?payment=success`, { status: 303 });
}
