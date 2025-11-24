'use client';

import { useState } from 'react';
import { Grade, useMathTutorStore } from '@/lib/store';

const grades: Grade[] = [
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade',
  '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade',
  'College', 'Graduate'
];

const gradeCategories = [
  { label: 'Elementary', grades: grades.slice(0, 5) },
  { label: 'Middle School', grades: grades.slice(5, 8) },
  { label: 'High School', grades: grades.slice(8, 12) },
  { label: 'Higher Education', grades: grades.slice(12) },
];

interface GradeSelectorProps {
  className?: string;
  compact?: boolean;
}

export default function GradeSelector({ className = '', compact = false }: GradeSelectorProps) {
  const { selectedGrade, setGrade } = useMathTutorStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleGradeSelect = (grade: Grade) => {
    setGrade(grade);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
        >
          <span className={selectedGrade ? 'text-gray-900' : 'text-gray-500'}>
            {selectedGrade || 'Select Grade Level'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {gradeCategories.map((category) => (
              <div key={category.label} className="p-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 px-2">
                  {category.label}
                </div>
                {category.grades.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => handleGradeSelect(grade)}
                    className={`w-full px-2 py-1 text-left text-sm rounded hover:bg-gray-100 ${
                      selectedGrade === grade ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Your Grade Level</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose your current grade level to get age-appropriate math help.
        </p>
      </div>

      <div className="space-y-6">
        {gradeCategories.map((category) => (
          <div key={category.label}>
            <h4 className="text-sm font-medium text-gray-700 mb-3">{category.label}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {category.grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelect(grade)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                    selectedGrade === grade
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedGrade && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              Selected: {selectedGrade}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
