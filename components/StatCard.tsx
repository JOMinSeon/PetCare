interface StatCardProps {
  value: string;
  label: string;
  icon: string;
}

export function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div
      className="text-center p-6 rounded-2xl transition-all duration-300 hover:shadow-md"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <div
        className="text-3xl font-bold mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {value}
      </div>
      <div
        className="text-sm font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </div>
    </div>
  );
}
