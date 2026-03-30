import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/portone';

export async function POST(req: NextRequest) {
  try {
    const { billingKey, planId } = await req.json();

    if (!billingKey || !planId) {
      return NextResponse.json({ error: 'billingKey and planId are required' }, { status: 400 });
    }

    const supabase = await getServerDb();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
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
      return NextResponse.json({ error: 'Failed to store billing key' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Billing key API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const billingKey = searchParams.get('billingKey');

    if (!billingKey) {
      return NextResponse.json({ error: 'billingKey is required' }, { status: 400 });
    }

    const response = await fetch(`https://api.portone.io/v2/billing-key/${billingKey}`, {
      headers: {
        'Authorization': `PortOne ${process.env.PORTONE_API_SECRET}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Billing key verification error:', error);
    return NextResponse.json({ error: 'Failed to verify billing key' }, { status: 500 });
  }
}
