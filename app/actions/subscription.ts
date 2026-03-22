'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { getServerDb } from '@/lib/supabase-server';
import { deleteBillingKey } from '@/lib/portone';

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** 구독 취소 Server Action */
export async function cancelSubscription() {
  const supabase = await getServerDb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다' };

  const db = adminDb();

  const { data: profile } = await db
    .from('profiles')
    .select('nicepay_bid')
    .eq('user_id', user.id)
    .single();

  if (profile?.nicepay_bid) {
    await deleteBillingKey(profile.nicepay_bid);
  }

  const { error } = await db
    .from('profiles')
    .update({
      subscription_plan: 'free',
      subscription_status: 'inactive',
      nicepay_bid: null,
    })
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/settings');
  revalidatePath('/subscribe');
  return { error: null };
}
