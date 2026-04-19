'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import Link from 'next/link';
import SymptomCategory from './components/SymptomCategory';
import FrequentSymptoms from './components/FrequentSymptoms';
import DiagnosisResult from './components/DiagnosisResult';
import AIConsultModal from './components/AIConsultModal';
import {
  diagnose,
  getSymptomsByAnimal,
  getFrequentSymptoms,
  Category,
} from './lib/symptoms-data';

export default function SymptomCheckerPage() {
  const [animalType, setAnimalType] = useState<'dog' | 'cat' | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('digestive');
  const [customInput, setCustomInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSymptoms = useMemo(() => {
    if (!animalType) return [];
    return getSymptomsByAnimal(animalType);
  }, [animalType]);

  const frequentSymptoms = useMemo(() => {
    if (!animalType) return [];
    return getFrequentSymptoms(animalType);
  }, [animalType]);

  const diagnosisResults = useMemo(() => {
    return diagnose(selectedSymptoms);
  }, [selectedSymptoms]);

  const handleToggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAnimalSelect = (type: 'dog' | 'cat') => {
    setAnimalType(type);
    setSelectedSymptoms([]);
    setShowResults(false);
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  const handleAIConsult = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 text-gray-600 hover:text-orange-500 transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">증상 체크리스트</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {!animalType ? (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">반려동물 종류를 선택하세요</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnimalSelect('dog')}
                    className="p-6 rounded-2xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all flex flex-col items-center gap-3"
                  >
                    <span className="text-5xl">🐕</span>
                    <span className="font-bold text-gray-700">강아지</span>
                  </button>
                  <button
                    onClick={() => handleAnimalSelect('cat')}
                    className="p-6 rounded-2xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all flex flex-col items-center gap-3"
                  >
                    <span className="text-5xl">🐈</span>
                    <span className="font-bold text-gray-700">고양이</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{animalType === 'dog' ? '🐕' : '🐈'}</span>
                    <div>
                      <div className="font-bold text-gray-900">
                        {animalType === 'dog' ? '강아지' : '고양이'}
                      </div>
                      <button
                        onClick={() => setAnimalType(null)}
                        className="text-sm text-orange-500 hover:text-orange-600"
                      >
                        종류 변경
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{selectedSymptoms.length}개 증상 선택</span>
                    {selectedSymptoms.length > 0 && (
                      <button
                        onClick={() => setSelectedSymptoms([])}
                        className="text-sm text-orange-500 hover:text-orange-600"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="증상을 직접 입력하세요..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>

                  <FrequentSymptoms
                    symptoms={frequentSymptoms}
                    selectedSymptoms={selectedSymptoms}
                    onToggle={handleToggleSymptom}
                  />

                  <SymptomCategory
                    symptoms={filteredSymptoms}
                    selectedSymptoms={selectedSymptoms}
                    onToggle={handleToggleSymptom}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />

                  {selectedSymptoms.length > 0 && (
                    <button
                      onClick={handleShowResults}
                      className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold transition-colors"
                    >
                      진단 결과 보기
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 sticky top-24">
              <DiagnosisResult
                results={showResults ? diagnosisResults : []}
                onAIConsult={handleAIConsult}
              />
            </div>
          </div>
        </div>
      </main>

      <AIConsultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedSymptomIds={selectedSymptoms}
        animalType={animalType || 'dog'}
      />
    </div>
  );
}
