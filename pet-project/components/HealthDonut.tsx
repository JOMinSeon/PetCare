'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ACTIVITY_DATA = [
  { name: '활동', value: 65 },
  { name: '휴식', value: 35 },
];

const WATER_DATA = [
  { name: '섭취', value: 80 },
  { name: '미섭취', value: 20 },
];

const COLORS_ACTIVITY = ['var(--color-primary-500)', 'var(--color-border)'];
const COLORS_WATER = ['var(--color-accent-500)', 'var(--color-border)'];

function DonutCard({
  title,
  data,
  colors,
  centerLabel,
}: {
  title: string;
  data: { name: string; value: number }[];
  colors: string[];
  centerLabel: string;
}) {
  return (
    <div
      className="flex-1 rounded-2xl border p-4 flex flex-col items-center gap-2"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </p>
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={52}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => `${v}%`}
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {centerLabel}
        </span>
      </div>
      <div className="flex gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: colors[i] }}
            />
            {d.name} {d.value}%
          </span>
        ))}
      </div>
    </div>
  );
}

export function HealthDonut() {
  return (
    <div className="flex gap-3">
      <DonutCard
        title="오늘 활동량"
        data={ACTIVITY_DATA}
        colors={COLORS_ACTIVITY}
        centerLabel="65%"
      />
      <DonutCard
        title="음수량"
        data={WATER_DATA}
        colors={COLORS_WATER}
        centerLabel="80%"
      />
    </div>
  );
}
