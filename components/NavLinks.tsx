'use client';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

const desktopLinks = [
  { href: '/pets',         label: '내 반려동물' },
  { href: '/tracking',     label: '체중 & 칼로리' },
  { href: '/analyze-food', label: 'AI 사료 분석' },
  { href: '/calendar',     label: '캘린더' },
  { href: '/community',    label: '커뮤니티' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
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
      <Link
        href="/settings"
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all hover:bg-[var(--color-primary-50)]"
        style={{ color: pathname === '/settings' ? 'var(--color-primary-500)' : 'var(--color-text-muted)' }}
      >
        <Settings size={14} />
        설정
      </Link>
    </>
  );
}
