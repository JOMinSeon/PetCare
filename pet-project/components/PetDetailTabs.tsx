'use client';
import Link from 'next/link';
import { HeartPulse, Beef, MessageCircle } from 'lucide-react';

const TABS = [
  { key: 'health', label: '건강기록', icon: HeartPulse },
  { key: 'food',   label: '사료분석', icon: Beef },
  { key: 'chat',   label: 'AI상담',   icon: MessageCircle },
];

export function PetDetailTabs({ activeTab, petId }: { activeTab: string; petId: string }) {
  return (
    <div
      className="flex border-b"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <Link
            key={key}
            href={`/pets/${petId}?tab=${key}`}
            className="flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: active ? 'var(--color-primary-500)' : 'transparent',
              color: active ? 'var(--color-primary-500)' : 'var(--color-text-muted)',
            }}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
