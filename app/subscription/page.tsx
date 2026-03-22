'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, CreditCard, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, X, ChevronRight, Receipt,
} from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';

const PLAN_LABELS: Record<string, string> = {
  free: '무료',
  plus: 'Plus',
  premium: 'Premium',
};

const PLAN_PRICES: Record<string, string> = {
  free: '₩0/월',
  plus: '₩4,900/월',
  premium: '₩9,900/월',
};

interface PaymentRecord {
  id: string;
  payment_id: string;
  plan: string;
  amount: number;
  status: 'success' | 'failed';
  type: 'subscribe' | 'renewal';
  created_at: string;
}

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('free');
  const [status, setStatus] = useState<string | null>(null);
  const [planStartedAt, setPlanStartedAt] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const card = searchParams.get('card');
    if (card === 'changed') {
      setMessage({ type: 'success', text: '카드가 변경되었습니다.' });
      router.replace('/subscription');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }

      const { data } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, plan_started_at')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPlan(data.subscription_plan ?? 'free');
        setStatus(data.subscription_status ?? 'inactive');
        setPlanStartedAt(data.plan_started_at ?? null);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  // 결제 내역 fetch (컴포넌트 마운트 후 별도 로드)
  useEffect(() => {
    if (loading) return;
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch('/api/subscription/history');
        if (res.ok) {
          const { history: data } = await res.json();
          setHistory(data ?? []);
        }
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [loading]);

  const getNextBillingDate = (startedAt: string | null): string => {
    if (!startedAt) return '';
    const start = new Date(startedAt);
    const now = new Date();
    const next = new Date(start);
    next.setMonth(next.getMonth() + 1);
    while (next <= now) next.setMonth(next.getMonth() + 1);
    return next.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const cancelSubscription = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/portone/cancel', { method: 'POST' });
      if (res.ok) {
        setPlan('free');
        setStatus('inactive');
        setPlanStartedAt(null);
        setShowCancelModal(false);
        setMessage({ type: 'success', text: '구독이 취소되었습니다. 무료 플랜으로 전환되었어요.' });
      } else {
        setMessage({ type: 'error', text: '구독 취소에 실패했습니다. 다시 시도해 주세요.' });
      }
    } finally {
      setCancelling(false);
    }
  };

  const retryPayment = async () => {
    setRetrying(true);
    try {
      const res = await fetch('/api/portone/retry', { method: 'POST' });
      if (res.ok) {
        setStatus('active');
        setPlanStartedAt(new Date().toISOString());
        setMessage({ type: 'success', text: '재결제가 완료되었습니다. 구독이 재개되었어요.' });
        // 결제 내역 갱신
        const hRes = await fetch('/api/subscription/history');
        if (hRes.ok) { const { history: d } = await hRes.json(); setHistory(d ?? []); }
      } else {
        const { error } = await res.json();
        setMessage({ type: 'error', text: error || '재결제에 실패했습니다. 카드를 확인해 주세요.' });
      }
    } finally {
      setRetrying(false);
    }
  };

  if (loading) return null;

  const isPaid = plan !== 'free';
  const isFailed = status === 'payment_failed';
  const nextBilling = getNextBillingDate(planStartedAt);

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-6 py-5 border-b flex items-center gap-3"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center h-9 w-9 rounded-xl transition-opacity hover:opacity-70"
          style={{ background: 'var(--color-bg)' }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>구독 관리</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>구독 현황 및 결제 관리</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-5">
        {/* Message banner */}
        {message && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
            style={{
              background: message.type === 'success' ? 'var(--color-primary-50)' : '#fef2f2',
              color: message.type === 'success' ? 'var(--color-primary-600)' : '#dc2626',
              border: `1px solid ${message.type === 'success' ? 'var(--color-primary-200)' : '#fecaca'}`,
            }}
          >
            {message.type === 'success'
              ? <CheckCircle size={16} style={{ flexShrink: 0 }} />
              : <XCircle size={16} style={{ flexShrink: 0 }} />
            }
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Payment failed warning */}
        {isFailed && (
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>결제 실패</p>
                <p className="text-xs mt-0.5" style={{ color: '#ef4444' }}>
                  최근 결제가 실패했습니다. 아래에서 재결제하거나 카드를 변경하세요.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={retryPayment}
                disabled={retrying}
                className="flex-1 rounded-xl py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ background: '#dc2626' }}
              >
                {retrying ? '결제 중...' : '현재 카드로 재결제'}
              </button>
              <button
                onClick={() => router.push(`/subscribe?planId=${plan}&changeCard=true`)}
                className="flex-1 rounded-xl py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                카드 변경
              </button>
            </div>
          </div>
        )}

        {/* Current plan card */}
        <section>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>현재 구독</p>
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{
              background: 'var(--color-surface)',
              borderColor: isPaid ? 'var(--color-primary-500)' : 'var(--color-border)',
              borderWidth: isPaid ? '2px' : '1px',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  {PLAN_LABELS[plan] ?? plan}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-primary-600)' }}>
                  {PLAN_PRICES[plan]}
                </p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: isFailed ? '#fef2f2' : isPaid ? 'var(--color-primary-50)' : 'var(--color-bg)',
                  color: isFailed ? '#dc2626' : isPaid ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                  border: `1px solid ${isFailed ? '#fecaca' : isPaid ? 'var(--color-primary-200)' : 'var(--color-border)'}`,
                }}
              >
                {isFailed ? '결제 실패' : isPaid ? '구독 중' : '무료'}
              </span>
            </div>

            {isPaid && nextBilling && !isFailed && (
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs"
                style={{ background: 'var(--color-bg)' }}
              >
                <RefreshCw size={13} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  다음 결제일: <strong>{nextBilling}</strong>
                </span>
              </div>
            )}

            {!isPaid && (
              <button
                onClick={() => router.push('/plans')}
                className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'var(--color-primary-500)' }}
              >
                플랜 업그레이드
              </button>
            )}
          </div>
        </section>

        {/* Actions (paid only) */}
        {isPaid && (
          <section>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>결제 관리</p>
            <div
              className="rounded-2xl border divide-y"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <button
                onClick={() => router.push(`/subscribe?planId=${plan}&changeCard=true`)}
                className="flex items-center gap-3 w-full px-5 py-4 text-sm text-left transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <CreditCard size={16} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="font-medium">카드 변경</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    등록된 결제 카드를 변경합니다
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>

              <button
                onClick={() => router.push('/plans')}
                className="flex items-center gap-3 w-full px-5 py-4 text-sm text-left transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span
                  className="flex items-center justify-center h-4 w-4 rounded-full text-xs font-bold"
                  style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
                >
                  ↑
                </span>
                <div className="flex-1">
                  <p className="font-medium">플랜 변경</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    다른 플랜으로 업그레이드/변경
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>

              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-3 w-full px-5 py-4 text-sm text-left transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-danger)' }}
              >
                <XCircle size={16} style={{ flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="font-medium">구독 취소</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    즉시 무료 플랜으로 전환됩니다
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
          </section>
        )}

        {/* Payment history */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={13} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>결제 내역</p>
          </div>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {historyLoading ? (
              <div className="px-5 py-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                불러오는 중...
              </div>
            ) : history.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                결제 내역이 없습니다
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {history.map((record) => (
                  <div key={record.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {PLAN_LABELS[record.plan] ?? record.plan} 플랜
                        </p>
                        <span
                          className="text-xs rounded-full px-2 py-0.5"
                          style={{
                            background: record.type === 'subscribe' ? 'var(--color-primary-50)' : 'var(--color-bg)',
                            color: record.type === 'subscribe' ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                          }}
                        >
                          {record.type === 'subscribe' ? '신규' : '갱신'}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(record.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        ₩{record.amount.toLocaleString()}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: record.status === 'success' ? 'var(--color-primary-500)' : '#dc2626' }}
                      >
                        {record.status === 'success' ? '결제 완료' : '결제 실패'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          환불 정책은{' '}
          <button
            onClick={() => router.push('/refund')}
            className="underline"
            style={{ color: 'var(--color-primary-500)' }}
          >
            환불 정책 페이지
          </button>
          를 확인하세요
        </p>
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>구독 취소</h3>
              <button onClick={() => setShowCancelModal(false)}>
                <X size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              구독을 취소하면 즉시 무료 플랜으로 전환됩니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
              >
                돌아가기
              </button>
              <button
                onClick={cancelSubscription}
                disabled={cancelling}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                style={{ background: 'var(--color-danger)' }}
              >
                {cancelling ? '취소 중...' : '구독 취소'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionContent />
    </Suspense>
  );
}
