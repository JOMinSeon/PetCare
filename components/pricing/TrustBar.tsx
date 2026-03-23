import { ShieldCheck, Users, Star, Stethoscope } from 'lucide-react';

const ITEMS = [
  { icon: ShieldCheck, label: '안전 결제', sub: 'KG이니시스 암호화' },
  { icon: Users,       label: '1만+ 반려인', sub: '함께 사용 중' },
  { icon: Star,        label: '4.8점', sub: '앱스토어 평점' },
  { icon: Stethoscope, label: '파트너 수의사', sub: '전국 50+ 병원' },
];

export function TrustBar() {
  return (
    <div
      className="rounded-2xl border px-6 py-5"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ITEMS.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'var(--color-primary-50)' }}
            >
              <Icon size={18} style={{ color: 'var(--color-primary-500)' }} />
            </span>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {label}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
