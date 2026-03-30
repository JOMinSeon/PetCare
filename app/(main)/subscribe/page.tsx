'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserDb } from '@/lib/supabase-browser';
import SubscribeModal from '@/components/SubscribeModal';
import type { PlanId } from '@/lib/plans';
import { PLAN_MAP } from '@/lib/plans';

function SubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId') as PlanId | null;

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError?.code === 'refresh_token_not_found') {
        await supabase.auth.signOut();
        router.replace('/auth/login');
        return;
      }
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      setReady(true);
    };
    init();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!planId || !PLAN_MAP[planId] || planId === 'free') {
    router.replace('/plans');
    return null;
  }

  return (
    <SubscribeModal
      planId={planId}
      onClose={() => router.push('/plans')}
    />
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }} />
      </div>
    }>
      <SubscribeContent />
    </Suspense>
  );
}
