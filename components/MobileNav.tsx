'use client';
import Link from 'next/link';
import { Home, Scale, Utensils, Calendar, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

const mobileTabs = [
  { href: '/pets',         icon: Home,     label: '홈' },
  { href: '/tracking',     icon: Scale,    label: '체중' },
  { href: '/analyze-food', icon: Utensils, label: 'AI분석' },
  { href: '/calendar',     icon: Calendar, label: '캘린더' },
  { href: '/settings',     icon: Settings, label: '설정' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
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
  );
}
