'use client';

import { X, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { symptoms } from '../lib/symptoms-data';

interface AIConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymptomIds: string[];
  animalType: 'dog' | 'cat';
}

export default function AIConsultModal({
  isOpen,
  onClose,
  selectedSymptomIds,
  animalType,
}: AIConsultModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const selectedSymptomNames = selectedSymptomIds
    .map((id) => symptoms.find((s) => s.id === id)?.name)
    .filter(Boolean);

  const handleStartConsult = () => {
    const symptomContext = `반려동물: ${animalType === 'dog' ? '강아지' : '고양이'}\n증상: ${selectedSymptomNames.join(', ')}`;
    const encodedContext = encodeURIComponent(symptomContext);
    onClose();
    router.push(`/pets?context=${encodedContext}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 상담하기</h2>
          <p className="text-gray-600">
            선택한 증상에 대해 전문 수의사 AI가 맞춤 상담을 제공합니다.
          </p>
        </div>

        <div className="bg-orange-50 rounded-2xl p-4 mb-6">
          <div className="text-sm text-gray-500 mb-2">선택한 증상</div>
          <div className="flex flex-wrap gap-2">
            {selectedSymptomNames.map((name, i) => (
              <span
                key={i}
                className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleStartConsult}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>🤖</span>
            AI 상담 시작하기
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-medium transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
