import { type LearnContent as LearnContentType } from '@/lib/anthropic';

// Map of topic names to their keys in the JSON file
const topicKeyMap: Record<string, string> = {
  'Algebra Basics': 'algebra-basics',
  'Linear Equations': 'linear-equations', 
  'Quadratic Equations': 'quadratic-equations',
  'Functions': 'functions',
  'Systems of Equations': 'systems-of-equations',
  'Exponential Functions': 'exponential-functions',
  'Polynomial Operations': 'algebra-basics', // Fallback to algebra basics
  'Factoring': 'quadratic-equations', // Use quadratic content for factoring
  'Graphing Linear Functions': 'linear-equations',
  'Inequalities': 'linear-equations', // Use linear equations content
  'Radical Expressions': 'functions', // Use functions content
  'Rational Functions': 'functions'
};

/**
 * Load learning content from local JSON file for 9th grade topics
 */
export async function loadLearnContent(grade: string, topicName: string): Promise<LearnContentType | null> {
  try {
    // Only load local content for 9th grade
    if (grade !== '9th Grade') {
      return null; // Will fall back to AI generation for other grades
    }

    // Get the topic key from the map
    const topicKey = topicKeyMap[topicName];
    if (!topicKey) {
      console.log(`No local content found for topic: ${topicName}`);
      return null; // Will fall back to AI generation
    }

    // Import the JSON data
    const contentData = await import('@/data/learn-content-9th-grade.json');
    const topicContent = (contentData.default as Record<string, any>)[topicKey];

    if (!topicContent) {
      console.log(`Content not found for topic key: ${topicKey}`);
      return null;
    }

    return topicContent as LearnContentType;
  } catch (error) {
    console.error('Error loading local learn content:', error);
    return null; // Will fall back to AI generation
  }
}

/**
 * Check if local content is available for a topic
 */
export function hasLocalContent(grade: string, topicName: string): boolean {
  return grade === '9th Grade' && topicName in topicKeyMap;
}

/**
 * Get all available topics with local content
 */
export function getAvailableTopics(): string[] {
  return Object.keys(topicKeyMap);
}
