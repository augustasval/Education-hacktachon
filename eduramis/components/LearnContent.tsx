'use client';

import { useState } from 'react';
import { type LearnContent as LearnContentType, type LearnExample, type SolutionStep } from '@/lib/anthropic';

interface LearnContentProps {
  content: LearnContentType | null;
  onAskQuestion: (question: string, context: string) => void;
  isLoading?: boolean;
}

interface LearnQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: string) => void;
  context: string;
  contextType: 'theory' | 'step';
}

function LearnQuestionModal({ isOpen, onClose, onSubmit, context, contextType }: LearnQuestionModalProps) {
  const [question, setQuestion] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question.trim());
      setQuestion('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Ask a Question About {contextType === 'theory' ? 'Theory' : 'This Step'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Context Preview */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium mb-2">Context:</p>
            <p className="text-sm text-gray-800">{context.substring(0, 200)}...</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to know about this content?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ask Question
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LearnContent({ content, onAskQuestion, isLoading }: LearnContentProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [questionModal, setQuestionModal] = useState<{
    isOpen: boolean;
    context: string;
    contextType: 'theory' | 'step';
  }>({
    isOpen: false,
    context: '',
    contextType: 'theory'
  });

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const openQuestionModal = (context: string, contextType: 'theory' | 'step') => {
    setQuestionModal({
      isOpen: true,
      context,
      contextType
    });
  };

  const closeQuestionModal = () => {
    setQuestionModal({
      isOpen: false,
      context: '',
      contextType: 'theory'
    });
  };

  const handleQuestionSubmit = (question: string) => {
    onAskQuestion(question, questionModal.context);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading learning content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Learn Mode</h3>
        <p className="text-gray-600">
          No learning content available. Please select a grade and topic to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Theory Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Theory & Concepts
            </h2>
            <button
              onClick={() => openQuestionModal(content.theory, 'theory')}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ask Question
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="prose prose-blue max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {content.theory}
            </div>
          </div>
        </div>
      </div>

      {/* Examples Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Worked Examples
        </h2>
        
        {content.examples.map((example: LearnExample, index: number) => (
          <div key={example.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Example {index + 1}: {example.title}
              </h3>
            </div>
            
            {/* Problem Statement */}
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Problem:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 font-medium">{example.problem}</p>
              </div>
            </div>

            {/* Solution Steps */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Solution:</h4>
              <div className="space-y-3">
                {example.solution.map((step: SolutionStep) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-medium rounded-full">
                            {step.step}
                          </span>
                          <span className="font-medium text-gray-900">{step.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openQuestionModal(`Step ${step.step}: ${step.description}\n\nExplanation: ${step.explanation}`, 'step')}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Ask
                          </button>
                          <button
                            onClick={() => toggleStep(step.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <svg 
                              className={`w-4 h-4 transform transition-transform ${expandedSteps.has(step.id) ? 'rotate-180' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {expandedSteps.has(step.id) && (
                      <div className="p-4 bg-white">
                        <p className="text-gray-700 leading-relaxed">{step.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Question Modal */}
      <LearnQuestionModal
        isOpen={questionModal.isOpen}
        onClose={closeQuestionModal}
        onSubmit={handleQuestionSubmit}
        context={questionModal.context}
        contextType={questionModal.contextType}
      />
    </div>
  );
}
