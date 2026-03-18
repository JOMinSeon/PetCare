import Link from 'next/link';
import { HeartPulse, MessageCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age: number;
  weight: number;
  neutered: boolean;
  health_logs?: { weight: number; mer: number; recorded_at: string }[];
}

function HealthScoreRing({ score }: { score: number }) {
  const size   = 60;
  const stroke = 5;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const color =
    score >= 80 ? '#10b981' :
    score >= 55 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className="health-ring-track"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className="health-ring-fill ring-animate"
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ '--ring-full': circ, '--ring-offset': offset } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-sm font-bold leading-none" style={{ color }}>
          {score}
        </span>
        <span className="text-[8px] font-medium" style={{ color: 'var(--color-text-muted)' }}>점</span>
      </div>
    </div>
  );
}

export function PetCard({ pet }: { pet: Pet }) {
  const logs = pet.health_logs ?? [];
  const sorted = [...logs].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );
  const latest   = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const weightDelta = latest && previous
    ? +(latest.weight - previous.weight).toFixed(1)
    : null;

  const WeightIcon =
    weightDelta === null ? null :
    weightDelta > 0 ? TrendingUp :
    weightDelta < 0 ? TrendingDown : Minus;

  const deltaColor =
    weightDelta === null ? 'var(--color-text-muted)' :
    weightDelta > 0      ? 'var(--color-danger)'      :
    weightDelta < 0      ? '#10b981'                   :
    'var(--color-text-muted)';

  const currentWeight = latest?.weight ?? pet.weight;
  const targetKcal    = latest ? Math.round(latest.mer) : null;

  // Health score: based on recency of logs
  const daysSinceLast = latest
    ? Math.floor((Date.now() - new Date(latest.recorded_at).getTime()) / 86400000)
    : null;
  const healthScore =
    daysSinceLast === null ? 20 :
    daysSinceLast === 0    ? 95 :
    daysSinceLast === 1    ? 82 :
    daysSinceLast <= 3     ? 68 :
    daysSinceLast <= 7     ? 48 : 25;

  const statusClass =
    healthScore >= 80 ? 'status-healthy' :
    healthScore >= 55 ? 'status-warning' : 'status-danger';

  const speciesEmoji = pet.species === 'dog' ? '🐕' : '🐈';
  const speciesLabel = pet.species === 'dog' ? '강아지' : '고양이';

  return (
    <div className="card card-hover rounded-2xl p-5 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Avatar with status dot */}
        <div className="relative flex-shrink-0">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)',
              border: '2px solid var(--color-border)',
            }}
          >
            {speciesEmoji}
          </div>
          <span className={`status-dot ${statusClass} absolute -bottom-0.5 -right-0.5`} />
        </div>

        {/* Name & info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
            {pet.name}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {speciesLabel}
            {pet.breed ? ` · ${pet.breed}` : ''}
            {` · ${pet.age}세`}
            {pet.neutered ? ' · 중성화' : ''}
          </p>
        </div>

        {/* Health score ring */}
        <HealthScoreRing score={healthScore} />
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border-soft)' }} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-soft)' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            체중
          </p>
          <div className="flex items-end gap-1">
            <span className="font-display text-lg font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
              {currentWeight}
            </span>
            <span className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>kg</span>
            {WeightIcon && weightDelta !== null && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold mb-0.5 ml-auto" style={{ color: deltaColor }}>
                <WeightIcon size={10} />
                {Math.abs(weightDelta)}
              </span>
            )}
          </div>
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-soft)' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            칼로리 목표
          </p>
          {targetKcal !== null ? (
            <div className="flex items-end gap-1">
              <span className="font-display text-lg font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
                {targetKcal}
              </span>
              <span className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>kcal</span>
            </div>
          ) : (
            <p className="text-xs font-medium pt-1" style={{ color: 'var(--color-text-muted)' }}>기록 필요</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link
          href={`/pets/${pet.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold ripple transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-600))',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(45,106,79,0.35)',
          }}
        >
          <HeartPulse size={14} />
          건강 기록
        </Link>
        <Link
          href={`/pets/${pet.id}?tab=chat`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-medium ripple transition-all"
          style={{
            background: 'var(--color-surface-2)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <MessageCircle size={14} />
          AI 상담
        </Link>
      </div>
    </div>
  );
}

/* Skeleton loader */
export function PetCardSkeleton() {
  return (
    <div className="card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl shimmer flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 rounded-lg w-20 shimmer" />
          <div className="h-3 rounded-lg w-32 shimmer" />
        </div>
        <div className="h-[60px] w-[60px] rounded-full shimmer flex-shrink-0" />
      </div>
      <div className="h-px shimmer" />
      <div className="grid grid-cols-2 gap-2.5">
        <div className="h-14 rounded-xl shimmer" />
        <div className="h-14 rounded-xl shimmer" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-full shimmer" />
        <div className="h-10 flex-1 rounded-full shimmer" />
      </div>
    </div>
  );
}
