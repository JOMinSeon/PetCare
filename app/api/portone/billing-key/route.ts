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
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    console.log('billing-key route:', { billingKey: billingKey?.slice(0, 20), planId });

    if (!billingKey || !planId) {
      return NextResponse.json({ error: 'billingKey and planId are required' }, { status: 400 });
    }

    const supabase = await getServerDb();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('billing-key auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      console.error('billing-key insert error:', insertError);
      return NextResponse.json({ error: 'Failed to store billing key' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Billing key API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


