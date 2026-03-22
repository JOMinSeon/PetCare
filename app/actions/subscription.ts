'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { getServerDb } from '@/lib/supabase-server';
import { subscribeExpire } from '@/lib/nicepay';

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

  // 현재 빌링키 조회
  const { data: profile } = await db
    .from('profiles')
    .select('nicepay_bid')
    .eq('user_id', user.id)
    .single();

  // 빌링키 해제
  if (profile?.nicepay_bid) {
    const orderId = `expire-${user.id.replace(/-/g, '')}-${Date.now()}`;
    await subscribeExpire(profile.nicepay_bid, orderId);
  }

  // 플랜 무료로 변경
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
