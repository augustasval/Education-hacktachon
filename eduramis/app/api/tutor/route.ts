import { NextRequest, NextResponse } from 'next/server';
import { openai, MODEL_NAME, type TutorRequest, type StreamTutorResponse } from '@/lib/anthropic';
import { z } from 'zod';

// Input validation schema
const tutorRequestSchema = z.object({
  grade: z.string().min(1, 'Grade is required').max(20, 'Grade must be 20 characters or less'),
  topic: z.string().min(1, 'Topic is required').max(100, 'Topic must be 100 characters or less'),
  question: z.string().optional(),
  problem: z.string().optional(),
  mode: z.enum(['step-by-step', 'regular']).optional(),
  requestType: z.enum(['chat', 'practice', 'hint', 'solution', 'learn', 'learn-question']).optional().default('chat'),
  context: z.string().optional(),
}).refine((data) => {
  if (data.requestType === 'chat' && !data.question) {
    return false;
  }
  if ((data.requestType === 'hint' || data.requestType === 'solution') && !data.problem) {
    return false;
  }
  if (data.requestType === 'learn-question' && !data.question) {
    return false;
  }
  return true;
}, {
  message: 'Question is required for chat/learn-question requests, problem is required for hint/solution requests',
});

function createUserContent(grade: string, topic: string, requestType?: string, question?: string, problem?: string, context?: string): string {
  switch (requestType) {
    case 'practice':
      return `Generate practice problems for:\nGrade: ${grade}\nTopic: ${topic}\n\nPlease provide 5 problems (2 easy, 2 medium, 1 hard) in JSON format.`;
    case 'hint':
      return `Please provide a hint for this problem:\n\nProblem: ${problem}\n\nGrade Level: ${grade}\nTopic: ${topic}`;
    case 'solution':
      return `Please provide a complete solution for this problem:\n\nProblem: ${problem}\n\nGrade Level: ${grade}\nTopic: ${topic}`;
    case 'learn':
      return `Generate comprehensive learning material for:\nGrade: ${grade}\nTopic: ${topic}\n\nPlease provide theory, examples, and step-by-step solutions in JSON format.`;
    case 'learn-question':
      return `Context: ${context}\n\nGrade: ${grade}\nTopic: ${topic}\nQuestion: ${question}\n\nPlease answer this question about the theory or solution steps provided in the context.`;
    default:
      return `Grade: ${grade}\nTopic: ${topic}\nQuestion: ${question}`;
  }
}

