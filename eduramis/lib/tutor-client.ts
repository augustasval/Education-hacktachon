import { TutorRequest, StreamTutorResponse, PracticeResponse, PracticeProblem, type LearnContent as LearnContentType } from '@/lib/anthropic';

export class TutorAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/tutor') {
    this.baseUrl = baseUrl;
  }

  /**
   * Extract JSON content from AI response, handling markdown code blocks and various formats
   */
  private extractJsonFromResponse(response: string): string {
    // Remove markdown code block markers if present
    let cleaned = response.trim();
    
    // Handle various markdown code block formats
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-z]*\s*/, '').replace(/\s*```\s*$/, '');
    }
    
    // Remove any leading/trailing text that's not JSON
    // Look for the first { and last } to extract JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    // Handle escaped quotes and other common issues
    cleaned = cleaned.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    
    return cleaned.trim();
  }

  /**
   * Create a fallback learn content structure when JSON parsing fails
   */
  private createFallbackLearnContent(rawResponse: string, grade: string, topic: string): LearnContentType {
    // Extract meaningful content from the raw response
    const lines = rawResponse.split('\n').filter(line => line.trim().length > 0);
    
    // Try to find theory and example sections
    let theory = '';
    const examples: any[] = [];
    
    // Look for theory content (usually at the beginning)
    const theoryLines = lines.slice(0, Math.min(10, lines.length));
    theory = theoryLines.join('\n').trim();
    
    // If theory is too short, use a generic explanation
    if (theory.length < 50) {
      theory = `This is a ${grade} level topic about ${topic}. The AI provided content that couldn't be properly parsed, but you can still ask questions about this topic using the chat feature.`;
    }
    
    // Create a simple example
    const fallbackExample = {
      id: 'fallback-example',
      title: `Example Problem - ${topic}`,
      problem: `Here's a typical problem for ${topic} at ${grade} level.`,
      solution: [
        {
          id: 'fallback-step-1',
          step: 1,
          description: 'Analyze the problem',
          explanation: 'Start by understanding what the problem is asking for.'
        },
        {
          id: 'fallback-step-2', 
          step: 2,
          description: 'Apply the appropriate method',
          explanation: `Use the techniques learned in ${topic} to solve this type of problem.`
        }
      ]
    };
    
    examples.push(fallbackExample);
    
    return {
      id: `fallback-${topic.toLowerCase().replace(/\s+/g, '-')}`,
      theory,
      examples
    };
  }

  /**
   * Send a question to the AI tutor and get a complete response
   */
  async askQuestion(request: TutorRequest): Promise<{ answer: string; metadata?: any }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response from tutor');
    }

    return response.json();
  }

  /**
   * Generate practice problems
   */
  async generatePracticeProblems(grade: string, topic: string): Promise<PracticeProblem[]> {
    const request: TutorRequest = {
      grade,
      topic,
      requestType: 'practice'
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate practice problems');
    }

    const result = await response.json();
    
    try {
      // Clean the response to extract JSON from markdown code blocks
      const cleanedJson = this.extractJsonFromResponse(result.answer);
      const practiceData: PracticeResponse = JSON.parse(cleanedJson);
      return practiceData.problems.map(problem => ({
        ...problem,
        id: problem.id || Math.random().toString(36).substr(2, 9)
      }));
    } catch (parseError) {
      // If parsing fails, return empty array
      console.error('Failed to parse practice problems:', parseError);
      console.error('Raw response:', result.answer);
      return [];
    }
  }

  /**
   * Get a hint for a specific problem
   */
  async getHint(grade: string, topic: string, problem: string): Promise<string> {
    const request: TutorRequest = {
      grade,
      topic,
      problem,
      requestType: 'hint'
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get hint');
    }

    const result = await response.json();
    return result.answer;
  }

  /**
   * Get a solution for a specific problem
   */
  async getSolution(grade: string, topic: string, problem: string): Promise<string> {
    const request: TutorRequest = {
      grade,
      topic,
      problem,
      requestType: 'solution'
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get solution');
    }

    const result = await response.json();
    return result.answer;
  }

  /**
   * Generate learning content with theory and examples
   */
  async generateLearnContent(grade: string, topic: string): Promise<LearnContentType | null> {
    const request: TutorRequest = {
      grade,
      topic,
      requestType: 'learn'
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate learning content');
    }

    const result = await response.json();
    
    try {
      // Clean the response to extract JSON from markdown code blocks
      const cleanedJson = this.extractJsonFromResponse(result.answer);
      const learnData: LearnContentType = JSON.parse(cleanedJson);
      return learnData;
    } catch (parseError) {
      console.error('Failed to parse learning content:', parseError);
      console.error('Raw response (first 500 chars):', result.answer.substring(0, 500));
      
      // Try to create a fallback content structure from the raw text
      try {
        return this.createFallbackLearnContent(result.answer, grade, topic);
      } catch (fallbackError) {
        console.error('Fallback content creation also failed:', fallbackError);
        return null;
      }
    }
  }

  /**
   * Ask a question about specific learning content (theory or solution steps)
   */
  async askLearnQuestion(grade: string, topic: string, question: string, context: string): Promise<string> {
    const request: TutorRequest = {
      grade,
      topic,
      question,
      context,
      requestType: 'learn-question'
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get answer');
    }

    const result = await response.json();
    return result.answer;
  }

  /**
   * Send a question to the AI tutor and get a streaming response
   */
  async askQuestionStream(
    request: TutorRequest,
    onContent: (content: string) => void,
    onError?: (error: string) => void,
    onComplete?: () => void
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}?stream=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/stream-event',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response from tutor');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to create response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamTutorResponse = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'content':
                  if (data.content) {
                    onContent(data.content);
                  }
                  break;
                case 'done':
                  onComplete?.();
                  return;
                case 'error':
                  onError?.(data.error || 'Unknown error occurred');
                  return;
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming response:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// Default instance
export const tutorAPI = new TutorAPIClient();

// React hook for easy integration
export function useTutorAPI() {
  return tutorAPI;
}
