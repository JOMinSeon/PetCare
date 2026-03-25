'use server';
import { createClient } from '@supabase/supabase-js';

export async function createGuestUser(): Promise<{ email: string; password: string; error?: string }> {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const uuid1 = crypto.randomUUID().replace(/-/g, '');
  const uuid2 = crypto.randomUUID().replace(/-/g, '');
  const email = `guest_${Date.now()}_${uuid1.slice(0, 8)}@guest.petcare.app`;
  const password = uuid1 + uuid2;

  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 이메일 확인 건너뜀
  });

  if (error) return { email: '', password: '', error: error.message };
  return { email, password };
}
