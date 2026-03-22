'use client';
import { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';
import type { HealthAnalysisResult } from '@/app/api/health-analysis/route';

const TREND_CONFIG = {
  improving: { label: '호전 중', icon: TrendingUp,   color: '#16a34a', bg: '#f0fdf4' },
  stable:    { label: '안정적', icon: Minus,          color: '#2563eb', bg: '#eff6ff' },
  declining: { label: '주의 필요', icon: TrendingDown, color: '#dc2626', bg: '#fef2f2' },
  insufficient: { label: '데이터 부족', icon: BarChart2, color: '#9ca3af', bg: '#f9fafb' },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const progress = (score / 100) * circ;
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#dc2626';

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="10" />
        <circle
          cx="56" cy="56" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/ 100</span>
      </div>
    </div>
  );
}

export function HealthAnalysis({ petId, hasLogs }: { petId: string; hasLogs: boolean }) {
  const [result, setResult] = useState<HealthAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '분석에 실패했습니다.');
      } else {
        setResult(data);
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const trend = result ? TREND_CONFIG[result.trend] : null;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
          >
            <Sparkles size={20} style={{ color: 'var(--color-primary-500)' }} />
          </div>
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
              AI 건강 분석
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              인공지능이 매일의 건강 데이터를 분석해 조기 이상 징후를 감지하고 맞춤형 케어 조언을 제공합니다.
            </p>
          </div>
        </div>

        {!hasLogs && (
          <div
            className="rounded-xl p-3 mb-4 flex items-center gap-2 text-sm"
            style={{ background: '#fefce8', color: '#92400e', border: '1px solid #fde68a' }}
          >
            <AlertTriangle size={15} />
            건강 기록이 없으면 분석 정확도가 낮을 수 있어요. 체중을 먼저 기록해보세요.
          </div>
        )}

        <button
          onClick={analyze}
          disabled={loading}
          className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)' }}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              AI 분석 중...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              {result ? '다시 분석하기' : 'AI 건강 분석 시작'}
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 text-sm text-center" style={{ color: '#dc2626' }}>{error}</p>
        )}
      </div>

      {/* Result */}
      {result && (
        <>
          {/* Score + Trend */}
          <div
            className="rounded-2xl border p-5 flex items-center gap-5"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <ScoreRing score={result.score} />
            <div className="flex-1 min-w-0">
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>건강 점수</p>
              <p className="font-bold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
                {result.score >= 75 ? '건강한 상태예요 🎉' : result.score >= 50 ? '관리가 필요해요 💛' : '주의가 필요해요 ⚠️'}
              </p>
              {trend && (
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: trend.bg, color: trend.color }}
                >
                  <trend.icon size={13} />
                  {trend.label}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
              종합 소견
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {result.summary}
            </p>
          </div>

          {/* Alerts */}
          {result.alerts.length > 0 && (
            <div
              className="rounded-2xl border p-5 space-y-2"
              style={{ background: '#fef2f2', borderColor: '#fecaca' }}
            >
              <h3 className="font-semibold text-sm flex items-center gap-1.5" style={{ color: '#991b1b' }}>
                <AlertTriangle size={15} />
                이상 징후
              </h3>
              <ul className="space-y-1.5">
                {result.alerts.map((alert, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#dc2626' }}>
                    <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#dc2626' }} />
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advice */}
          {result.advice.length > 0 && (
            <div
              className="rounded-2xl border p-5 space-y-2"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h3 className="font-semibold text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                <CheckCircle size={15} style={{ color: '#16a34a' }} />
                맞춤형 케어 조언
              </h3>
              <ul className="space-y-2">
                {result.advice.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span
                      className="mt-0.5 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: 'var(--color-primary-500)' }}
                    >
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
          >
            <AlertTriangle size={12} />
            AI 분석은 참고용이며 정확한 진단은 수의사 상담을 권장합니다.
          </div>
        </>
      )}
    </div>
  );
}
