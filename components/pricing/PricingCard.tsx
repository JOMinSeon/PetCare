'use client';
import { Check } from 'lucide-react';
import { formatPrice, type Plan, type BillingCycle } from '@/lib/plans';

interface Props {
  plan: Plan;
  cycle: BillingCycle;
  currentPlanId?: string;
  currentCycle?: BillingCycle;
  onSelect: (planId: string) => void;
}

export function PricingCard({ plan, cycle, currentPlanId, currentCycle, onSelect }: Props) {
  const isYearly = cycle === 'yearly';
  const isCurrent = currentPlanId === plan.id && currentCycle === cycle;
  const isClinic = plan.id === 'clinic';
  const isPremium = plan.id === 'premium';
  const isFree = plan.id === 'free';

  const displayPrice = isYearly ? plan.monthlyEquivalent : plan.monthlyPrice;

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-5 transition-all hover:-translate-y-1"
      style={{
        background: isCurrent ? 'var(--color-primary-50)' : 'var(--color-surface)',
        borderColor: isCurrent
          ? 'var(--color-primary-500)'
          : isClinic
          ? 'var(--color-accent-400)'
          : 'var(--color-border)',
        borderWidth: isCurrent || isClinic ? '2px' : '1px',
        boxShadow: isClinic ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
              {plan.label}
            </span>
            {plan.badge && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={
                  isClinic
                    ? { background: 'var(--color-accent-400)', color: '#fff' }
                    : { background: 'var(--color-primary-500)', color: '#fff' }
                }
              >
                {plan.badge}
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {plan.description}
          </p>
        </div>
        {isCurrent && (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0"
            style={{ background: 'var(--color-primary-500)' }}
          >
            <Check size={14} color="#fff" />
          </span>
        )}
      </div>

      {/* Price */}
      <div className="space-y-0.5">
        <div className="flex items-baseline gap-1">
          <span
            className="text-3xl font-bold"
            style={{
              color: isClinic
                ? 'var(--color-accent-500)'
                : isPremium
                ? 'var(--color-primary-500)'
                : 'var(--color-text-primary)',
            }}
          >
            {formatPrice(displayPrice)}
          </span>
          {!isFree && (
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              /월
            </span>
          )}
          {isYearly && !isFree && (
            <span
              className="ml-1 text-xs line-through"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {formatPrice(plan.monthlyPrice)}
            </span>
          )}
        </div>
        {isYearly && !isFree && (
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            연 {formatPrice(plan.yearlyPrice)} 일괄 청구
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-2">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Check
              size={14}
              style={{ color: 'var(--color-primary-500)', flexShrink: 0 }}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrent ? (
        <div
          className="rounded-xl py-2.5 text-sm font-medium text-center"
          style={{
            background: 'var(--color-primary-100)',
            color: 'var(--color-primary-600)',
          }}
        >
          현재 플랜
        </div>
      ) : (
        <button
          onClick={() => onSelect(plan.id)}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{
            background: isFree
              ? 'var(--color-border)'
              : isClinic
              ? 'var(--color-accent-500)'
              : 'var(--color-primary-500)',
            color: isFree ? 'var(--color-text-secondary)' : '#fff',
          }}
        >
          {isFree ? '무료로 시작' : '시작하기'}
        </button>
      )}
    </div>
  );
}
