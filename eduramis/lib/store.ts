import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Grade = 
  | '1st Grade' | '2nd Grade' | '3rd Grade' | '4th Grade' | '5th Grade' | '6th Grade'
  | '7th Grade' | '8th Grade' | '9th Grade' | '10th Grade' | '11th Grade' | '12th Grade'
  | 'College' | 'Graduate';

export type MathTopic = {
  id: string;
  name: string;
  description: string;
  grades: Grade[];
};

// Math topics organized by complexity and grade level
export const mathTopics: MathTopic[] = [
  // Elementary (1-5)
  { id: 'counting', name: 'Counting & Numbers', description: 'Basic counting, number recognition, and place value', grades: ['1st Grade', '2nd Grade', '3rd Grade'] },
  { id: 'addition-subtraction', name: 'Addition & Subtraction', description: 'Basic arithmetic operations', grades: ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade'] },
  { id: 'multiplication-division', name: 'Multiplication & Division', description: 'Times tables and basic division', grades: ['3rd Grade', '4th Grade', '5th Grade'] },
  { id: 'fractions-basic', name: 'Fractions (Basic)', description: 'Introduction to fractions, parts of a whole', grades: ['3rd Grade', '4th Grade', '5th Grade'] },
  { id: 'decimals-basic', name: 'Decimals (Basic)', description: 'Introduction to decimal numbers', grades: ['4th Grade', '5th Grade'] },
  { id: 'geometry-basic', name: 'Basic Geometry', description: 'Shapes, perimeter, area basics', grades: ['3rd Grade', '4th Grade', '5th Grade'] },
  
  // Middle School (6-8)
  { id: 'fractions-advanced', name: 'Fractions (Advanced)', description: 'Operations with fractions, mixed numbers', grades: ['6th Grade', '7th Grade', '8th Grade'] },
  { id: 'decimals-advanced', name: 'Decimals & Percentages', description: 'Decimal operations, percentage calculations', grades: ['6th Grade', '7th Grade', '8th Grade'] },
  { id: 'integers', name: 'Integers', description: 'Positive and negative numbers, operations', grades: ['6th Grade', '7th Grade', '8th Grade'] },
  { id: 'ratios-proportions', name: 'Ratios & Proportions', description: 'Understanding ratios, solving proportions', grades: ['6th Grade', '7th Grade', '8th Grade'] },
  { id: 'pre-algebra', name: 'Pre-Algebra', description: 'Variables, expressions, basic equations', grades: ['7th Grade', '8th Grade'] },
  { id: 'geometry-intermediate', name: 'Geometry (Intermediate)', description: 'Angles, triangles, coordinate plane', grades: ['6th Grade', '7th Grade', '8th Grade'] },
  
  // High School (9-12)
  { id: 'algebra1', name: 'Algebra I', description: 'Linear equations, inequalities, systems', grades: ['9th Grade', '10th Grade'] },
  { id: 'geometry-advanced', name: 'Geometry (Advanced)', description: 'Proofs, theorems, advanced shapes', grades: ['9th Grade', '10th Grade'] },
  { id: 'algebra2', name: 'Algebra II', description: 'Quadratics, polynomials, exponentials', grades: ['10th Grade', '11th Grade'] },
  { id: 'trigonometry', name: 'Trigonometry', description: 'Trig functions, identities, applications', grades: ['11th Grade', '12th Grade'] },
  { id: 'pre-calculus', name: 'Pre-Calculus', description: 'Advanced functions, limits preparation', grades: ['11th Grade', '12th Grade'] },
  { id: 'statistics', name: 'Statistics & Probability', description: 'Data analysis, probability theory', grades: ['10th Grade', '11th Grade', '12th Grade'] },
  
  // College & Beyond
  { id: 'calculus1', name: 'Calculus I', description: 'Limits, derivatives, basic integration', grades: ['12th Grade', 'College'] },
  { id: 'calculus2', name: 'Calculus II', description: 'Integration techniques, sequences, series', grades: ['College'] },
  { id: 'calculus3', name: 'Calculus III', description: 'Multivariable calculus, vector calculus', grades: ['College'] },
  { id: 'linear-algebra', name: 'Linear Algebra', description: 'Matrices, vectors, linear transformations', grades: ['College', 'Graduate'] },
  { id: 'differential-equations', name: 'Differential Equations', description: 'ODEs, PDEs, applications', grades: ['College', 'Graduate'] },
  { id: 'discrete-math', name: 'Discrete Mathematics', description: 'Logic, set theory, graph theory', grades: ['College', 'Graduate'] },
];

interface MathTutorState {
  selectedGrade: Grade | null;
  selectedTopic: MathTopic | null;
  stepByStepMode: boolean;
  setGrade: (grade: Grade) => void;
  setTopic: (topic: MathTopic) => void;
  setStepByStepMode: (enabled: boolean) => void;
  getAvailableTopics: () => MathTopic[];
  clearSelection: () => void;
}

export const useMathTutorStore = create<MathTutorState>()(
  persist(
    (set, get) => ({
      selectedGrade: null,
      selectedTopic: null,
      stepByStepMode: true, // Default to ON
      
      setGrade: (grade: Grade) => {
        set({ selectedGrade: grade });
        // Clear topic when grade changes
        const currentTopic = get().selectedTopic;
        if (currentTopic && !currentTopic.grades.includes(grade)) {
          set({ selectedTopic: null });
        }
      },
      
      setTopic: (topic: MathTopic) => {
        set({ selectedTopic: topic });
      },
      
      setStepByStepMode: (enabled: boolean) => {
        set({ stepByStepMode: enabled });
      },
      
      getAvailableTopics: () => {
        const grade = get().selectedGrade;
        if (!grade) return [];
        return mathTopics.filter(topic => topic.grades.includes(grade));
      },
      
      clearSelection: () => {
        set({ selectedGrade: null, selectedTopic: null, stepByStepMode: true });
      },
    }),
    {
      name: 'math-tutor-storage', // localStorage key
      partialize: (state) => ({ 
        selectedGrade: state.selectedGrade, 
        selectedTopic: state.selectedTopic,
        stepByStepMode: state.stepByStepMode
      }),
    }
  )
);
