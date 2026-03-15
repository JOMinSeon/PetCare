'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const STEPS = ['기본 정보', '나이 & 체중', '건강 상태', '완료'];

const SPECIES_OPTIONS = [
  { value: 'dog', label: '강아지', emoji: '🐕' },
  { value: 'cat', label: '고양이', emoji: '🐈' },
];

const CONDITION_OPTIONS = [
  { value: 'bad',    emoji: '😢', label: '좋지 않음' },
  { value: 'normal', emoji: '😐', label: '보통' },
  { value: 'good',   emoji: '😊', label: '좋음' },
  { value: 'great',  emoji: '😆', label: '매우 좋음' },
];

const ACTIVITY_TAGS = ['산책', '수영', '공 놀이', '달리기', '실내 놀이', '훈련', '낮잠', '스트레칭'];

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  const num = parseFloat(value) || 0;
  const pct = Math.min(((num - min) / (max - min)) * 100, 100);
  const valid = value !== '' && num >= min && num <= max;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </label>
        {valid && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-primary-500)' }}>
            <Check size={12} />
            입력 완료
          </span>
        )}
      </div>
      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={num || min}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mb-2 accent-[#10b981]"
        style={{ accentColor: 'var(--color-primary-500)' }}
      />
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${min} ~ ${max}`}
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
          style={{
            background: 'var(--color-bg)',
            borderColor: valid ? 'var(--color-primary-500)' : 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
        <span className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function NewPetPage() {
  const router = useRouter();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    name:       '',
    species:    'dog',
    age:        '',
    weight:     '',
    neutered:   false,
    condition:  'good',
    activities: [] as string[],
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed = () => {
    if (step === 0) return form.name.trim().length >= 1 && form.species;
    if (step === 1) return form.age !== '' && form.weight !== '';
    return true;
  };

  const toggleActivity = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      activities: prev.activities.includes(tag)
        ? prev.activities.filter((a) => a !== tag)
        : [...prev.activities, tag],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('species', form.species);
      formData.append('age', form.age);
      formData.append('weight', form.weight);
      if (form.neutered) formData.append('neutered', 'on');

      const { createPet } = await import('@/app/actions/pet');
      await createPet(formData);
    } finally {
      setLoading(false);
    }
  };

  const nameValid = form.name.trim().length >= 1;

  return (
    <div className="min-h-screen pb-24 md:pb-8 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {step > 0 && (
          <button onClick={prev} style={{ color: 'var(--color-text-secondary)' }}>
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="flex-1">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {step + 1} / {STEPS.length}
          </p>
          <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {STEPS[step]}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1" style={{ background: 'var(--color-border)' }}>
        <div
          className="h-1 transition-all duration-300"
          style={{ width: `${progress}%`, background: 'var(--color-primary-500)' }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-6 pt-8 space-y-6">

        {/* Step 0: 이름 & 종 */}
        {step === 0 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
            {/* 이름 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  반려동물 이름
                </label>
                {nameValid && (
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-primary-500)' }}>
                    <Check size={12} />
                    입력 완료
                  </span>
                )}
              </div>
              <input
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 뭉치, 나비"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: nameValid ? 'var(--color-primary-500)' : 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                💬 아이의 이름을 불러줄게요!
              </p>
            </div>

            {/* 종류 — Segmented Control */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                종류
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SPECIES_OPTIONS.map((opt) => {
                  const active = form.species === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, species: opt.value })}
                      className="rounded-2xl border-2 p-5 text-center transition-all hover:shadow-md"
                      style={{
                        background: active ? 'var(--color-primary-50)' : 'var(--color-surface)',
                        borderColor: active ? 'var(--color-primary-500)' : 'var(--color-border)',
                      }}
                    >
                      <p className="text-4xl mb-2">{opt.emoji}</p>
                      <p className="text-sm font-semibold" style={{ color: active ? 'var(--color-primary-600)' : 'var(--color-text-primary)' }}>
                        {opt.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 중성화 — Segmented Control */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                중성화 여부
              </label>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                칼로리 계산(MER)에 사용돼요
              </p>
              <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                {([{ v: false, label: '아니오' }, { v: true, label: '예 (중성화 완료)' }] as const).map(({ v, label }) => {
                  const active = form.neutered === v;
                  return (
                    <button
                      key={String(v)}
                      onClick={() => setForm({ ...form, neutered: v })}
                      className="flex-1 rounded-lg py-2.5 text-sm font-medium transition-all"
                      style={{
                        background: active ? 'var(--color-surface)' : 'transparent',
                        color: active ? 'var(--color-primary-500)' : 'var(--color-text-muted)',
                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: 나이 & 체중 — Slider + Input */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
            <SliderInput
              label="나이"
              value={form.age}
              onChange={(v) => setForm({ ...form, age: v })}
              min={0}
              max={20}
              step={0.5}
              unit="세"
            />
            <SliderInput
              label="체중"
              value={form.weight}
              onChange={(v) => setForm({ ...form, weight: v })}
              min={0.5}
              max={60}
              step={0.1}
              unit="kg"
            />
            <div
              className="rounded-xl p-4 text-sm"
              style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
            >
              💡 슬라이더로 대략 맞추고, 입력칸에 정확한 값을 넣어보세요
            </div>
          </div>
        )}

        {/* Step 2: 건강 상태 — Emoji Radio + Tag Buttons */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
            {/* 컨디션 — Emoji Radio */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                오늘 컨디션은 어떤가요?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CONDITION_OPTIONS.map((opt) => {
                  const active = form.condition === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setForm({ ...form, condition: opt.value })}
                      className="rounded-2xl border-2 p-3 text-center transition-all hover:scale-105"
                      style={{
                        background: active ? 'var(--color-primary-50)' : 'var(--color-surface)',
                        borderColor: active ? 'var(--color-primary-500)' : 'var(--color-border)',
                      }}
                    >
                      <p className="text-2xl">{opt.emoji}</p>
                      <p className="text-[10px] mt-1 font-medium" style={{ color: active ? 'var(--color-primary-600)' : 'var(--color-text-muted)' }}>
                        {opt.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 활동 — Tag Buttons */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                오늘 한 활동 <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>(해당하는 것 모두 선택)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_TAGS.map((tag) => {
                  const selected = form.activities.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleActivity(tag)}
                      className="rounded-full px-4 py-1.5 text-sm font-medium transition-all hover:scale-105"
                      style={{
                        background: selected ? 'var(--color-primary-500)' : 'var(--color-surface)',
                        color: selected ? '#fff' : 'var(--color-text-secondary)',
                        border: `1.5px solid ${selected ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
                      }}
                    >
                      {selected && <span className="mr-1">✓</span>}
                      {tag}
                    </button>
                  );
                })}
              </div>
              {form.activities.length > 0 && (
                <p className="text-xs mt-2" style={{ color: 'var(--color-primary-500)' }}>
                  {form.activities.length}개 선택됨
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: 완료 요약 */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-4 duration-200 text-center space-y-5">
            <div
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl shadow-lg"
              style={{ background: 'var(--color-primary-500)' }}
            >
              <span className="text-5xl">{form.species === 'dog' ? '🐕' : '🐈'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {form.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                등록 준비가 완료되었어요!
              </p>
            </div>
            <div
              className="rounded-2xl border p-5 text-left space-y-3 text-sm"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {[
                { label: '종류',   value: form.species === 'dog' ? '강아지 🐕' : '고양이 🐈' },
                { label: '나이',   value: `${form.age}세` },
                { label: '체중',   value: `${form.weight}kg` },
                { label: '중성화', value: form.neutered ? '완료 ✅' : '미완료' },
                { label: '컨디션', value: CONDITION_OPTIONS.find((c) => c.value === form.condition)?.emoji ?? '' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
                </div>
              ))}
              {form.activities.length > 0 && (
                <div className="flex items-start justify-between gap-2">
                  <span style={{ color: 'var(--color-text-muted)' }}>활동</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {form.activities.map((a) => (
                      <span
                        key={a}
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-lg mx-auto w-full px-6 py-4">
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={!canProceed()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: 'var(--color-primary-500)', color: '#fff' }}
          >
            다음
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-90"
            style={{ background: 'var(--color-primary-500)', color: '#fff' }}
          >
            {loading ? (
              <span className="flex gap-1">
                <span className="typing-dot h-2 w-2 rounded-full bg-white" />
                <span className="typing-dot h-2 w-2 rounded-full bg-white" />
                <span className="typing-dot h-2 w-2 rounded-full bg-white" />
              </span>
            ) : (
              <>
                <Check size={16} />
                등록 완료!
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
