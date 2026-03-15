'use client';
import { useState, useRef, DragEvent } from 'react';
import {
  Camera, Upload, AlertTriangle, Loader2, Star,
  CheckCircle2, XCircle, ShieldAlert, FileText, Image as ImageIcon,
} from 'lucide-react';

interface PetInfo {
  species: string;
  age: number;
  weight: number;
}

interface Nutrient {
  name: string;
  value: string;
  status: '부족' | '적정' | '과잉' | '정보없음';
  recommended: string;
  detail: string;
}

interface HarmfulIngredient {
  name: string;
  level: '높음' | '중간' | '낮음';
  reason: string;
}

interface AnalysisResult {
  productName: string;
  overallScore: number;
  summary: { strengths: string[]; warnings: string[] };
  nutrients: Nutrient[];
  harmfulIngredients: HarmfulIngredient[];
  suitability: { suitable: boolean; reason: string; feedingGuide: string };
  overallComment: string;
}

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  '적정': { bg: '#E8F5E9', text: '#2E7D32', label: '적정' },
  '부족': { bg: '#FFF9C4', text: '#F57F17', label: '부족' },
  '과잉': { bg: '#FBE9E7', text: '#BF360C', label: '과잉' },
  '정보없음': { bg: '#F5F5F5', text: '#757575', label: '정보없음' },
};

const harmfulLevelStyle: Record<string, { bg: string; text: string; dot: string }> = {
  '높음': { bg: '#FBE9E7', text: '#BF360C', dot: '#E53935' },
  '중간': { bg: '#FFF3E0', text: '#E65100', dot: '#FB8C00' },
  '낮음': { bg: '#FFF9C4', text: '#F57F17', dot: '#FDD835' },
};

function ScoreStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = score >= n;
        const half = !filled && score >= n - 0.5;
        return (
          <Star
            key={n}
            size={20}
            style={{
              fill: filled || half ? '#FDD835' : 'none',
              color: filled || half ? '#FDD835' : '#BDBDBD',
            }}
          />
        );
      })}
      <span className="ml-1 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {score.toFixed(1)} / 5.0
      </span>
    </div>
  );
}

export function FoodAnalyzer({ petInfo }: { petInfo: PetInfo }) {
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ingredientsText, setIngredientsText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const applyFile = (f: File) => {
    if (!ALLOWED.includes(f.type)) { setError('JPG, PNG, WEBP, GIF 형식만 지원합니다.'); return; }
    if (f.size > MAX_SIZE) { setError('파일 크기는 5MB 이하여야 합니다.'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
    setAnalysis(null);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) applyFile(f);
  };

  const canSubmit = mode === 'image' ? !!file : ingredientsText.trim().length > 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setAnalysis(null);

    const formData = new FormData();
    formData.append('petInfo', JSON.stringify(petInfo));
    if (mode === 'image' && file) {
      formData.append('image', file);
    } else {
      formData.append('ingredientsText', ingredientsText);
    }

    try {
      const res = await fetch('/api/analyze-food', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '오류가 발생했습니다.'); return; }
      setAnalysis(data.analysis);
    } catch {
      setError('분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-4 border-b"
        style={{ background: '#2E7D32', borderColor: '#1B5E20' }}
      >
        <Camera size={18} color="#A5D6A7" />
        <h2 className="font-semibold text-base text-white">AI 사료 성분 분석</h2>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
        {/* Mode tabs */}
        <div
          className="flex rounded-xl overflow-hidden border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {(['image', 'text'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); setAnalysis(null); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: mode === m ? '#2E7D32' : 'var(--color-bg)',
                color: mode === m ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              {m === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />}
              {m === 'image' ? '이미지 업로드' : '성분표 직접 입력'}
            </button>
          ))}
        </div>

        {/* Image mode */}
        {mode === 'image' && (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className="rounded-xl border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center overflow-hidden"
            style={{
              minHeight: preview ? 'auto' : '180px',
              borderColor: dragging ? '#2E7D32' : 'var(--color-border)',
              background: dragging ? '#E8F5E9' : 'var(--color-bg)',
            }}
          >
            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={preview} alt="업로드된 사료 이미지" className="w-full max-h-48 object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                <Upload size={32} style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  사진을 드래그하거나 탭하여 업로드
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  JPG, PNG, WEBP 지원 · 최대 5MB
                </p>
              </div>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) applyFile(f); }}
        />

        {/* Text mode */}
        {mode === 'text' && (
          <textarea
            value={ingredientsText}
            onChange={(e) => { setIngredientsText(e.target.value); setAnalysis(null); }}
            placeholder="성분표 텍스트를 붙여넣으세요&#10;예) 원재료: 닭고기, 현미, 귀리...&#10;영양성분: 조단백질 28%, 조지방 14%..."
            rows={6}
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none transition-colors"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        )}

        {error && (
          <p className="text-sm" style={{ color: '#E53935' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: '#2E7D32' }}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" />AI 분석 중...</>
          ) : (
            '분석하기 →'
          )}
        </button>

        {/* ── Analysis Result ── */}
        {analysis && <AnalysisDisplay result={analysis} />}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          <span>분석 결과는 AI 추정값이며, 건강 문제가 있는 반려동물은 수의사 상담을 권장합니다.</span>
        </div>
      </form>
    </div>
  );
}

