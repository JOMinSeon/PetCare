import { NextResponse } from 'next/server';
import { getServerDb } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = await getServerDb();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_id')
      .eq('id', user.id)
      .single();

    if (!profile?.subscription_id) {
      return NextResponse.json({ error: '활성 구독이 없습니다.' }, { status: 400 });
    }

    const { cancelLemonSqueezySubscription } = await import('@/lib/lemonsqueezy');

    const result = await cancelLemonSqueezySubscription(profile.subscription_id);

    if (result.error) {
      console.error('LemonSqueezy cancel error:', result.error);
      return NextResponse.json({ error: '구독 취소에 실패했습니다.' }, { status: 500 });
    }

    await supabase
      .from('profiles')
      .update({
        subscription_plan: 'free',
        subscription_status: 'inactive',
        subscription_id: null,
        plan_started_at: null,
        next_billing_date: null,
      })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}