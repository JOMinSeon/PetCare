'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, PawPrint, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';

const tabs = [
  { href: '/pets',      icon: Home,     label: '홈' },
  { href: '/pets',      icon: PawPrint, label: '내 아이' },
  { href: '/calendar',  icon: Calendar, label: '캘린더' },
  { href: '/community', icon: Users,    label: '커뮤니티' },
  { href: '/settings',  icon: Settings, label: '설정' },
];

const desktopLinks = [
  { href: '/pets',      label: '내 반려동물' },
  { href: '/calendar',  label: '캘린더' },
  { href: '/community', label: '커뮤니티' },
];

export function NavBar() {
  const router   = useRouter();
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/landing' || pathname.startsWith('/auth')) return null;

  const handleLogout = async () => {
    const supabase = getBrowserDb();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* ── Desktop top nav ── */}
      <nav
        className="hidden md:flex border-b px-6 py-3 items-center justify-between"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-6">
          <Link
            href="/pets"
            className="flex items-center gap-2 font-bold text-base"
            style={{ color: 'var(--color-primary-500)' }}
          >
            <PawPrint size={20} />
            펫헬스
          </Link>
          {desktopLinks.map(({ href, label }) => {
            const active = pathname === href || (href !== '/pets' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: active ? 'var(--color-primary-500)' : 'var(--color-text-secondary)' }}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
            style={{ color: pathname === '/settings' ? 'var(--color-primary-500)' : 'var(--color-text-secondary)' }}
          >
            <Settings size={14} />
            설정
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>
      </nav>

      {/* ── Mobile bottom tab nav ── */}
      <nav
        className="bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/pets' && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-all"
              style={{ color: active ? 'var(--color-primary-500)' : 'var(--color-text-muted)' }}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
