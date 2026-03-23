'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserDb } from '@/lib/supabase-browser';

export function AuthWatcher() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getBrowserDb();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth/login');
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
