'use client';

import { useState } from 'react';
import { type LearnContent, type LearnExample, type SolutionStep, type QuizQuestion } from '@/lib/anthropic';

interface LearnContentProps {
  content: LearnContent | null;
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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium mb-2">Context:</p>
            <p className="text-sm text-gray-800">{context.substring(0, 200)}...</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">Your Question</label>
              <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What would you like to know about this content?" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} required />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Ask Question</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LearnContent({ content, onAskQuestion, isLoading }: LearnContentProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [questionModal, setQuestionModal] = useState<{ isOpen: boolean; context: string; contextType: 'theory' | 'step'; }>({ isOpen: false, context: '', contextType: 'theory' });

  const getTheorySections = (): string[] => {
    if (!content) return [];
    const theoryText = content.theory;
    // Split by section headers (lines ending with colon that start a new concept)
    const lines = theoryText.split('\n\n');
    const sections: string[] = [];
    const numExamples = content.examples.length || 1;
    const linesPerSection = Math.ceil(lines.length / numExamples);
    
    for (let i = 0; i < numExamples; i++) {
      const startIdx = i * linesPerSection;
      const endIdx = Math.min(startIdx + linesPerSection, lines.length);
      const sectionLines = lines.slice(startIdx, endIdx);
      sections.push(sectionLines.join('\n\n'));
    }
    return sections;
  };

  const theorySections = getTheorySections();
  // Number of learning sections equals number of examples (each section has theory + example)
  const numLearningSections = content?.examples.length || 0;
  const hasQuiz = content?.quiz && content.quiz.length > 0;
  const quizLength = hasQuiz ? (content?.quiz?.length || 0) : 0;
  const totalSections = numLearningSections + quizLength + (hasQuiz ? 1 : 0);
  const isInQuizMode = currentSectionIndex >= numLearningSections;
  const currentQuizIndex = currentSectionIndex - numLearningSections;
  const isQuizResults = isInQuizMode && currentQuizIndex >= quizLength;

  const openQuestionModal = (context: string, contextType: 'theory' | 'step') => { setQuestionModal({ isOpen: true, context, contextType }); };
  const closeQuestionModal = () => { setQuestionModal({ isOpen: false, context: '', contextType: 'theory' }); };
  const handleQuestionSubmit = (question: string) => { onAskQuestion(question, questionModal.context); };
  const handleNext = () => { if (currentSectionIndex < totalSections - 1) { setCurrentSectionIndex(currentSectionIndex + 1); } };
  const handlePrevious = () => { if (currentSectionIndex > 0) { if (isQuizResults) { setShowQuizResults(false); } setCurrentSectionIndex(currentSectionIndex - 1); } };
  const handleQuizAnswer = (answerIndex: number) => { setQuizAnswers(prev => ({ ...prev, [currentQuizIndex]: answerIndex })); };
  const handleSubmitQuiz = () => { setShowQuizResults(true); handleNext(); };
  const getQuizScore = () => { if (!content?.quiz) return { correct: 0, total: 0 }; let correct = 0; content.quiz.forEach((q, idx) => { if (quizAnswers[idx] === q.correctAnswer) correct++; }); return { correct, total: content.quiz.length }; };
  const getSectionTitle = () => { if (isQuizResults) return 'Quiz Results'; if (isInQuizMode) return `Quiz - Question ${currentQuizIndex + 1}`; return `Section ${currentSectionIndex + 1}: Theory & Example`; };

  if (isLoading) {
    return (<div className="flex items-center justify-center py-12"><div className="text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-600">Loading learning content...</p></div></div>);
  }

