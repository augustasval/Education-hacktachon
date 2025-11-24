// Test cases for JSON extraction from AI responses

const testResponses = [
  // Test 1: Clean JSON
  '{"id": "test", "theory": "Test theory"}',
  
  // Test 2: JSON wrapped in markdown
  '```json\n{"id": "test", "theory": "Test theory"}\n```',
  
  // Test 3: JSON with extra text
  'Here is the content:\n```json\n{"id": "test", "theory": "Test theory"}\n```\nThat should work!',
  
  // Test 4: JSON with backticks in content
  '```json\n{\n  "id": "test",\n  "theory": "Test with `code` inside"\n}\n```',
  
  // Test 5: Malformed JSON with extra braces
  'Some text { "id": "test", "theory": "Test theory" } more text'
];

// This function tests the JSON extraction logic
export function testJsonExtraction() {
  console.log('Testing JSON extraction...');
  
  testResponses.forEach((response, index) => {
    try {
      // Simulate the extraction logic
      let cleaned = response.trim();
      
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\s*/, '').replace(/\s*```\s*$/, '');
      }
      
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }
      
      cleaned = cleaned.replace(/\\"/g, '"').replace(/\\n/g, '\n');
      
      const parsed = JSON.parse(cleaned.trim());
      console.log(`✅ Test ${index + 1} passed:`, parsed);
    } catch (error) {
      console.log(`❌ Test ${index + 1} failed:`, error);
      console.log('Original response:', response);
    }
  });
}

// Uncomment to run tests:
// testJsonExtraction();
