import { NextRequest, NextResponse } from 'next/server';
import { getServerDb, cancelPayment } from '@/lib/portone';

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerDb();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.subscription_plan === 'free') {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    const { data: billingData } = await supabase
      .from('billing_keys')
      .select('billing_key')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (billingData) {
      try {
        await cancelPayment(billingData.billing_key, 'Subscription cancelled by user');
      } catch (e) {
        console.error('Failed to cancel with PortOne:', e);
      }
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
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