  if (!content) {
    return (<div className="text-center py-12"><div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div><h3 className="text-xl font-semibold text-gray-900 mb-2">Learn Mode</h3><p className="text-gray-600">No learning content available. Please select a grade and topic to get started.</p></div>);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{getSectionTitle()}</span>
          <span className="text-sm text-gray-500">Section {currentSectionIndex + 1} of {totalSections}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentSectionIndex + 1) / totalSections) * 100}%` }} />
        </div>
      </div>
      {!isInQuizMode && currentSectionIndex < numLearningSections && (<div className="space-y-6"><div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"><div className="bg-blue-50 px-6 py-4 border-b border-gray-200"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>Theory & Concepts</h2><button onClick={() => openQuestionModal(theorySections[currentSectionIndex], 'theory')} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Ask Question</button></div></div><div className="p-6"><div className="prose prose-blue max-w-none"><div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{theorySections[currentSectionIndex]}</div></div></div></div>{content.examples[currentSectionIndex] && (<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"><div className="bg-green-50 px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-900">Example: {content.examples[currentSectionIndex].title}</h3></div><div className="p-6"><div className="mb-4"><h4 className="text-sm font-medium text-gray-700 mb-3">Problem:</h4><div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500"><p className="text-gray-900 font-semibold text-lg">{content.examples[currentSectionIndex].problem}</p></div></div><div><h4 className="text-sm font-medium text-gray-700 mb-3">Solution Steps:</h4><div className="bg-gray-50 p-4 rounded-lg"><div className="text-gray-800 leading-relaxed whitespace-pre-line">{content.examples[currentSectionIndex].explanation}</div></div></div></div></div>)}</div>)}
      {isInQuizMode && !isQuizResults && content.quiz && content.quiz[currentQuizIndex] && (<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"><div className="bg-purple-50 px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-900">Question {currentQuizIndex + 1} of {quizLength}</h3></div><div className="p-6"><p className="text-gray-800 font-medium text-lg mb-6">{content.quiz[currentQuizIndex].question}</p><div className="space-y-3">{content.quiz[currentQuizIndex].options.map((option, index) => { const isSelected = quizAnswers[currentQuizIndex] === index; return (<button key={index} onClick={() => handleQuizAnswer(index)} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}><div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>{isSelected && (<div className="w-2 h-2 rounded-full bg-white"></div>)}</div><span className="text-gray-800">{option}</span></div></button>); })}</div></div></div>)}
      {isQuizResults && content.quiz && (<div className="space-y-6"><div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div className="text-center mb-6"><div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2><p className="text-lg text-gray-600">You scored {getQuizScore().correct} out of {getQuizScore().total}</p><div className="mt-4"><div className="text-3xl font-bold text-purple-600">{Math.round((getQuizScore().correct / getQuizScore().total) * 100)}%</div></div></div></div><div className="space-y-4"><h3 className="text-lg font-semibold text-gray-900">Review Your Answers</h3>{content.quiz.map((question, qIdx) => { const userAnswer = quizAnswers[qIdx]; const isCorrect = userAnswer === question.correctAnswer; return (<div key={qIdx} className={`bg-white rounded-lg shadow-sm border-2 p-6 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}><div className="flex items-start gap-3 mb-4">{isCorrect ? (<svg className="w-6 h-6 text-green-600 shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>) : (<svg className="w-6 h-6 text-red-600 shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>)}<div className="flex-1"><p className="font-medium text-gray-900 mb-2">Question {qIdx + 1}: {question.question}</p><div className="space-y-2 mb-3"><p className="text-sm"><span className="font-medium text-gray-700">Your answer: </span><span className={userAnswer !== undefined ? (isCorrect ? 'text-green-700' : 'text-red-700') : 'text-gray-500'}>{userAnswer !== undefined ? question.options[userAnswer] : 'Not answered'}</span></p>{!isCorrect && (<p className="text-sm"><span className="font-medium text-gray-700">Correct answer: </span><span className="text-green-700">{question.options[question.correctAnswer]}</span></p>)}</div><div className="bg-blue-50 p-3 rounded-lg"><p className="text-sm text-gray-700">{question.explanation}</p></div></div></div></div>); })}</div></div>)}
      <div className="flex justify-between items-center">
        <button onClick={handlePrevious} disabled={currentSectionIndex === 0} className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${currentSectionIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Previous</button>
        {isInQuizMode && !isQuizResults && currentQuizIndex === quizLength - 1 ? (<button onClick={handleSubmitQuiz} disabled={quizAnswers[currentQuizIndex] === undefined} className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${quizAnswers[currentQuizIndex] === undefined ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>Submit Quiz<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>) : (<button onClick={handleNext} disabled={currentSectionIndex >= totalSections - 1 || (isInQuizMode && !isQuizResults && quizAnswers[currentQuizIndex] === undefined)} className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${currentSectionIndex >= totalSections - 1 || (isInQuizMode && !isQuizResults && quizAnswers[currentQuizIndex] === undefined) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>Next<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>)}
      </div>
      <LearnQuestionModal isOpen={questionModal.isOpen} onClose={closeQuestionModal} onSubmit={handleQuestionSubmit} context={questionModal.context} contextType={questionModal.contextType} />
    </div>
  );
}
