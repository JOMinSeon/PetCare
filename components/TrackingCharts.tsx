'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface HealthLog {
  id: string;
  pet_id: string;
  weight: number;
  rer: number;
  mer: number;
  recorded_at: string;
}

interface Props {
  logs: HealthLog[];
  petName: string;
  axisStyle: { fontSize: number; fill: string };
}

export default function TrackingCharts({ logs, petName, axisStyle }: Props) {
  const chartData = logs.map((log) => ({
    date: new Date(log.recorded_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    체중: log.weight,
    RER: Math.round(log.rer),
    MER: Math.round(log.mer),
  }));

  return (
    <div
      className="rounded-2xl border p-5 space-y-6"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {petName} 추세 차트
      </h2>

      {/* Weight chart */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>체중 변화 (kg)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="체중"
              stroke="var(--color-primary-500)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'var(--color-primary-500)' }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Calorie chart */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>권장 칼로리 (kcal)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="RER" stroke="var(--color-primary-500)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="MER" stroke="var(--color-accent-500)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
