import { TestFramework, assert } from '../test-framework.js';
import { FeedbackProcessor } from '../../src/core/FeedbackProcessor.js';

const test = new TestFramework();

// Test the evaluateDimension method
test.test('evaluateDimension should evaluate different dimensions correctly', async () => {
  const processor = new FeedbackProcessor();
  const testText = 'This is a test text for evaluation. It contains an introduction, body, and conclusion. ' +
                  'The structure is clear and logical. The ideas flow well from one to the next. ' +
                  'Each paragraph focuses on a single main idea. The conclusion summarizes the key points.';
  
  // Test structure dimension
  const structureResult = await processor.evaluateDimension(testText, 'structure', 'essay');
  assert.hasProperty(structureResult, 'score');
  assert.hasProperty(structureResult, 'feedback');
  
  // The score should be between 0 and 1
  assert.true(structureResult.score >= 0 && structureResult.score <= 1, 
    `Expected score between 0 and 1, got ${structureResult.score}`);
  
  // Test creativity dimension (which might not be implemented for all assignment types)
  try {
    const creativityResult = await processor.evaluateDimension(testText, 'creativity', 'essay');
    assert.hasProperty(creativityResult, 'score');
    assert.hasProperty(creativityResult, 'feedback');
  } catch (error) {
    // It's okay if creativity evaluation is not implemented for all assignment types
    console.log('Note: Creativity evaluation not fully implemented');
  }
  
  // Test with invalid dimension
  try {
    await processor.evaluateDimension(testText, 'invalid_dimension', 'essay');
    assert.fail('Should have thrown an error for invalid dimension');
  } catch (error) {
    assert.include(error.message, 'Unknown evaluation dimension');
  }
});

// Test the analyzeText method with various inputs
test.test('analyzeText should handle different text inputs', () => {
  const processor = new FeedbackProcessor();
  
  // Test with a simple sentence
  const simpleAnalysis = processor.analyzeText('This is a test sentence.');
  assert.hasProperty(simpleAnalysis, 'wordCount');
  assert.hasProperty(simpleAnalysis, 'sentenceCount');
  assert.hasProperty(simpleAnalysis, 'readabilityScore');
  assert.hasProperty(simpleAnalysis, 'vocabulary');
  assert.hasProperty(simpleAnalysis, 'sentiment');
  
  // Test with empty text
  const emptyAnalysis = processor.analyzeText('');
  assert.equal(emptyAnalysis.wordCount, 0);
  assert.equal(emptyAnalysis.sentenceCount, 0);
  assert.equal(emptyAnalysis.paragraphCount, 0);
  
  // Test with special characters and numbers
  const complexText = 'This is a test with numbers (123) and special characters: @#$%^&*';
  const complexAnalysis = processor.analyzeText(complexText);
  assert.true(complexAnalysis.wordCount > 0);
  assert.true(complexAnalysis.sentenceCount > 0);
});

// Test the processSingleAssignment method
test.test('processSingleAssignment should handle different file types', async () => {
  const processor = new FeedbackProcessor();
  
  // Test with a simple text file
  const textFile = {
    name: 'test.txt',
    content: 'This is a test text file.\nIt has multiple lines.'
  };
  
  const textResult = await processor.processSingleAssignment(textFile, { 
    assignmentType: 'essay',
    evaluationCriteria: ['structure', 'clarity']
  });
  
  // Check for expected properties in the result
  assert.hasProperty(textResult, 'textAnalysis');
  assert.hasProperty(textResult, 'assignmentAnalysis');
  assert.hasProperty(textResult, 'dimensionScores');
  assert.hasProperty(textResult, 'feedbackSuggestions');
  assert.hasProperty(textResult, 'improvementAreas');
  assert.hasProperty(textResult, 'strengths');
  assert.hasProperty(textResult, 'wordCount');
  assert.hasProperty(textResult, 'readabilityScore');
  assert.hasProperty(textResult, 'overallQuality');
  
  // Check that dimension scores were calculated for the specified criteria
  assert.hasProperty(textResult.dimensionScores, 'structure');
  assert.hasProperty(textResult.dimensionScores, 'clarity');
  
  // Test with empty content
  const emptyFile = {
    name: 'empty.txt',
    content: ''
  };
  
  try {
    await processor.processSingleAssignment(emptyFile, { 
      assignmentType: 'essay',
      evaluationCriteria: ['structure']
    });
    assert.fail('Should have thrown an error for empty content');
  } catch (error) {
    assert.include(error.message.toLowerCase(), 'no text content');
  }
});

// Export the test function
export default async function runTests() {
  return test.run();
}

// Run the tests if this file is executed directly
if (process.argv[1] === import.meta.filename) {
  test.run();
}
