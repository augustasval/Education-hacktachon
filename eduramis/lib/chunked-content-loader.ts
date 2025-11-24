export interface ChunkedSection {
  id: string
  title: string
  theory: string
  example: {
    id: string
    title: string
    problem: string
    solution: Array<{
      id: string
      step: number
      description: string
      explanation: string
    }>
  }
}

export interface ChunkedTopic {
  id: string
  sections: ChunkedSection[]
}

export type ChunkedContent = Record<string, ChunkedTopic>

// Map of topic names to their keys in the chunked JSON file
const chunkedTopicKeyMap: Record<string, string> = {
  'Algebra I': 'algebra-basics',
  'Geometry (Advanced)': 'linear-equations', // Map geometry to linear equations for now
  'Algebra Basics': 'algebra-basics', // Keep old mapping for compatibility
  'Linear Equations': 'linear-equations',
  'Quadratic Equations': 'quadratic-equations',
  'Functions': 'functions',
  'Systems of Equations': 'systems-of-equations',
  'Exponential Functions': 'exponential-functions'
}

/**
 * Load chunked learning content from local JSON file for 9th grade topics
 */
export async function loadChunkedLearnContent(grade: string, topicName: string): Promise<ChunkedTopic | null> {
  try {
    console.log(`🔍 loadChunkedLearnContent called with grade: "${grade}", topic: "${topicName}"`)
    
    // Only load local content for 9th grade
    if (grade !== '9th Grade') {
      console.log(`❌ Not 9th grade, returning null`)
      return null
    }

    // Get the topic key from the map
    const topicKey = chunkedTopicKeyMap[topicName]
    if (!topicKey) {
      console.log(`❌ No chunked content found for topic: "${topicName}"`)
      console.log(`Available topics:`, Object.keys(chunkedTopicKeyMap))
      return null
    }

    console.log(`✅ Found topic mapping: "${topicName}" -> "${topicKey}"`)

    // Chunked content is disabled - use regular content with quiz support instead
    console.log(`ℹ️ Chunked content disabled, returning null to use regular content`)
    return null

    // Import the chunked JSON data
    // const contentData = await import('@/data/learn-content-9th-grade-chunked.json')
    // const topicContent = (contentData.default as ChunkedContent)[topicKey]

    // if (!topicContent) {
    //   console.log(`❌ Chunked content not found for topic key: "${topicKey}"`)
    //   console.log(`Available keys in JSON:`, Object.keys(contentData.default))
    //   return null
    // }

    // console.log(`🎉 Successfully loaded chunked content for "${topicName}"`)
    // return topicContent
  } catch (error) {
    console.error('❌ Error loading chunked learn content:', error)
    return null
  }
}

/**
 * Check if chunked local content is available for a topic
 */
export function hasChunkedLocalContent(grade: string, topicName: string): boolean {
  return grade === '9th Grade' && topicName in chunkedTopicKeyMap
}

/**
 * Get all available topics with chunked local content
 */
export function getAvailableChunkedTopics(): string[] {
  return Object.keys(chunkedTopicKeyMap)
}
