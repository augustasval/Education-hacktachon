'use client';

import { useState } from 'react';
import { MathTopic, useMathTutorStore } from '@/lib/store';

interface TopicSelectorProps {
  className?: string;
  compact?: boolean;
}

export default function TopicSelector({ className = '', compact = false }: TopicSelectorProps) {
  const { selectedGrade, selectedTopic, setTopic, getAvailableTopics } = useMathTutorStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const availableTopics = getAvailableTopics();

  const handleTopicSelect = (topic: MathTopic) => {
    setTopic(topic);
    setIsOpen(false);
  };

  if (!selectedGrade) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-600 text-sm">Please select a grade level first to see available math topics.</p>
        </div>
      </div>
    );
  }

  if (availableTopics.length === 0) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="text-center">
          <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-yellow-700 text-sm">No topics available for the selected grade level.</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
        >
          <span className={selectedTopic ? 'text-gray-900' : 'text-gray-500'}>
            {selectedTopic?.name || 'Select Math Topic'}
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
            {availableTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 ${
                  selectedTopic?.id === topic.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="font-medium">{topic.name}</div>
                <div className="text-xs text-gray-500 mt-1">{topic.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose a Math Topic for {selectedGrade}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the math topic you'd like help with. Topics are tailored to your grade level.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {availableTopics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleTopicSelect(topic)}
            className={`p-4 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              selectedTopic?.id === topic.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`font-semibold mb-2 ${
              selectedTopic?.id === topic.id ? 'text-blue-700' : 'text-gray-900'
            }`}>
              {topic.name}
            </div>
            <div className={`text-sm ${
              selectedTopic?.id === topic.id ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {topic.description}
            </div>
            <div className="flex items-center mt-3">
              <div className={`text-xs px-2 py-1 rounded-full ${
                selectedTopic?.id === topic.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                Grades: {topic.grades.join(', ')}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedTopic && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-sm font-medium text-green-800 mb-1">
                Selected Topic: {selectedTopic.name}
              </div>
              <div className="text-sm text-green-700">
                {selectedTopic.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
