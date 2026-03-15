'use client';
import { useState, useRef, DragEvent } from 'react';
import { Camera, Upload, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface PetInfo {
  species: string;
  age: number;
  weight: number;
}

export function FoodAnalyzer({ petInfo }: { petInfo: PetInfo }) {
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const applyFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setAnalysis('');
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) applyFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setAnalysis('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('petInfo', JSON.stringify(petInfo));

    try {
      const res  = await fetch('/api/analyze-food', { method: 'POST', body: formData });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setAnalysis('분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl border space-y-4 overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-4 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Camera size={18} style={{ color: 'var(--color-text-secondary)' }} />
        <h2 className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
          사료 성분 분석
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="rounded-xl border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center overflow-hidden"
          style={{
            minHeight: preview ? 'auto' : '180px',
            borderColor: dragging ? 'var(--color-primary-400)' : 'var(--color-border)',
            background: dragging ? 'var(--color-primary-50)' : 'var(--color-bg)',
          }}
        >
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preview}
              alt="업로드된 사료 이미지"
              className="w-full max-h-48 object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
              <Upload size={32} style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                사진을 드래그하거나 탭하여 업로드
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                JPG, PNG, WEBP 지원
              </p>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) applyFile(f);
          }}
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          style={{ background: 'var(--color-primary-500)' }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              분석 중...
            </>
          ) : (
            <>분석하기 →</>
          )}
        </button>

        {/* Analysis result */}
        {analysis && (
          <div
            className="rounded-xl border p-4 space-y-2"
            style={{ background: 'var(--color-primary-50)', borderColor: 'var(--color-primary-100)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-1"
               style={{ color: 'var(--color-primary-600)' }}>
              분석 결과
            </p>
            <div className="text-sm whitespace-pre-wrap leading-relaxed"
                 style={{ color: 'var(--color-text-primary)' }}>
              {analysis}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div
          className="flex items-start gap-2 text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" aria-hidden />
          <span>분석 결과는 AI 추정값이며 수의사 상담을 권장합니다.</span>
        </div>
      </form>
    </div>
  );
}
