'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, Search, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [resultsExpanded, setResultsExpanded] = useState(false);

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
    setResultsExpanded(false);
  };

  const handleShowResults = () => {
    setShowResults(true);
    setResultsExpanded(true);
  };

  const handleAIConsult = () => {
    setIsModalOpen(true);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setResultsExpanded(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="p-1.5 -ml-1.5 sm:p-2 sm:-ml-2 text-gray-600 hover:text-orange-500 transition-colors">
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">증상 체크리스트</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          <div className="space-y-4 sm:space-y-6">
            {!animalType ? (
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">반려동물 종류를 선택하세요</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => handleAnimalSelect('dog')}
                    className="p-4 sm:p-6 rounded-2xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all flex flex-col items-center gap-2 sm:gap-3"
                  >
                    <span className="text-4xl sm:text-5xl">🐕</span>
                    <span className="font-bold text-gray-700 text-sm sm:text-base">강아지</span>
                  </button>
                  <button
                    onClick={() => handleAnimalSelect('cat')}
                    className="p-4 sm:p-6 rounded-2xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all flex flex-col items-center gap-2 sm:gap-3"
                  >
                    <span className="text-4xl sm:text-5xl">🐈</span>
                    <span className="font-bold text-gray-700 text-sm sm:text-base">고양이</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">{animalType === 'dog' ? '🐕' : '🐈'}</span>
                    <div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">
                        {animalType === 'dog' ? '강아지' : '고양이'}
                      </div>
                      <button
                        onClick={() => setAnimalType(null)}
                        className="text-xs sm:text-sm text-orange-500 hover:text-orange-600"
                      >
                        종류 변경
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <span>{selectedSymptoms.length}개 증상</span>
                    {selectedSymptoms.length > 0 && (
                      <button
                        onClick={() => setSelectedSymptoms([])}
                        className="text-orange-500 hover:text-orange-600 font-medium"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100">
                  <div className="relative mb-3 sm:mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="증상을 직접 입력하세요..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  <FrequentSymptoms
                    symptoms={frequentSymptoms}
                    selectedSymptoms={selectedSymptoms}
                    onToggle={handleToggleSymptom}
                  />

                  <div className="mt-4 sm:mt-6">
                    <SymptomCategory
                      symptoms={filteredSymptoms}
                      selectedSymptoms={selectedSymptoms}
                      onToggle={handleToggleSymptom}
                      activeCategory={activeCategory}
                      onCategoryChange={setActiveCategory}
                    />
                  </div>

                  {selectedSymptoms.length > 0 && (
                    <button
                      onClick={handleShowResults}
                      className="w-full mt-4 sm:mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-colors text-sm sm:text-base"
                    >
                      진단 결과 보기
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 sticky top-24">
              {showResults ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">진단 결과</h2>
                    <button
                      onClick={handleCloseResults}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <DiagnosisResult
                    results={diagnosisResults}
                    onAIConsult={handleAIConsult}
                  />
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">증상을 선택하면 진단 결과를 볼 수 있습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed inset-x-0 bottom-0 z-30">
          {selectedSymptoms.length > 0 && (
            <div className="bg-white border-t border-gray-200 rounded-t-2xl shadow-lg">
              <button
                onClick={() => setResultsExpanded(!resultsExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm sm:text-base">
                    {showResults ? '진단 결과' : '진단 결과 보기'}
                  </span>
                  {diagnosisResults.length > 0 && (
                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium">
                      {diagnosisResults.length}건
                    </span>
                  )}
                </div>
                {showResults ? (
                  <ChevronDown size={20} className="text-gray-400" />
                ) : (
                  <ChevronUp size={20} className="text-gray-400" />
                )}
              </button>

              {resultsExpanded && (
                <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
                  <DiagnosisResult
                    results={diagnosisResults}
                    onAIConsult={handleAIConsult}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {!showResults && !selectedSymptoms.length && (
          <div className="lg:hidden fixed bottom-20 left-0 right-0 px-4 z-20">
            <div className="bg-white rounded-full px-4 py-2 text-center text-sm text-gray-500 shadow-md">
              증상을 선택해주세요
            </div>
          </div>
        )}
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
