'use client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getBrowserDb } from '@/lib/supabase-browser';

export function LogoutButton() {
  const router = useRouter();

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
