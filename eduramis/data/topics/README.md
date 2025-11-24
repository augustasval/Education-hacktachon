# Topics Data Structure

## Overview
This folder contains learning content organized by topic with multi-language support.

## File Structure
```
topics/
├── index.json              # Index of all available topics
├── algebra-basics.json     # Algebra basics content
├── linear-equations.json   # Linear equations content
└── quadratic-expressions.json  # Quadratic expressions (EN + LT)
```

## JSON Format

Each topic file contains content in multiple languages:

```json
{
  "en": {
    "id": "topic-id",
    "title": "Topic Title",
    "theory": "Theory content...",
    "examples": [...],
    "quiz": [...]
  },
  "lt": {
    "id": "topic-id",
    "title": "Temos Pavadinimas",
    "theory": "Teorijos turinys...",
    "examples": [...],
    "quiz": [...]
  }
}
```

## Supported Languages
- `en` - English
- `lt` - Lithuanian (Lietuvių)

## Adding New Topics

1. Create a new JSON file in the `topics/` folder
2. Add content for each language
3. Update `index.json` with the new topic metadata
4. Update `lib/learn-content-loader.ts` with the topic mapping

## Content Guidelines

### Theory
- Split into 10 sections (can vary)
- Each section should have a title and 2-3 sentences
- No "Step X" labels - just descriptive titles
- Similar length for each section

### Examples
- Show problem clearly
- Provide step-by-step solution
- Each step numbered with explanation
- No separate answer section

### Quiz
- 4 questions per topic
- Multiple choice format
- Include detailed explanation for correct answer

## Current Topics

| Topic | File | Languages | Grade |
|-------|------|-----------|-------|
| Algebra Basics | algebra-basics.json | EN | 9th |
| Linear Equations | linear-equations.json | EN | 9th |
| Quadratic Expressions | quadratic-expressions.json | EN, LT | 9th |
