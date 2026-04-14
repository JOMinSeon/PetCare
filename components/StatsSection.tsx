import { StatCard } from './StatCard';

const stats = [
  { value: '10,000+', label: '등록된 반려동물', icon: '🐾' },
  { value: '5,000+', label: '행복한 가족', icon: '👨‍👩‍👧‍👦' },
  { value: '4.9/5.0', label: '평균 만족도', icon: '⭐' },
  { value: '실시간', label: '24/7 상담 지원', icon: '📞' },
];

export function StatsSection() {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              icon={stat.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
