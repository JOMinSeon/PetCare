'use client';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface HealthLog {
  id: string;
  weight: number;
  rer: number;
  mer: number;
  recorded_at: string;
}

export function HealthChart({ data }: { data: HealthLog[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (!data || data.length === 0) {
    return (
      <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
        건강 기록이 없습니다.
      </p>
    );
  }

  const chartData = data.map((log) => ({
    date: new Date(log.recorded_at).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    }),
    체중: log.weight,
    RER: Math.round(log.rer),
    MER: Math.round(log.mer),
  }));

  const latestMer = data[data.length - 1]?.mer;

  const axisStyle = { fontSize: 11, fill: 'var(--color-text-muted)' } as const;

  return (
    <div className="space-y-6" aria-label={`건강 기록 차트`}>
      {/* Weight chart */}
      <div style={{ minWidth: 0 }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          체중 변화 (kg)
        </h3>
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
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--color-primary-500)' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Calorie chart */}
      <div style={{ minWidth: 0 }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          권장 칼로리 (kcal)
        </h3>
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
            <Line
              type="monotone"
              dataKey="RER"
              stroke="var(--color-primary-500)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="MER"
              stroke="var(--color-accent-500)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            {latestMer && (
              <ReferenceLine
                y={Math.round(latestMer)}
                stroke="var(--color-accent-400)"
                strokeDasharray="4 4"
                label={{
                  value: `목표 ${Math.round(latestMer)} kcal`,
                  position: 'insideTopRight',
                  fontSize: 11,
                  fill: 'var(--color-text-muted)',
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
