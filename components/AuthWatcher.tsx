'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getBrowserDb } from '@/lib/supabase-browser';

// 인증 없이도 접근 가능한 경로 목록
const PUBLIC_PATHS = ['/community', '/pricing', '/plans'];

function isProtectedPath(pathname: string) {
  // 명시적으로 공개된 경로는 리다이렉트하지 않음
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return false;
  }
  // (main) 그룹에 속하는 경로 — /auth, /, /landing, /terms 등 공개 경로 제외
  const protectedPrefixes = ['/pets', '/tracking', '/analyze-food', '/calendar', '/settings', '/subscription', '/billing', '/subscribe'];
  return protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function AuthWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = getBrowserDb();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_OUT') {
        // 보호된 경로에 있을 때만 로그인 페이지로 이동, 공개 페이지면 그냥 새로고침
        if (isProtectedPath(pathname)) {
          router.push('/auth/login');
        }
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [router, pathname]);

  return null;
}
