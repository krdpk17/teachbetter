import { TestFramework, assert } from '../test-framework.js';
import { FeedbackProcessor } from '../../src/core/FeedbackProcessor.js';

const test = new TestFramework();

// Test the processBulkAssignments method
test.test('processBulkAssignments should process multiple files', async () => {
  const processor = new FeedbackProcessor();
  
  // Test with multiple files
  const files = [
    { 
      name: 'student1_essay.txt', 
      content: 'This is a test essay. It contains multiple sentences.'
    },
    { 
      name: 'student2_essay.txt', 
      content: 'Another test essay with different content.'
    },
    { 
      name: 'student3_essay.txt', 
      content: 'Yet another test essay with more content and details.'
    }
  ];
  
  const results = await processor.processBulkAssignments(files, { 
    assignmentType: 'essay',
    evaluationCriteria: ['structure', 'clarity']
  });
  
  // Check that we got results for all files
  assert.equal(results.length, files.length);
  
  // Check each result has the expected properties
  results.forEach((result, index) => {
    assert.hasProperty(result, 'fileName');
    assert.hasProperty(result, 'studentName');
    assert.hasProperty(result, 'analysis');
    assert.hasProperty(result, 'timestamp');
    
    // Check that the student name was extracted (format is implementation dependent)
    assert.true(typeof result.studentName === 'string', 'Student name should be a string');
    assert.true(result.studentName.length > 0, 'Student name should not be empty');
    
    // Check analysis contains the expected structure
    assert.hasProperty(result.analysis, 'textAnalysis');
    assert.hasProperty(result.analysis, 'assignmentAnalysis');
    assert.hasProperty(result.analysis, 'dimensionScores');
    assert.hasProperty(result.analysis, 'feedbackSuggestions');
  });
});

// Test with empty files array
test.test('processBulkAssignments should handle empty files array', async () => {
  const processor = new FeedbackProcessor();
  const results = await processor.processBulkAssignments([], { assignmentType: 'essay' });
  
  // Should return an empty array when no files are provided
  assert.isArray(results);
  assert.equal(results.length, 0);
});

// Test with error in one file processing
test.test('processBulkAssignments should handle processing errors', async () => {
  const processor = new FeedbackProcessor();
  
  // One valid file and one invalid (empty) file
  const files = [
    { 
      name: 'valid_essay.txt', 
      content: 'This is a valid essay.'
    },
    { 
      name: 'empty_essay.txt', 
      content: ''
    }
  ];
  
  const results = await processor.processBulkAssignments(files, { 
    assignmentType: 'essay',
    evaluationCriteria: ['structure']
  });
  
  // Should return results for all files, with error for the invalid one
  assert.equal(results.length, 2);
  
  // First file should be processed successfully (no error property)
  assert.false('error' in results[0], 'First file should not have an error');
  
  // Second file should have an error
  assert.true('error' in results[1], 'Second file should have an error');
  assert.include(results[1].error.toLowerCase(), 'no text content');
});

// Test the extractStudentName method
test.test('extractStudentName should extract names from filenames', () => {
  const processor = new FeedbackProcessor();
  
  // Test various filename patterns
  const testCases = [
    { filename: 'john_doe_essay.txt', expected: (name) => name.length > 0 },
    { filename: 'alice_smith-essay.pdf', expected: (name) => name.length > 0 },
    { filename: 'bob_johnson assignment.docx', expected: (name) => name.length > 0 },
    { filename: 'test.txt', expected: (name) => name.length > 0 },
    { filename: 'singleword', expected: (name) => name.length > 0 },
    { filename: '', expected: (name) => name === 'Unknown Student' }
  ];
  
  testCases.forEach(({ filename, expected }) => {
    const result = processor.extractStudentName(filename);
    const isValid = expected(result);
    assert.true(isValid, `Unexpected result for filename: ${filename}, got: ${result}`);
  });
});

// Export the test function
export default async function runTests() {
  return test.run();
}

// Run the tests if this file is executed directly
if (process.argv[1] === import.meta.filename) {
  test.run();
}
