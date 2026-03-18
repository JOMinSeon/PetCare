'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

const PET_TYPES = [
  { value: 'dog', label: '강아지', emoji: '🐕', desc: '충성스럽고 활발한 친구' },
  { value: 'cat', label: '고양이', emoji: '🐈', desc: '독립적이고 우아한 친구' },
  { value: 'other', label: '기타', emoji: '🐾', desc: '토끼, 새, 햄스터 등' },
];

export function PetTypeOnboarding() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
  };

  const handleNext = () => {
    if (!selected) return;
    router.push(`/pets/new?species=${selected}`);
  };

  return (
    <div className="space-y-8">
      {/* 온보딩 카드 */}
      <div
        className="rounded-2xl border p-8 space-y-6"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <p className="text-4xl">🏠</p>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            어떤 반려동물인가요?
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            먼저 반려동물 종류를 선택해주세요
          </p>
        </div>

        {/* 종류 선택 */}
        <div className="grid grid-cols-3 gap-3">
          {PET_TYPES.map(({ value, label, emoji, desc }) => {
            const isSelected = selected === value;
            return (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className="rounded-2xl border-2 p-4 text-center space-y-2 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: isSelected ? 'var(--color-primary-50)' : 'var(--color-bg)',
                  borderColor: isSelected ? 'var(--color-primary-500)' : 'var(--color-border)',
                }}
              >
                <p className="text-4xl">{emoji}</p>
                <p
                  className="font-bold text-sm"
                  style={{ color: isSelected ? 'var(--color-primary-600)' : 'var(--color-text-primary)' }}
                >
                  {label}
                </p>
                <p className="text-xs leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                  {desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all"
          style={{
            background: selected ? 'var(--color-primary-500)' : 'var(--color-border)',
            color: selected ? '#fff' : 'var(--color-text-muted)',
            cursor: selected ? 'pointer' : 'not-allowed',
            boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          <Plus size={16} />
          {selected
            ? `${PET_TYPES.find((t) => t.value === selected)?.label} 등록하기`
            : '종류를 선택해주세요'}
        </button>
      </div>

      {/* 단계 안내 */}
      <div
        className="rounded-2xl border p-5 space-y-4"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          등록 후 바로 이용할 수 있어요
        </p>
        <div className="space-y-3">
          {[
            { step: '1', icon: '📝', label: '기본 정보 입력', desc: '이름, 나이, 체중을 입력해요' },
            { step: '2', icon: '📊', label: '건강 기록 시작', desc: '매일 체중과 컨디션을 기록해요' },
            { step: '3', icon: '🤖', label: 'AI 분석 활용', desc: '사료 분석과 맞춤 케어를 받아요' },
          ].map(({ step: s, icon, label, desc }) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}
              >
                {s}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
