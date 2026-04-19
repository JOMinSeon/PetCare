'use client';
import Link from 'next/link';
import { Home, Scale, Utensils, Map as MapIcon, Stethoscope } from 'lucide-react';
import { usePathname } from 'next/navigation';

const mobileTabs = [
  { href: '/pets',                icon: Home,       label: '홈' },
  { href: '/tracking',            icon: Scale,      label: '체중' },
  { href: '/symptom-checker',     icon: Stethoscope, label: '증상' },
  { href: '/analyze-food',        icon: Utensils,   label: 'AI분석' },
  { href: '/hospitals?view=map', icon: MapIcon,    label: '병원' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="floating-nav md:hidden">
      <nav aria-label="모바일 메뉴" className="glass-nav flex items-center gap-0.5 px-2 py-2 rounded-full">
        {mobileTabs.map(({ href, icon: Icon, label }) => {
          const base = href.split('?')[0];
          const active = pathname === base || (base !== '/pets' && pathname.startsWith(base));
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-2 transition-all duration-200"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-600))'
                    : 'transparent',
                  color: active ? '#fff' : 'var(--color-text-muted)',
                  minWidth: '3.5rem',
                }}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="text-[11px] font-semibold leading-none tracking-tight">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
