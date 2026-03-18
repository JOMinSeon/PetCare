'use client';

import { useState, useEffect } from 'react';
import { getBrowserDb } from '@/lib/supabase-browser';

const DOG_VACCINES = [
  { name: '종합백신 (DHPPL)', weeks: '6~8주' },
  { name: '코로나장염', weeks: '8~10주' },
  { name: '켄넬코프', weeks: '8~10주' },
  { name: '광견병', weeks: '12~16주' },
  { name: '인플루엔자', weeks: '12주 이상' },
  { name: '심장사상충 예방', weeks: '연 1회 이상' },
];

const CAT_VACCINES = [
  { name: '종합백신 (FVRCP)', weeks: '6~8주' },
  { name: '백혈병 (FeLV)', weeks: '9~10주' },
  { name: '광견병', weeks: '12주 이상' },
  { name: '고양이 에이즈 (FIV)', weeks: '8~12주' },
  { name: '클라미디아', weeks: '9주 이상' },
  { name: '내부기생충 구충', weeks: '3개월마다' },
];

export function VaccinationStepper({ species, petId }: { species: string; petId: string }) {
  const isDog = species?.toLowerCase().includes('dog') || species === '강아지' || species === '개';
  const vaccines = isDog ? DOG_VACCINES : CAT_VACCINES;

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = getBrowserDb();
      const { data } = await supabase
        .from('pet_vaccinations')
        .select('vaccine_name')
        .eq('pet_id', petId);
      if (data) setCompleted(new Set(data.map((r: { vaccine_name: string }) => r.vaccine_name)));
    };
    load();
  }, [petId]);

  const toggle = async (vaccineName: string) => {
    if (toggling) return;
    setToggling(vaccineName);
    const supabase = getBrowserDb();
    const isDone = completed.has(vaccineName);
    if (isDone) {
      await supabase
        .from('pet_vaccinations')
        .delete()
        .eq('pet_id', petId)
        .eq('vaccine_name', vaccineName);
      setCompleted((prev) => { const next = new Set(prev); next.delete(vaccineName); return next; });
    } else {
      await supabase
        .from('pet_vaccinations')
        .upsert({ pet_id: petId, vaccine_name: vaccineName, done_at: new Date().toISOString() });
      setCompleted((prev) => new Set([...prev, vaccineName]));
    }
    setToggling(null);
  };

  return (
    <ol className="space-y-3">
      {vaccines.map((v, i) => {
        const done = completed.has(v.name);
        const isToggling = toggling === v.name;
        return (
          <li key={v.name} className="flex items-start gap-3">
            <button
              onClick={() => toggle(v.name)}
              disabled={isToggling}
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: done ? '#22c55e' : 'var(--color-primary-500)' }}
              title={done ? '접종 완료 취소' : '접종 완료 표시'}
            >
              {done ? '✓' : i + 1}
            </button>
            <div>
              <p
                className="text-sm font-medium"
                style={{
                  color: done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  textDecoration: done ? 'line-through' : 'none',
                }}
              >
                {v.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                권장 시기: {v.weeks}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
