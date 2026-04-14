import Link from 'next/link';
import { Suspense } from 'react';
import { PawPrint, Phone } from 'lucide-react';
import { NavLinks, SettingsLink } from './NavLinks';
import { MobileNav } from './MobileNav';
import { AuthButton } from './AuthButton';

export function NavBar() {
  return (
    <>
      {/* ── Desktop top nav ── */}
      <nav
        aria-label="주요 메뉴"
        className="glass-nav hidden md:flex border-b px-6 py-3 items-center justify-between sticky top-0 z-40"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
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
          <Suspense fallback={null}>
            <NavLinks />
          </Suspense>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="tel:050713057196"
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-secondary-600)' }}
          >
            <Phone size={14} />
            0507-1305-7196
          </a>
          <Suspense fallback={null}>
            <SettingsLink />
          </Suspense>
          <AuthButton />
        </div>
      </nav>

      {/* ── Mobile floating nav ── */}
      <MobileNav />
    </>
  );
}