function AnalysisDisplay({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-4">
      {/* 1. 종합 평점 */}
      <div
        className="rounded-xl border p-4 space-y-2"
        style={{ background: '#E8F5E9', borderColor: '#A5D6A7' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#2E7D32' }}>
          종합 평가
        </p>
        <p className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
          {result.productName}
        </p>
        <ScoreStars score={result.overallScore} />
      </div>

      {/* 2. 요약 */}
      <div
        className="rounded-xl border p-4 space-y-3"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          요약
        </p>
        {result.summary.strengths.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium" style={{ color: '#2E7D32' }}>✅ 강점</p>
            {result.summary.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle2 size={13} style={{ color: '#81C784', marginTop: 2, flexShrink: 0 }} />
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{s}</p>
              </div>
            ))}
          </div>
        )}
        {result.summary.warnings.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium" style={{ color: '#E65100' }}>⚠️ 주의사항</p>
            {result.summary.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <XCircle size={13} style={{ color: '#FFB74D', marginTop: 2, flexShrink: 0 }} />
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{w}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. 영양성분 분석 */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="px-4 py-3 border-b" style={{ background: '#2E7D32', borderColor: '#1B5E20' }}>
          <p className="text-xs font-semibold text-white uppercase tracking-wide">영양성분 상세 분석</p>
        </div>
        <div style={{ background: 'var(--color-bg)' }}>
          {result.nutrients.map((n, i) => {
            const st = statusStyle[n.status] || statusStyle['정보없음'];
            return (
              <div
                key={i}
                className="px-4 py-3 border-b last:border-0 grid grid-cols-[1fr_auto] gap-2 items-start"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {n.name}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {st.label}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    권장: {n.recommended}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {n.detail}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {n.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 유해 성분 경고 */}
      {result.harmfulIngredients.length > 0 ? (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: '#FFCCBC' }}
        >
          <div className="px-4 py-3 border-b flex items-center gap-1.5" style={{ background: '#E65100', borderColor: '#BF360C' }}>
            <ShieldAlert size={14} color="#FFE0B2" />
            <p className="text-xs font-semibold text-white uppercase tracking-wide">유해 성분 경고</p>
          </div>
          <div style={{ background: '#FBE9E7' }}>
            {result.harmfulIngredients.map((h, i) => {
              const lv = harmfulLevelStyle[h.level] || harmfulLevelStyle['낮음'];
              return (
                <div key={i} className="px-4 py-3 border-b last:border-0" style={{ borderColor: '#FFCCBC' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: lv.dot }}
                    />
                    <span className="text-sm font-semibold" style={{ color: lv.text }}>
                      {h.name}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: lv.bg, color: lv.text }}
                    >
                      위험도 {h.level}
                    </span>
                  </div>
                  <p className="text-xs ml-4" style={{ color: '#BF360C' }}>{h.reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl border p-3 flex items-center gap-2"
          style={{ background: '#E8F5E9', borderColor: '#A5D6A7' }}
        >
          <CheckCircle2 size={16} style={{ color: '#2E7D32' }} />
          <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>
            검출된 유해 성분이 없습니다.
          </p>
        </div>
      )}

      {/* 5. 적합성 평가 */}
      <div
        className="rounded-xl border p-4 space-y-2"
        style={{
          background: result.suitability.suitable ? '#E8F5E9' : '#FBE9E7',
          borderColor: result.suitability.suitable ? '#A5D6A7' : '#FFCCBC',
        }}
      >
        <div className="flex items-center gap-2">
          {result.suitability.suitable
            ? <CheckCircle2 size={16} style={{ color: '#2E7D32' }} />
            : <XCircle size={16} style={{ color: '#E53935' }} />
          }
          <p
            className="text-sm font-semibold"
            style={{ color: result.suitability.suitable ? '#2E7D32' : '#B71C1C' }}
          >
            {result.suitability.suitable ? '이 반려동물에게 적합한 사료입니다.' : '이 반려동물에게 적합하지 않을 수 있습니다.'}
          </p>
        </div>
        <p className="text-xs" style={{ color: result.suitability.suitable ? '#388E3C' : '#C62828' }}>
          {result.suitability.reason}
        </p>
        {result.suitability.feedingGuide && (
          <div
            className="mt-2 rounded-lg px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.6)' }}
          >
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
              급여 가이드
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {result.suitability.feedingGuide}
            </p>
          </div>
        )}
      </div>

      {/* 6. 종합 의견 */}
      <div
        className="rounded-xl border p-4"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
          수의 전문가 종합 의견
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {result.overallComment}
        </p>
      </div>
    </div>
  );
}
