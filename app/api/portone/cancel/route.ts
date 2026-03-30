import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/portone';

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerDb();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.subscription_plan === 'free') {
      return NextResponse.json({ error: '구독 중이 아닙니다.' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: 'free',
        subscription_status: 'inactive',
        plan_started_at: null,
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Cancel subscription error:', updateError);
      return NextResponse.json({ error: '구독 취소에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
