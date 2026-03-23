import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import { NavLinks } from './NavLinks';
import { MobileNav } from './MobileNav';
import { LogoutButton } from './LogoutButton';

export function NavBar() {
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
          <NavLinks />
        </div>
        <div className="flex items-center gap-2">
          <LogoutButton />
        </div>
      </nav>

      {/* ── Mobile floating nav ── */}
      <MobileNav />
    </>
  );
}
