'use client';

import { Symptom } from '../lib/symptoms-data';

interface FrequentSymptomsProps {
  symptoms: Symptom[];
  selectedSymptoms: string[];
  onToggle: (id: string) => void;
}

export default function FrequentSymptoms({ symptoms, selectedSymptoms, onToggle }: FrequentSymptomsProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">자주 묻는 증상</h3>
      <div className="flex flex-wrap gap-2">
        {symptoms.map((symptom) => {
          const isSelected = selectedSymptoms.includes(symptom.id);
          return (
            <button
              key={symptom.id}
              onClick={() => onToggle(symptom.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              {symptom.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
