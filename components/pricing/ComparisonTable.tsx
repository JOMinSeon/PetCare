import { Check, Minus } from 'lucide-react';

type CellValue = string | boolean;

interface FeatureRow {
  category?: string;
  label: string;
  free: CellValue;
  premium: CellValue;
  clinic: CellValue;
}

const ROWS: FeatureRow[] = [
  { category: '기본', label: '', free: '', premium: '', clinic: '' },
  { label: '반려동물 등록', free: '1마리', premium: '3마리', clinic: '무제한' },
  { label: '예방접종 알림', free: true, premium: true, clinic: true },
  { label: '커뮤니티 이용', free: true, premium: true, clinic: true },

  { category: 'AI 상담', label: '', free: '', premium: '', clinic: '' },
  { label: 'AI 건강 상담', free: '5회/월', premium: '무제한', clinic: '무제한' },
  { label: '증상 사진 AI 분석', free: false, premium: true, clinic: true },

  { category: '건강 관리', label: '', free: '', premium: '', clinic: '' },
  { label: '건강 기록', free: '기본', premium: '상세 + 차트', clinic: 'EMR 연동' },
  { label: '체중/식이 관리', free: '기본', premium: true, clinic: true },
  { label: '건강 리포트 PDF', free: false, premium: '월 1회', clinic: '무제한' },
  { label: '데이터 내보내기', free: false, premium: 'CSV', clinic: 'CSV, API' },

  { category: '수의사 상담', label: '', free: '', premium: '', clinic: '' },
  { label: '수의사 원격 상담', free: false, premium: '3회/월', clinic: '무제한' },

  { category: '병원 전용', label: '', free: '', premium: '', clinic: '' },
  { label: '병원 연동 API', free: false, premium: false, clinic: true },
  { label: '다중 사용자', free: false, premium: '2명', clinic: '무제한' },

  { category: '고객 지원', label: '', free: '', premium: '', clinic: '' },
  { label: '지원 채널', free: '커뮤니티', premium: '채팅 지원', clinic: '전담 매니저' },
];

function Cell({ value }: { value: CellValue }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check size={16} style={{ color: 'var(--color-primary-500)', margin: '0 auto' }} />
    ) : (
      <Minus size={16} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
    );
  }
  if (value === '') return null;
  return (
    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
      {value}
    </span>
  );
}

const HEADERS = [
  { label: '무료', color: 'var(--color-text-primary)' },
  { label: '프리미엄', color: 'var(--color-primary-500)' },
  { label: '병원용', color: 'var(--color-accent-500)' },
];

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--color-border)' }}>
      <table className="w-full min-w-[520px] text-sm border-collapse">
        <thead>
          <tr style={{ background: 'var(--color-surface-2)' }}>
            <th
              className="py-3 px-4 text-left text-xs font-semibold"
              style={{ color: 'var(--color-text-muted)', width: '40%' }}
            >
              기능
            </th>
            {HEADERS.map(({ label, color }) => (
              <th
                key={label}
                className="py-3 px-3 text-center text-xs font-bold"
                style={{ color }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => {
            if (row.category !== undefined) {
              return (
                <tr key={`cat-${i}`} style={{ background: 'var(--color-bg)' }}>
                  <td
                    colSpan={4}
                    className="py-2 px-4 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {row.category}
                  </td>
                </tr>
              );
            }
            return (
              <tr
                key={row.label}
                className="border-t transition-colors hover:bg-[var(--color-surface-2)]"
                style={{ borderColor: 'var(--color-border-soft)' }}
              >
                <td className="py-3 px-4" style={{ color: 'var(--color-text-primary)' }}>
                  {row.label}
                </td>
                <td className="py-3 px-3 text-center">
                  <Cell value={row.free} />
                </td>
                <td className="py-3 px-3 text-center">
                  <Cell value={row.premium} />
                </td>
                <td className="py-3 px-3 text-center">
                  <Cell value={row.clinic} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
