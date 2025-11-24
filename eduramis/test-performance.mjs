// Test script to verify performance optimization
import { loadChunkedLearnContent } from './lib/chunked-content-loader.js';
import { performance } from 'perf_hooks';

async function testContentLoading() {
  console.log('🧪 Testing content loading performance...\n');
  
  // Test 1: Valid 9th grade topic (should use local content - fast)
  console.log('Test 1: Loading "Algebra I" for "9th Grade"');
  const start1 = performance.now();
  const result1 = await loadChunkedLearnContent('9th Grade', 'Algebra I');
  const end1 = performance.now();
  console.log(`⏱️  Time: ${(end1 - start1).toFixed(2)}ms`);
  console.log(`📊 Result: ${result1 ? 'SUCCESS (Local content loaded)' : 'FAILED'}\n`);
  
  // Test 2: Invalid topic (should return null - fast)
  console.log('Test 2: Loading "Invalid Topic" for "9th Grade"');
  const start2 = performance.now();
  const result2 = await loadChunkedLearnContent('9th Grade', 'Invalid Topic');
  const end2 = performance.now();
  console.log(`⏱️  Time: ${(end2 - start2).toFixed(2)}ms`);
  console.log(`📊 Result: ${result2 ? 'UNEXPECTED SUCCESS' : 'CORRECT (Null returned)'}\n`);
  
  // Test 3: Non-9th grade (should return null - fast)
  console.log('Test 3: Loading "Algebra I" for "10th Grade"');
  const start3 = performance.now();
  const result3 = await loadChunkedLearnContent('10th Grade', 'Algebra I');
  const end3 = performance.now();
  console.log(`⏱️  Time: ${(end3 - start3).toFixed(2)}ms`);
  console.log(`📊 Result: ${result3 ? 'UNEXPECTED SUCCESS' : 'CORRECT (Null returned)'}\n`);
  
  console.log('✅ Performance test completed!');
}

testContentLoading().catch(console.error);
