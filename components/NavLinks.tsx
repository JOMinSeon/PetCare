'use client';
import Link from 'next/link';
import { Settings, Crown } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

const desktopLinks = [
  { href: '/pets',         label: '반려동물' },
  { href: '/tracking',     label: '체중 & 칼로리' },
  { href: '/analyze-food', label: 'AI 사료 분석' },
  { href: '/hospitals',    label: '동물병원' },
  { href: '/calendar',     label: '캘린더' },
  { href: '/community',    label: '커뮤니티' },
  { href: '/pricing',      label: '플랜', icon: Crown },
];

export function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      <div className="flex items-center gap-1">
        {desktopLinks.map(({ href, label, icon: Icon }) => {
          const [hrefPath, hrefQuery] = href.split('?');
          const currentQuery = searchParams.toString();
          const active = hrefQuery
            ? pathname === hrefPath && currentQuery === hrefQuery
            : pathname === href || (href !== '/pets' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--color-primary-50)' : 'transparent',
                color: active ? 'var(--color-primary-500)' : 'var(--color-text-secondary)',
              }}
            >
              {Icon && <Icon size={14} />}
              {label}
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function SettingsLink() {
  const pathname = usePathname();
  return (
    <Link
      href="/settings"
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all hover:bg-[var(--color-primary-50)]"
      style={{ color: pathname === '/settings' ? 'var(--color-primary-500)' : 'var(--color-text-muted)' }}
    >
      <Settings size={14} />
      설정
    </Link>
  );
}