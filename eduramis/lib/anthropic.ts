import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Export the model name for consistency
export const MODEL_NAME = 'gpt-4o-mini' as const;

// Type definitions for tutor requests
export interface TutorRequest {
  grade: string;
  topic: string;
  question?: string;
  problem?: string;
  mode?: 'step-by-step' | 'regular';
  requestType?: 'chat' | 'practice' | 'hint' | 'solution' | 'learn' | 'learn-question';
  context?: string; // For contextual questions about theory or steps
}

export interface TutorResponse {
  answer: string;
  explanation?: string;
  nextSteps?: string[];
}

export interface StreamTutorResponse {
  type: 'content' | 'done' | 'error';
  content?: string;
  error?: string;
}

export interface PracticeProblem {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  problem: string;
  hint?: string;
  solution?: string;
}

export interface PracticeResponse {
  problems: PracticeProblem[];
}

export interface LearnContent {
  id: string;
  theory: string;
  examples: LearnExample[];
  quiz?: QuizQuestion[];
}

export interface LearnExample {
  id: string;
  title: string;
  problem: string;
  answer: string;
  explanation: string;
  solution?: SolutionStep[]; // Keep for backwards compatibility
}

export interface SolutionStep {
  id: string;
  step: number;
  description: string;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
