'use client';

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

export function VaccinationStepper({ species }: { species: string }) {
  const isDog = species?.toLowerCase().includes('dog') || species === '강아지' || species === '개';
  const vaccines = isDog ? DOG_VACCINES : CAT_VACCINES;

  return (
    <ol className="space-y-3">
      {vaccines.map((v, i) => (
        <li key={v.name} className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
            style={{ background: 'var(--color-primary-500)' }}
          >
            {i + 1}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {v.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              권장 시기: {v.weeks}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
