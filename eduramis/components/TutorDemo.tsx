'use client';

import { useState, useCallback } from 'react';
import { tutorAPI } from '@/lib/tutor-client';
import { TutorRequest } from '@/lib/anthropic';

export default function TutorDemo() {
  const [grade, setGrade] = useState('8th grade');
  const [topic, setTopic] = useState('Algebra');
  const [question, setQuestion] = useState('How do I solve 2x + 5 = 15?');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (useStreaming: boolean = false) => {
    if (!grade.trim() || !topic.trim() || !question.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse('');
    setIsStreaming(useStreaming);

    const request: TutorRequest = {
      grade: grade.trim(),
      topic: topic.trim(),
      question: question.trim(),
    };

    try {
      if (useStreaming) {
        await tutorAPI.askQuestionStream(
          request,
          (content) => {
            setResponse((prev) => prev + content);
          },
          (errorMsg) => {
            setError(errorMsg);
            setIsLoading(false);
          },
          () => {
            setIsLoading(false);
          }
        );
      } else {
        const result = await tutorAPI.askQuestion(request);
        setResponse(result.answer);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  }, [grade, topic, question]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Math Tutor</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
              Grade Level
            </label>
            <input
              id="grade"
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g., 8th grade, High School, College"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Math Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Algebra, Geometry, Calculus"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Your Question
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your math question here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && !isStreaming ? 'Getting Answer...' : 'Get Answer'}
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && isStreaming ? 'Streaming...' : 'Stream Answer'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {response && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Tutor Response:</h3>
            <div className="text-gray-800 whitespace-pre-wrap">{response}</div>
            {isLoading && isStreaming && (
              <div className="mt-2 text-blue-600 text-sm">Streaming response...</div>
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Enter the student's grade level (e.g., "8th grade", "High School")</li>
          <li>• Specify the math topic (e.g., "Algebra", "Geometry")</li>
          <li>• Ask your math question in detail</li>
          <li>• Choose "Get Answer" for a complete response or "Stream Answer" for real-time streaming</li>
        </ul>
      </div>
    </div>
  );
}
