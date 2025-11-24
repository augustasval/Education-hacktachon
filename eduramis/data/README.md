# 9th Grade Math Learning Content

This directory contains pre-written learning content for 9th grade mathematics topics. The content is stored in JSON format and loaded locally instead of generating via AI to provide instant, consistent learning experiences.

## Available Topics

The following 9th grade math topics have local content available:

1. **Algebra Basics** - Variables, terms, coefficients, like terms, distributive property
2. **Linear Equations** - Solving equations, variables on both sides, checking solutions  
3. **Quadratic Equations** - Factoring, quadratic formula, discriminant
4. **Functions** - Function notation, domain/range, evaluation, types of functions
5. **Systems of Equations** - Substitution method, elimination method, graphing
6. **Exponential Functions** - Growth/decay, exponent rules, solving exponential equations

## Content Structure

Each topic follows this JSON structure:

```json
{
  "topic-key": {
    "id": "topic-key",
    "theory": "Comprehensive explanation of concepts, definitions, formulas...",
    "examples": [
      {
        "id": "example-1",
        "title": "Descriptive title",
        "problem": "Clear problem statement",
        "solution": [
          {
            "id": "step-1",
            "step": 1,
            "description": "What we do in this step",
            "explanation": "Why we do this step and how it connects to theory"
          }
        ]
      }
    ]
  }
}
```

## Features

### Theory Section
- Comprehensive explanations appropriate for 9th grade level
- Key concepts, definitions, and formulas
- Important rules and properties
- Real-world applications where relevant

### Worked Examples  
- 2-3 examples per topic with varying difficulty
- Clear problem statements
- Step-by-step solutions with detailed explanations
- Each step includes both "what to do" and "why to do it"

### Interactive Elements
- "Ask Question" buttons next to theory and each solution step
- Questions are sent to AI with the specific content as context
- Responses appear in the Chat tab for reference

## Usage in the App

### Automatic Loading
- When a user selects "9th Grade" and any available topic, local content loads instantly
- A 📚 badge appears on the Learn tab indicating local content is available
- Falls back to AI generation for topics without local content

### Content Loader (`lib/learn-content-loader.ts`)
- Maps topic names to JSON keys
- Handles loading and error cases  
- Provides fallback to AI generation
- Utility functions for checking content availability

### Integration
- Seamlessly integrated with existing Learn component
- Same user experience as AI-generated content
- Context-aware help system works with local content
- Supports all existing features (expandable steps, question modals, etc.)

## Benefits

1. **Instant Loading** - No wait time for content generation
2. **Consistent Quality** - Carefully crafted educational content  
3. **Reliable Experience** - No dependency on AI API availability
4. **Cost Effective** - Reduces AI API usage for common topics
5. **Offline Capable** - Works without internet connection
6. **Curriculum Aligned** - Content specifically designed for 9th grade standards

## Adding New Topics

To add content for new topics:

1. Add the topic content to `learn-content-9th-grade.json`
2. Update the `topicKeyMap` in `learn-content-loader.ts`
3. Follow the established JSON structure
4. Ensure content is grade-appropriate and comprehensive
5. Include 2-3 varied examples with detailed step-by-step solutions

The system automatically detects new topics and displays the 📚 indicator when local content is available.
