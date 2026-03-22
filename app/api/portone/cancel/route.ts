import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerDb } from '@/lib/supabase-server';
import { deleteBillingKey } from '@/lib/portone';

export async function POST() {
  const supabase = await getServerDb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminDb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await adminDb
    .from('profiles')
    .select('nicepay_bid')
    .eq('user_id', user.id)
    .single();

  if (profile?.nicepay_bid) {
    await deleteBillingKey(profile.nicepay_bid);
  }

  await adminDb
    .from('profiles')
    .update({
      subscription_plan: 'free',
      subscription_status: 'inactive',
      nicepay_bid: null,
    })
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
