'use client';

import { Disease, Urgency } from '../lib/symptoms-data';

interface DiagnosisResultProps {
  results: { disease: Disease; matchCount: number; probability: number }[];
  onAIConsult: () => void;
}

const urgencyConfig: Record<Urgency, { label: string; color: string; bgColor: string; borderColor: string; emoji: string }> = {
  critical: {
    label: '즉시 동물병원 방문 권장',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    emoji: '🔴',
  },
  moderate: {
    label: '주의 필요, 관찰 후 수의사 상담',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    emoji: '🟡',
  },
  mild: {
    label: 'Home care 가능, 증상 지속 시 상담',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    emoji: '🟢',
  },
};

export default function DiagnosisResult({ results, onAIConsult }: DiagnosisResultProps) {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">증상을 선택해주세요</h3>
        <p className="text-gray-500 text-sm">
          위에서 증상을 선택하면 가능한 질병과 응급도를 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">진단 결과</h3>
        <span className="text-sm text-gray-500">{results.length}개 가능성</span>
      </div>

      {results.map(({ disease, probability }) => {
        const config = urgencyConfig[disease.urgency];
        return (
          <div
            key={disease.id}
            className={`rounded-2xl p-5 border-2 ${config.bgColor} ${config.borderColor}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{config.emoji}</span>
                <div>
                  <h4 className="font-bold text-gray-900">{disease.name}</h4>
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-500">{probability}%</div>
                <div className="text-xs text-gray-500">일치율</div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3">{disease.description}</p>

            <div className={`p-3 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">권장 조치</div>
                  <div className="text-sm text-gray-600">{disease.recommendation}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={onAIConsult}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
      >
        <span>🤖</span>
        AI 상담하기
      </button>
    </div>
  );
}
