# AI Math Tutor Setup Guide

This guide explains how to set up and use the OpenAI ChatGPT API integration for your AI Math Tutor.

## Prerequisites

1. **Anthropic API Key**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. **Node.js**: Make sure you have Node.js installed

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 2. Install Dependencies

The required dependencies should already be installed:

```bash
npm install @anthropic-ai/sdk zod
```

### 3. File Structure

The integration consists of these key files:

```
lib/
├── anthropic.ts          # Anthropic client configuration
└── tutor-client.ts       # Frontend API client utilities

app/api/tutor/
└── route.ts              # Next.js API route for tutor endpoints

components/
└── TutorDemo.tsx         # Example React component
```

## API Usage

### Basic Request

Send a POST request to `/api/tutor` with:

```json
{
  "grade": "8th grade",
  "topic": "Algebra", 
  "question": "How do I solve 2x + 5 = 15?"
}
```

### Streaming Request

Add `?stream=true` to the URL or set the `Accept: text/stream-event` header for streaming responses.

### Response Format

**Regular Response:**
```json
{
  "answer": "Here's how to solve 2x + 5 = 15...",
  "metadata": {
    "model": "claude-3-5-sonnet-20241022",
    "grade": "8th grade",
    "topic": "Algebra",
    "timestamp": "2025-11-24T..."
  }
}
```

**Streaming Response:**
```
data: {"type": "content", "content": "Here's how"}
data: {"type": "content", "content": " to solve"}
data: {"type": "done"}
```

## Frontend Integration

### Using the Client Utility

```typescript
import { tutorAPI } from '@/lib/tutor-client';

// Regular request
const response = await tutorAPI.askQuestion({
  grade: '8th grade',
  topic: 'Algebra',
  question: 'How do I solve 2x + 5 = 15?'
});

// Streaming request
await tutorAPI.askQuestionStream(
  { grade, topic, question },
  (content) => console.log('Received:', content),
  (error) => console.error('Error:', error),
  () => console.log('Complete!')
);
```

### Using the Demo Component

Import and use the demo component:

```tsx
import TutorDemo from '@/components/TutorDemo';

export default function Page() {
  return <TutorDemo />;
}
```

## Features

- ✅ **Input Validation**: Zod schema validation for all inputs
- ✅ **Streaming Support**: Real-time response streaming
- ✅ **Error Handling**: Graceful error handling with specific error types
- ✅ **TypeScript**: Full type safety throughout
- ✅ **Rate Limiting**: Built-in rate limit error handling
- ✅ **Tailored Responses**: Grade-appropriate explanations
- ✅ **Educational Focus**: Designed to teach, not just provide answers

## Error Handling

The API handles various error types:

- **400**: Invalid input (missing or invalid fields)
- **401**: Authentication error (invalid API key)
- **429**: Rate limit exceeded
- **500**: Internal server error

## Model Configuration

Currently configured to use:
- **Model**: `claude-3-5-sonnet-20241022` (Sonnet 4)
- **Max Tokens**: 1000
- **Temperature**: 0.7 (balanced creativity and consistency)

You can modify these settings in `/lib/anthropic.ts`.

## Security Notes

- Never commit your `.env.local` file
- Keep your API key secure
- The API key is only used server-side
- Input validation prevents malicious requests

## Testing

Test the API directly:

```bash
curl -X POST http://localhost:3000/api/tutor \
  -H "Content-Type: application/json" \
  -d '{
    "grade": "8th grade",
    "topic": "Algebra",
    "question": "How do I solve 2x + 5 = 15?"
  }'
```

## Next Steps

1. Set up your API key in `.env.local`
2. Run `npm run dev` to start the development server
3. Test the API using the demo component or direct API calls
4. Integrate the tutor client into your existing components
5. Customize the system prompts and response handling as needed

## Troubleshooting

**"API key required" error**: Make sure your `.env.local` file has the correct `ANTHROPIC_API_KEY`

**Type errors**: Ensure all dependencies are installed with `npm install`

**Streaming not working**: Check that the client is sending the correct headers or URL parameters

**Rate limits**: The API includes built-in rate limit handling and will return appropriate errors
