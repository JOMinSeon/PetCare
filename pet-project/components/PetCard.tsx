import Link from 'next/link';
import { HeartPulse, MessageCircle, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

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
    weightDelta > 0 ? 'var(--color-danger)' :
    weightDelta < 0 ? 'var(--color-primary-500)' :
    'var(--color-text-muted)';

  const currentWeight = latest?.weight ?? pet.weight;
  const targetKcal    = latest ? Math.round(latest.mer) : null;
  const hasLogs       = logs.length > 0;

  return (
    <div
      className="rounded-2xl border p-5 space-y-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl flex-shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)' }}
          aria-label={`${pet.name} 아바타`}
        >
          {pet.species === 'dog' ? '🐕' : '🐈'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
            {pet.name}
          </p>
          <p className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
            {pet.species === 'dog' ? '강아지' : '고양이'}
            {pet.breed ? ` · ${pet.breed}` : ''}
            {' · '}
            {pet.age}세
            {pet.neutered ? ' · 중성화' : ''}
          </p>
        </div>
        {hasLogs && (
          <span
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
            style={{ background: 'var(--color-primary-50)' }}
          >
            <Sparkles size={12} style={{ color: 'var(--color-primary-500)' }} />
          </span>
        )}
      </div>

      {/* Divider */}
      <hr style={{ borderColor: 'var(--color-border)' }} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--color-bg)' }}
        >
          <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>체중</p>
          <div className="flex items-center gap-1 font-bold" style={{ color: 'var(--color-text-primary)' }}>
            <span>{currentWeight} kg</span>
            {WeightIcon && weightDelta !== null && (
              <span className="flex items-center gap-0.5 text-xs" style={{ color: deltaColor }}>
                <WeightIcon size={12} />
                {Math.abs(weightDelta)}
              </span>
            )}
          </div>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--color-bg)' }}
        >
          <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>칼로리 목표</p>
          {targetKcal !== null ? (
            <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {targetKcal} <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>kcal</span>
            </p>
          ) : (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>기록 필요</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/pets/${pet.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: 'var(--color-primary-500)', color: '#fff' }}
        >
          <HeartPulse size={14} />
          건강 기록
        </Link>
        <Link
          href={`/pets/${pet.id}?tab=chat`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: 'var(--color-surface)',
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
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl shimmer" />
        <div className="space-y-2 flex-1">
          <div className="h-4 rounded-lg w-24 shimmer" />
          <div className="h-3 rounded-lg w-36 shimmer" />
        </div>
      </div>
      <div className="h-px shimmer" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 rounded-xl shimmer" />
        <div className="h-12 rounded-xl shimmer" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-xl shimmer" />
        <div className="h-10 flex-1 rounded-xl shimmer" />
      </div>
    </div>
  );
}
