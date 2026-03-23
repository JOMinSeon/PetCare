'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// KG이니시스 리디렉션 방식: 결제창에서 돌아온 후 이 페이지로 착지
// 성공: ?billing_key=xxx&issue_id=xxx&planId=xxx
// 실패: ?code=xxx&message=xxx&planId=xxx

function BillingCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('결제 처리 중입니다...');

  useEffect(() => {
    const billingKey = searchParams.get('billing_key');
    const code = searchParams.get('code');
    const errorMessage = searchParams.get('message');
    const planId = searchParams.get('planId');
    const from = searchParams.get('from') ?? 'subscribe'; // 'subscribe' | 'settings'

    const redirectTarget = from === 'settings' ? '/settings' : '/settings';

    if (code) {
      // 실패
      setStatus('error');
      setMessage(decodeURIComponent(errorMessage ?? '결제에 실패했습니다.'));
      setTimeout(() => router.replace(`${redirectTarget}?payment=failed`), 2000);
      return;
    }

    if (!billingKey || !planId) {
      setStatus('error');
      setMessage('잘못된 접근입니다.');
      setTimeout(() => router.replace(redirectTarget), 2000);
      return;
    }

    // 서버에 빌링키 저장 + 첫 결제
    fetch('/api/portone/billing-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingKey, planId }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
          setMessage('구독이 완료되었습니다!');
          setTimeout(() => router.replace(`${redirectTarget}?payment=success`), 1500);
        } else {
          const { error: msg } = await res.json();
          setStatus('error');
          setMessage(msg || '구독 처리 중 오류가 발생했습니다.');
          setTimeout(() => router.replace(`${redirectTarget}?payment=failed`), 2000);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('네트워크 오류가 발생했습니다.');
        setTimeout(() => router.replace(`${redirectTarget}?payment=failed`), 2000);
      });
  }, [router, searchParams]);

  const icon =
    status === 'processing' ? (
      <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary-200)', borderTopColor: 'var(--color-primary-500)' }} />
    ) : status === 'success' ? (
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl"
        style={{ background: 'var(--color-primary-500)' }}>
        ✓
      </div>
    ) : (
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl"
        style={{ background: '#dc2626' }}>
        ✕
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4"
      style={{ background: 'var(--color-bg)' }}>
      {icon}
      <p className="text-base font-medium text-center" style={{ color: 'var(--color-text-primary)' }}>
        {message}
      </p>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        잠시 후 자동으로 이동합니다...
      </p>
    </div>
  );
}

export default function BillingCompletePage() {
  return (
    <Suspense>
      <BillingCompleteContent />
    </Suspense>
  );
}
