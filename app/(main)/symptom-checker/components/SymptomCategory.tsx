'use client';

import { Category, Symptom, categories } from '../lib/symptoms-data';

interface SymptomCategoryProps {
  symptoms: Symptom[];
  selectedSymptoms: string[];
  onToggle: (id: string) => void;
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export default function SymptomCategory({
  symptoms,
  selectedSymptoms,
  onToggle,
  activeCategory,
  onCategoryChange,
}: SymptomCategoryProps) {
  const filteredSymptoms = symptoms.filter((s) => s.category === activeCategory);

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredSymptoms.map((symptom) => {
          const isSelected = selectedSymptoms.includes(symptom.id);
          return (
            <button
              key={symptom.id}
              onClick={() => onToggle(symptom.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-orange-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm font-medium ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
                  {symptom.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
