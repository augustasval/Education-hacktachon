'use client';

import { useState } from 'react';
import { PracticeProblem } from '@/lib/anthropic';

interface PracticeProblemsProps {
  problems: PracticeProblem[];
  onGetHint: (problemId: string, problem: string) => void;
  onGetSolution: (problemId: string, problem: string) => void;
  isLoading?: boolean;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
};

const difficultyIcons = {
  easy: '🟢',
  medium: '🟡', 
  hard: '🔴',
};

export default function PracticeProblems({
  problems,
  onGetHint,
  onGetSolution,
  isLoading = false
}: PracticeProblemsProps) {
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set());
  const [loadingHints, setLoadingHints] = useState<Set<string>>(new Set());
  const [loadingSolutions, setLoadingSolutions] = useState<Set<string>>(new Set());

  const handleGetHint = async (problemId: string, problem: string) => {
    setLoadingHints(prev => new Set(prev).add(problemId));
    try {
      await onGetHint(problemId, problem);
      setExpandedHints(prev => new Set(prev).add(problemId));
    } finally {
      setLoadingHints(prev => {
        const newSet = new Set(prev);
        newSet.delete(problemId);
        return newSet;
      });
    }
  };

  const handleGetSolution = async (problemId: string, problem: string) => {
    setLoadingSolutions(prev => new Set(prev).add(problemId));
    try {
      await onGetSolution(problemId, problem);
      setExpandedSolutions(prev => new Set(prev).add(problemId));
    } finally {
      setLoadingSolutions(prev => {
        const newSet = new Set(prev);
        newSet.delete(problemId);
        return newSet;
      });
    }
  };

  if (problems.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice Problems Yet</h3>
        <p className="text-gray-600">Click "Generate Practice Problems" to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Practice Problems</h3>
        <div className="text-sm text-gray-500">
          {problems.length} problem{problems.length !== 1 ? 's' : ''} generated
        </div>
      </div>

      {problems.map((problem) => (
        <div
          key={problem.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          {/* Problem Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">{difficultyIcons[problem.difficulty]}</span>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyColors[problem.difficulty]}`}>
                  {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                </span>
              </div>
            </div>
            <span className="text-sm text-gray-500">Problem #{problem.id}</span>
          </div>

          {/* Problem Statement */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Problem:</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">{problem.problem}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => handleGetHint(problem.id, problem.problem)}
              disabled={loadingHints.has(problem.id) || !!problem.hint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingHints.has(problem.id) ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
              {problem.hint ? 'Hint Available' : 'Get Hint'}
            </button>

            <button
              onClick={() => handleGetSolution(problem.id, problem.problem)}
              disabled={loadingSolutions.has(problem.id) || !!problem.solution}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingSolutions.has(problem.id) ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {problem.solution ? 'Solution Available' : 'Show Solution'}
            </button>
          </div>

          {/* Hint Section */}
          {problem.hint && (
            <div className="mb-4">
              <button
                onClick={() => {
                  const newSet = new Set(expandedHints);
                  if (newSet.has(problem.id)) {
                    newSet.delete(problem.id);
                  } else {
                    newSet.add(problem.id);
                  }
                  setExpandedHints(newSet);
                }}
                className="flex items-center gap-2 text-blue-700 font-medium mb-2 hover:text-blue-800"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${expandedHints.has(problem.id) ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Hint
              </button>
              {expandedHints.has(problem.id) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{problem.hint}</p>
                </div>
              )}
            </div>
          )}

          {/* Solution Section */}
          {problem.solution && (
            <div>
              <button
                onClick={() => {
                  const newSet = new Set(expandedSolutions);
                  if (newSet.has(problem.id)) {
                    newSet.delete(problem.id);
                  } else {
                    newSet.add(problem.id);
                  }
                  setExpandedSolutions(newSet);
                }}
                className="flex items-center gap-2 text-green-700 font-medium mb-2 hover:text-green-800"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${expandedSolutions.has(problem.id) ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Solution
              </button>
              {expandedSolutions.has(problem.id) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 whitespace-pre-wrap">{problem.solution}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
