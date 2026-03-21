'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, PawPrint, Scale, Utensils, Calendar, Settings, LogOut, Users } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';

const mobileTabs = [
  { href: '/pets',         icon: Home,     label: '홈' },
  { href: '/tracking',     icon: Scale,    label: '체중' },
  { href: '/analyze-food', icon: Utensils, label: 'AI분석' },
  { href: '/calendar',     icon: Calendar, label: '캘린더' },
  { href: '/settings',     icon: Settings, label: '설정' },
];

const desktopLinks = [
  { href: '/pets',         label: '내 반려동물' },
  { href: '/tracking',     label: '체중 & 칼로리' },
  { href: '/analyze-food', label: 'AI 사료 분석' },
  { href: '/calendar',     label: '캘린더' },
  { href: '/community',    label: '커뮤니티' },
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
        className="hidden md:flex border-b px-6 py-3 items-center justify-between sticky top-0 z-40"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-8">
          <Link
            href="/pets"
            className="flex items-center gap-2 font-bold text-base"
            style={{ color: 'var(--color-primary-500)' }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500))' }}
            >
              <PawPrint size={16} />
            </div>
            펫헬스
          </Link>
          <div className="flex items-center gap-1">
            {desktopLinks.map(({ href, label }) => {
              const active = pathname === href || (href !== '/pets' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
                  style={{
                    background: active ? 'var(--color-primary-50)' : 'transparent',
                    color: active ? 'var(--color-primary-500)' : 'var(--color-text-secondary)',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all hover:bg-[var(--color-primary-50)]"
            style={{ color: pathname === '/settings' ? 'var(--color-primary-500)' : 'var(--color-text-muted)' }}
          >
            <Settings size={14} />
            설정
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all hover:bg-red-50"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>
      </nav>

      {/* ── Mobile: Floating Pill Nav ── */}
      <div className="floating-nav md:hidden">
        <nav className="glass-nav flex items-center gap-0.5 px-2 py-2 rounded-full">
          {mobileTabs.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/pets' && pathname.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                className="relative flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-2 transition-all duration-200"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-600))'
                    : 'transparent',
                  color: active ? '#fff' : 'var(--color-text-muted)',
                  minWidth: '3.5rem',
                }}
              >
                <Icon size={18} />
                <span className="text-[10px] font-semibold leading-none tracking-tight">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
