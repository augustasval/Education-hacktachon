import { type LearnContent as LearnContentType } from '@/lib/anthropic';
import algebraBasicsData from '@/data/topics/algebra-basics.json';
import linearEquationsData from '@/data/topics/linear-equations.json';
import quadraticExpressionsData from '@/data/topics/quadratic-expressions.json';

// Map of topic names to their data
const topicDataMap: Record<string, any> = {
  'algebra-basics': algebraBasicsData,
  'linear-equations': linearEquationsData,
  'quadratic-expressions': quadraticExpressionsData,
};

// Map of topic names to their file keys
const topicFileMap: Record<string, string> = {
  'Algebra I': 'algebra-basics',
  'Algebra Basics': 'algebra-basics',
  'Linear Equations': 'linear-equations',
  'Quadratic Expressions': 'quadratic-expressions',
  'Kvadratiniai Reiškiniai': 'quadratic-expressions',
  'Geometry (Advanced)': 'linear-equations',
  'Quadratic Equations': 'quadratic-expressions',
  'Factoring': 'quadratic-expressions',
  'Polynomial Operations': 'algebra-basics',
  'Graphing Linear Functions': 'linear-equations',
  'Inequalities': 'linear-equations',
};

/**
 * Load learning content from local JSON files with language support
 */
export async function loadLearnContent(
  grade: string, 
  topicName: string, 
  language: string = 'en'
): Promise<LearnContentType | null> {
  try {
    console.log(`🔍 loadLearnContent called with grade: "${grade}", topic: "${topicName}", language: "${language}"`)
    
    // Only load local content for 9th grade
    if (grade !== '9th Grade') {
      console.log(`❌ Not 9th grade, returning null`)
      return null; // Will fall back to AI generation for other grades
    }

    // Get the topic file key from the map
    const topicKey = topicFileMap[topicName];
    if (!topicKey) {
      console.log(`❌ No local content found for topic: "${topicName}"`);
      console.log(`Available topics:`, Object.keys(topicFileMap));
      return null; // Will fall back to AI generation
    }

    console.log(`✅ Found topic mapping: "${topicName}" -> "${topicKey}"`);

    // Get the data for this topic
    const contentData = topicDataMap[topicKey];
    if (!contentData) {
      console.log(`❌ No data found for topic key: "${topicKey}"`);
      return null;
    }
    
    // Get content in the requested language, fallback to English
    const topicContent = contentData[language] || contentData['en'];

    if (!topicContent) {
      console.log(`❌ Content not found for topic key: "${topicKey}" in language: "${language}"`);
      return null;
    }

    console.log(`🎉 Successfully loaded content for "${topicName}" in "${language}"`);
    return topicContent as LearnContentType;
  } catch (error) {
    console.error('❌ Error loading local learn content:', error);
    return null; // Will fall back to AI generation
  }
}

/**
 * Check if local content is available for a topic
 */
export function hasLocalContent(grade: string, topicName: string): boolean {
  return grade === '9th Grade' && topicName in topicFileMap;
}

/**
 * Get all available topics with local content
 */
export function getAvailableTopics(): string[] {
  return Object.keys(topicFileMap);
}
