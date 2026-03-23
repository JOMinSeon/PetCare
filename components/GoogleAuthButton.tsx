'use client';
import { getBrowserDb } from '@/lib/supabase-browser';
import { useState, useEffect } from 'react';

interface GoogleAuthButtonProps {
  mode?: 'login' | 'signup';
  className?: string;
}

function detectInAppBrowser(): { inApp: boolean; isAndroid: boolean; isIOS: boolean } {
  if (typeof navigator === 'undefined') return { inApp: false, isAndroid: false, isIOS: false };
  const ua = navigator.userAgent;
  const inApp = /KAKAOTALK|Line\/|Instagram|FBAN|FBAV|NaverSearch|NAVER\(|DaumApps|Whale\//.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  return { inApp, isAndroid, isIOS };
}

function openExternalBrowser(url: string, isAndroid: boolean): boolean {
  if (isAndroid) {
    // Android: Intent URL로 기본 브라우저(Chrome) 강제 실행
    const host = url.replace(/^https?:\/\//, '');
    window.location.href = `intent://${host}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
    return true;
  } else {
    // iOS: window.open으로 Safari 탈출 시도 (최신 카카오톡 등에서 동작)
    const opened = window.open(url, '_blank');
    return !!opened;
  }
}

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export function GoogleAuthButton({ mode = 'login', className = '' }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [browser, setBrowser] = useState({ inApp: false, isAndroid: false, isIOS: false });
  const [showCopyFallback, setShowCopyFallback] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBrowser(detectInAppBrowser());
  }, []);

  const handleInAppGoogleSignIn = () => {
    const url = window.location.href;
    const success = openExternalBrowser(url, browser.isAndroid);
    // iOS에서 window.open이 차단된 경우 URL 복사 fallback 표시
    if (!success) {
      setShowCopyFallback(true);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowCopyFallback(true);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const supabase = getBrowserDb();
      const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const redirectUrl = `${origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });

      if (error) console.error('Google sign-in error:', error);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 인앱 브라우저: 외부 브라우저 탈출 UI
  if (browser.inApp) {
    if (showCopyFallback) {
      return (
        <div className={`w-full space-y-2 ${className}`}>
          <p className="text-xs text-center text-gray-500">
            아래 주소를 복사해 Safari 또는 Chrome에서 열어주세요.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="flex-1 truncate text-xs text-gray-600">{typeof window !== 'undefined' ? window.location.href : ''}</span>
          </div>
          <button
            onClick={handleCopyUrl}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            {copied ? '복사됐습니다!' : '주소 복사'}
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleInAppGoogleSignIn}
        className={`w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${className}`}
      >
        <span className="flex items-center justify-center gap-2">
          <GoogleIcon />
          Google로 {mode === 'login' ? '로그인' : '가입'} (외부 브라우저에서 열기)
        </span>
      </button>
    );
  }

  // 일반 브라우저
  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          처리 중...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <GoogleIcon />
          Google로 {mode === 'login' ? '로그인' : '가입'}
        </span>
      )}
    </button>
  );
}
