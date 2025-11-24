'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { tutorAPI } from '@/lib/tutor-client';
import { TutorRequest } from '@/lib/anthropic';
import { useMathTutorStore } from '@/lib/store';
import GradeSelector from './GradeSelector';
import TopicSelector from './TopicSelector';
import ToggleSwitch from './ToggleSwitch';
import PracticeProblems from './PracticeProblems';
import LearnContent from './LearnContent';
import LearnContentChunked from './LearnContentChunked';
import { PracticeProblem, type LearnContent as LearnContentType } from '@/lib/anthropic';
import { loadLearnContent, hasLocalContent } from '@/lib/learn-content-loader';
import { loadChunkedLearnContent, hasChunkedLocalContent, type ChunkedContent } from '@/lib/chunked-content-loader';

interface Message {
  id: string;
  role: 'student' | 'tutor';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export default function MathTutorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [practiceProblems, setPracticeProblems] = useState<PracticeProblem[]>([]);
  const [isGeneratingProblems, setIsGeneratingProblems] = useState(false);
  const [learnContent, setLearnContent] = useState<LearnContentType | null>(null);
  const [chunkedContent, setChunkedContent] = useState<ChunkedContent | null>(null);
  const [isGeneratingLearnContent, setIsGeneratingLearnContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'chat' | 'mistakes' | 'plan'>('learn');
  const [language, setLanguage] = useState<'en' | 'lt'>('en');
  
  // Get grade, topic, and step-by-step mode from Zustand store
  const { selectedGrade, selectedTopic, stepByStepMode, setStepByStepMode} = useMathTutorStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;
    if (!selectedGrade || !selectedTopic) {
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'student',
      content: inputMessage.trim(),
      timestamp: Date.now(),
    };

    const tutorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'tutor',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, tutorMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    const request: TutorRequest = {
      grade: selectedGrade,
      topic: selectedTopic.name,
      question: currentInput,
      mode: stepByStepMode ? 'step-by-step' : 'regular',
    };

    try {
      await tutorAPI.askQuestionStream(
        request,
        (content) => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'tutor') {
              lastMessage.content += content;
            }
            return newMessages;
          });
        },
        (error) => {
          console.error('Streaming error:', error);
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'tutor') {
              lastMessage.content = `Sorry, I encountered an error: ${error}`;
              lastMessage.isStreaming = false;
            }
            return newMessages;
          });
          setIsLoading(false);
        },
        () => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'tutor') {
              lastMessage.isStreaming = false;
            }
            return newMessages;
          });
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'tutor') {
          lastMessage.content = `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });
      setIsLoading(false);
    }
  }, [inputMessage, selectedGrade, selectedTopic, stepByStepMode, isLoading]);

  const handleGenerateLearnContent = useCallback(async () => {
    if (!selectedGrade || !selectedTopic || isGeneratingLearnContent) return;

    setIsGeneratingLearnContent(true);
    try {
      // First try to load chunked content for interactive learning
      const chunked = await loadChunkedLearnContent(selectedGrade, selectedTopic.name);
      
      if (chunked) {
        console.log('Using chunked interactive content for', selectedGrade, selectedTopic.name);
        setChunkedContent({[selectedTopic.name.toLowerCase().replace(/\s+/g, '-')]: chunked});
        setLearnContent(null); // Clear regular content when using chunked
        return;
      }

      // Fallback to regular local content
      let content = await loadLearnContent(selectedGrade, selectedTopic.name, language);
      
      // If no local content available, use AI generation
      if (!content) {
        console.log('No local content found, using AI generation...');
        content = await tutorAPI.generateLearnContent(selectedGrade, selectedTopic.name);
      } else {
        console.log('Using regular local content for', selectedGrade, selectedTopic.name, 'in', language);
      }
      
      setLearnContent(content);
      setChunkedContent(null); // Clear chunked content when using regular
    } catch (error) {
      console.error('Error generating learn content:', error);
    } finally {
      setIsGeneratingLearnContent(false);
    }
  }, [selectedGrade, selectedTopic, isGeneratingLearnContent, language]);

  const handleAskLearnQuestion = useCallback(async (question: string, context: string) => {
    if (!selectedGrade || !selectedTopic) return;

    try {
      const answer = await tutorAPI.askLearnQuestion(selectedGrade, selectedTopic.name, question, context);
      
      // Add the question and answer to the chat messages
      const questionMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'student',
        content: `[Learn Question] ${question}`,
        timestamp: Date.now()
      };

      const answerMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'tutor',
        content: answer,
        timestamp: Date.now() + 1
      };

      setMessages(prev => [...prev, questionMessage, answerMessage]);
      
      // Switch to chat tab to show the Q&A
      setActiveTab('chat');
    } catch (error) {
      console.error('Error asking learn question:', error);
    }
  }, [selectedGrade, selectedTopic]);

  const handleGeneratePracticeProblems = useCallback(async () => {
    if (!selectedGrade || !selectedTopic || isGeneratingProblems) return;

    setIsGeneratingProblems(true);
    try {
      const problems = await tutorAPI.generatePracticeProblems(selectedGrade, selectedTopic.name);
      setPracticeProblems(problems);
      setActiveTab('practice');
    } catch (error) {
      console.error('Error generating practice problems:', error);
      // You could add a toast notification here
    } finally {
      setIsGeneratingProblems(false);
    }
  }, [selectedGrade, selectedTopic, isGeneratingProblems]);

  const handleGetHint = useCallback(async (problemId: string, problem: string) => {
    if (!selectedGrade || !selectedTopic) return;

    try {
      const hint = await tutorAPI.getHint(selectedGrade, selectedTopic.name, problem);
      setPracticeProblems(prev => 
        prev.map(p => p.id === problemId ? { ...p, hint } : p)
      );
    } catch (error) {
      console.error('Error getting hint:', error);
    }
  }, [selectedGrade, selectedTopic]);

  const handleGetSolution = useCallback(async (problemId: string, problem: string) => {
    if (!selectedGrade || !selectedTopic) return;

    try {
      const solution = await tutorAPI.getSolution(selectedGrade, selectedTopic.name, problem);
      setPracticeProblems(prev => 
        prev.map(p => p.id === problemId ? { ...p, solution } : p)
      );
    } catch (error) {
      console.error('Error getting solution:', error);
    }
  }, [selectedGrade, selectedTopic]);

  // Clear learn content when grade/topic/language changes
  useEffect(() => {
    setLearnContent(null);
    setChunkedContent(null);
  }, [selectedGrade, selectedTopic, language]);

  // Auto-generate learn content when grade/topic/language changes
  useEffect(() => {
    if (selectedGrade && selectedTopic && activeTab === 'learn' && !learnContent && !chunkedContent && !isGeneratingLearnContent) {
      handleGenerateLearnContent();
    }
  }, [selectedGrade, selectedTopic, language, activeTab, learnContent, chunkedContent, isGeneratingLearnContent, handleGenerateLearnContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Simple formatting for math expressions and line breaks
    return content
      .split('\n')
      .map((line, index) => (
        <span key={index}>
          {line}
          {index < content.split('\n').length - 1 && <br />}
        </span>
      ));
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Setup Your Session</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-6">
              <GradeSelector compact />
              <TopicSelector compact />
              <div className="pt-4 border-t border-blue-200">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language / Kalba
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                        language === 'en'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguage('lt')}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                        language === 'lt'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Lietuvių
                    </button>
                  </div>
                </div>
                <ToggleSwitch
                  checked={stepByStepMode}
                  onChange={setStepByStepMode}
                  label="Step-by-step Mode"
                  description="Get detailed, numbered explanations for each step of the solution"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('learn')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'learn'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Learn
                {learnContent && (
                  <span className="bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-0.5">
                    ✓
                  </span>
                )}
                {selectedGrade && selectedTopic && hasLocalContent(selectedGrade, selectedTopic.name) && (
                  <span className="bg-green-100 text-green-600 text-xs rounded-full px-2 py-0.5">
                    📚
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'practice'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Practice
                {practiceProblems.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-0.5">
                    {practiceProblems.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat
                {messages.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-0.5">
                    {Math.ceil(messages.length / 2)}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('mistakes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'mistakes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Mistakes
              </div>
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'plan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Plan
              </div>
            </button>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="py-4 px-3 text-gray-600 hover:text-blue-600 transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {activeTab === 'learn' ? (
            // Learn Content - use chunked if available, otherwise regular
            chunkedContent && selectedTopic ? (
              <LearnContentChunked 
                content={chunkedContent}
                selectedTopic={selectedTopic.name.toLowerCase().replace(/\s+/g, '-')}
              />
            ) : (
              <LearnContent 
                content={learnContent} 
                onAskQuestion={handleAskLearnQuestion}
                isLoading={isGeneratingLearnContent}
              />
            )
          ) : activeTab === 'practice' ? (
            // Practice Problems
            <div>
              {practiceProblems.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Practice Problems</h3>
                  <p className="text-gray-600 mb-6">
                    Generate custom practice problems based on your selected grade and topic.
                  </p>
                  {selectedGrade && selectedTopic ? (
                    <button
                      onClick={handleGeneratePracticeProblems}
                      disabled={isGeneratingProblems}
                      className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingProblems ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating Problems...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Generate Practice Problems
                        </>
                      )}
                    </button>
                  ) : (
                    <p className="text-orange-600 font-medium">
                      Please select a grade level and topic first.
                    </p>
                  )}
                </div>
              )}

              {practiceProblems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedGrade} • {selectedTopic?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Practice problems generated for your learning level
                      </p>
                    </div>
                    <button
                      onClick={handleGeneratePracticeProblems}
                      disabled={isGeneratingProblems}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {isGeneratingProblems ? 'Generating...' : 'Generate New'}
                    </button>
                  </div>

                  <PracticeProblems
                    problems={practiceProblems}
                    onGetHint={handleGetHint}
                    onGetSolution={handleGetSolution}
                  />
                </div>
              )}
            </div>
          ) : activeTab === 'chat' ? (
            // Chat Messages
            <div>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI Math Tutor!</h3>
                  <p className="text-gray-600 mb-4">
                    I'm here to help you learn and understand math concepts step by step.
                  </p>
                  {(!selectedGrade || !selectedTopic) && (
                    <p className="text-blue-600 font-medium">
                      Please set your grade level and topic above to get started.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'student' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'student' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-green-600 text-white'
                        }`}>
                          {message.role === 'student' ? '👤' : '🤖'}
                        </div>
                        
                        {/* Message Content */}
                        <div className={`flex-1 ${message.role === 'student' ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {message.role === 'student' ? 'Student' : 'AI Tutor'}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className={`rounded-lg px-4 py-3 ${
                            message.role === 'student'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}>
                            <div className="text-sm leading-relaxed">
                              {formatMessage(message.content)}
                              {message.isStreaming && (
                                <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          ) : activeTab === 'mistakes' ? (
            // Mistakes Section (Placeholder for now)
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mistakes Analysis</h3>
              <p className="text-gray-600">
                This section will track and analyze your mistakes to help you improve.
              </p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>
          ) : (
            // Plan Section (Placeholder for now)
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Learning Plan</h3>
              <p className="text-gray-600">
                This section will provide personalized learning plans and progress tracking.
              </p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Only show in chat mode */}
      {activeTab === 'chat' && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    !selectedGrade || !selectedTopic
                      ? "Please set your grade and topic first..."
                      : "Ask your math question here... (Press Enter to send, Shift+Enter for new line)"
                  }
                  disabled={isLoading || !selectedGrade || !selectedTopic}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-12 max-h-32 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim() || !selectedGrade || !selectedTopic}
                className="shrink-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={() => setMessages([])}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                🗑️ Clear Chat
              </button>
              
              {/* Step-by-step toggle */}
              <div className="flex items-center gap-2">
                <ToggleSwitch
                  checked={stepByStepMode}
                  onChange={setStepByStepMode}
                  className="shrink-0"
                />
                <span className={`text-xs font-medium ${stepByStepMode ? 'text-blue-700' : 'text-gray-600'}`}>
                  Step-by-step
                </span>
              </div>
              
              {selectedGrade && selectedTopic && (
                <div className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {selectedGrade} • {selectedTopic.name}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
