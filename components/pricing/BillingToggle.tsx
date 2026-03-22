'use client';
import type { BillingCycle } from '@/lib/plans';

interface Props {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export function BillingToggle({ value, onChange }: Props) {
  const isYearly = value === 'yearly';

  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className="text-sm font-medium transition-colors"
        style={{ color: isYearly ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}
      >
        월간
      </span>

      <button
        onClick={() => onChange(isYearly ? 'monthly' : 'yearly')}
        className="relative inline-flex h-7 w-12 items-center overflow-hidden rounded-full transition-colors"
        style={{ background: isYearly ? 'var(--color-primary-500)' : 'var(--color-border)' }}
        aria-label="결제 주기 전환"
      >
        <span
          className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: isYearly ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>

      <span
        className="text-sm font-medium transition-colors"
        style={{ color: isYearly ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
      >
        연간
      </span>

      <span
        className="rounded-full px-2.5 py-0.5 text-xs font-bold transition-opacity"
        style={{
          background: 'var(--color-accent-400)',
          color: '#fff',
          opacity: isYearly ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        2개월 무료
      </span>
    </div>
  );
}