function createSystemPrompt(grade: string, topic: string, requestType?: string, mode?: string): string {
  const basePrompt = `You are an expert AI Math Tutor designed to help students learn mathematics effectively. Your role is to:

1. Provide clear explanations appropriate for a ${grade} student
2. Focus on the topic of ${topic}
3. Use encouraging and supportive language
4. Provide helpful tips and strategies
5. Suggest next steps for continued learning

Guidelines:
- Always explain your reasoning clearly
- Use appropriate mathematical notation
- Provide examples when helpful
- Encourage the student to think critically
- If the question is unclear, ask for clarification
- Keep explanations at an appropriate level for the grade
- Be patient and supportive

Remember: Your goal is to help the student understand the concept, not just provide the answer.`;

  // Handle different request types
  if (requestType === 'practice') {
    return basePrompt + `

PRACTICE PROBLEM GENERATOR MODE:
Generate exactly 5 practice problems for ${grade} level ${topic}.
Include:
- 2 EASY problems (basic concept application)
- 2 MEDIUM problems (requires multiple steps)
- 1 HARD problem (challenging application)

Format your response as a JSON object:
{
  "problems": [
    {
      "id": "1",
      "difficulty": "easy",
      "problem": "[Clear problem statement]"
    },
    {
      "id": "2", 
      "difficulty": "easy",
      "problem": "[Clear problem statement]"
    },
    {
      "id": "3",
      "difficulty": "medium", 
      "problem": "[Clear problem statement]"
    },
    {
      "id": "4",
      "difficulty": "medium",
      "problem": "[Clear problem statement]"
    },
    {
      "id": "5",
      "difficulty": "hard",
      "problem": "[Clear problem statement]"
    }
  ]
}

Make sure problems are:
- Age-appropriate for ${grade}
- Relevant to ${topic}
- Clearly stated with all necessary information
- Progressive in difficulty
- Solvable with grade-level knowledge`;
  }

  if (requestType === 'hint') {
    return basePrompt + `

HINT MODE:
Provide a helpful hint for this problem without giving away the complete solution.
Your hint should:
- Guide the student toward the right approach
- Not solve the problem completely
- Give just enough information to get them started
- Be encouraging and supportive
- Suggest what concept or method to use
- Point out important information in the problem`;
  }

  if (requestType === 'solution') {
    return basePrompt + `

SOLUTION MODE:
Provide a complete, detailed solution to this problem.
Your solution should:
- Show all steps clearly
- Explain the reasoning for each step
- Include all calculations
- Verify the answer when possible
- Be educational, not just computational
- Help the student understand the process`;
  }

  if (requestType === 'learn') {
    return basePrompt + `

LEARN MODE:
Generate comprehensive learning material for ${grade} level ${topic}.
Format your response as a JSON object with this structure:

{
  "id": "unique-id",
  "theory": "[Comprehensive theory explanation covering key concepts, definitions, formulas, and principles. Make it engaging and age-appropriate for ${grade}.]",
  "examples": [
    {
      "id": "example-1",
      "title": "[Descriptive title for the example]",
      "problem": "[Clear problem statement]",
      "solution": [
        {
          "id": "step-1",
          "step": 1,
          "description": "[What we do in this step]",
          "explanation": "[Why we do this step and how it connects to the theory]"
        },
        {
          "id": "step-2", 
          "step": 2,
          "description": "[What we do in this step]",
          "explanation": "[Why we do this step and how it connects to the theory]"
        }
      ]
    },
    {
      "id": "example-2",
      "title": "[Second example with different complexity/approach]",
      "problem": "[Clear problem statement]", 
      "solution": [
        {
          "id": "step-1",
          "step": 1,
          "description": "[What we do in this step]",
          "explanation": "[Why we do this step and how it connects to the theory]"
        }
      ]
    }
  ]
}

Requirements:
- Theory should be comprehensive but digestible for ${grade} students
- Include 2-3 examples of varying difficulty
- Each solution step should have clear description AND explanation
- Connect examples back to theory concepts
- Use proper mathematical notation
- Make content engaging and educational`;
  }

  if (requestType === 'learn-question') {
    return basePrompt + `

LEARN QUESTION MODE:
Answer the student's question about the provided theory or solution steps.
The student has asked about specific content, so:
- Reference the context they provided
- Give a focused answer to their specific question
- Connect your answer back to the broader concept
- Provide additional clarification if helpful
- Encourage further questions
- Keep the explanation at ${grade} level`;
  }

  // Default chat mode
  if (mode === 'step-by-step') {
    return basePrompt + `

STEP-BY-STEP MODE ENABLED:
- Break down EVERY problem into numbered steps
- Show ALL intermediate calculations
- Explain WHY each step is necessary
- Use clear formatting like:
  Step 1: [Action] - [Explanation]
  Step 2: [Action] - [Explanation]
- Include verification/checking steps when applicable
- Provide detailed reasoning for each mathematical operation
- Use examples to illustrate concepts when helpful
- Make each step crystal clear and easy to follow`;
  }

  return basePrompt;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = tutorRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validationResult.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { grade, topic, question, problem, mode, requestType, context }: TutorRequest = validationResult.data;

    // Check if streaming is requested
    const useStreaming = request.headers.get('accept')?.includes('text/stream-event') || 
                        request.nextUrl.searchParams.get('stream') === 'true';

    if (useStreaming) {
      // Create a streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const systemPrompt = createSystemPrompt(grade, topic, requestType, mode);
            
            const completion = await openai.chat.completions.create({
              model: MODEL_NAME,
              max_tokens: 1000,
              temperature: 0.7,
              messages: [
                {
                  role: 'system',
                  content: systemPrompt,
                },
                {
                  role: 'user',
                  content: createUserContent(grade, topic, requestType, question, problem, context),
                },
              ],
              stream: true,
            });

            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                const streamResponse: StreamTutorResponse = {
                  type: 'content',  
                  content: content,
                };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(streamResponse)}\n\n`)
                );
              }
            }

            // Send completion signal
            const doneResponse: StreamTutorResponse = {
              type: 'done',
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(doneResponse)}\n\n`)
            );
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            const errorResponse: StreamTutorResponse = {
              type: 'error',
              error: error instanceof Error ? error.message : 'An unexpected error occurred',
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(errorResponse)}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const systemPrompt = createSystemPrompt(grade, topic, requestType, mode);
    
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: createUserContent(grade, topic, requestType, question, problem, context),
        },
      ],
    });

    // Extract the text content from the response
    const textContent = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({
      answer: textContent,
      metadata: {
        model: MODEL_NAME,
        grade,
        topic,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific Anthropic API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Authentication failed. Please check your API key configuration.' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Handle GET requests with helpful information
export async function GET() {
  return NextResponse.json({
    message: 'AI Math Tutor API',
    usage: {
      method: 'POST',
      body: {
        grade: 'string (required) - Student grade level',
        topic: 'string (required) - Math topic',
        question: 'string (required) - Math question to ask',
      },
      streaming: 'Add ?stream=true or set Accept: text/stream-event header for streaming response',
    },
    example: {
      grade: '8th grade',
      topic: 'Algebra',
      question: 'How do I solve 2x + 5 = 15?',
    },
  });
}
