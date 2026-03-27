'use client';
import { useState, useEffect } from 'react';

function ComingSoonCard({ title }: { title: string }) {
  return (
    <div
      className="flex-1 rounded-2xl border p-4 flex flex-col items-center gap-2"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </p>
      <div className="w-28 h-28 flex items-center justify-center">
        <div
          className="w-20 h-20 rounded-full border-4 flex items-center justify-center"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="text-xs text-center leading-tight" style={{ color: 'var(--color-text-muted)' }}>
            준비 중
          </span>
        </div>
      </div>
      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        데이터 연동 준비 중
      </p>
    </div>
  );
}

export function HealthDonut() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="flex gap-3">
      <ComingSoonCard title="오늘 활동량" />
      <ComingSoonCard title="음수량" />
    </div>
  );
}
