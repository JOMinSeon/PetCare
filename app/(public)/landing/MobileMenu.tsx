'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        className="lg:hidden rounded-xl p-2 transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
        onClick={() => setOpen(true)}
        aria-label="메뉴 열기"
      >
        <Menu size={22} />
      </button>

      {/* Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-0 bottom-0 w-72 px-6 py-6 overflow-y-auto"
            style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg" style={{ color: 'var(--color-secondary-500)' }}>펫헬스</span>
              <button
                type="button"
                className="rounded-xl p-2"
                style={{ color: 'var(--color-text-secondary)' }}
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
              >
                <X size={22} />
              </button>
            </div>
            <div className="space-y-2 mb-8">
              {[
                { label: '기능', href: '#features' },
                { label: '사용방법', href: '#how-it-works' },
                { label: '요금', href: '#pricing' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-semibold transition-all hover:opacity-80"
                  style={{
                    color: 'var(--color-secondary-500)',
                    background: 'var(--color-surface-2)',
                    border: '1.5px solid var(--color-border)',
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-center text-sm font-semibold"
                style={{ border: '1.5px solid var(--color-border)', color: 'var(--color-secondary-500)' }}
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-center text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
                }}
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
