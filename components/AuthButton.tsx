'use client';
import Link from 'next/link';
import { LogIn, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session, UserResponse } from '@supabase/supabase-js';
import { getBrowserDb } from '@/lib/supabase-browser';

export function AuthButton() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = getBrowserDb();
    supabase.auth.getUser().then(
      (res: UserResponse) => { setIsLoggedIn(!!res.data?.user); }
    );
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (isLoggedIn === null) return null;

  if (!isLoggedIn) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-600))',
          color: '#fff',
        }}
      >
        <LogIn size={14} />
        로그인
      </Link>
    );
  }

  const handleLogout = async () => {
    const supabase = getBrowserDb();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all hover:bg-red-50"
      style={{ color: 'var(--color-text-muted)' }}
    >
      <LogOut size={14} />
      로그아웃
    </button>
  );
}
