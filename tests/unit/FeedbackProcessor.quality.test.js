import { TestFramework, assert } from '../test-framework.js';
import { FeedbackProcessor } from '../../src/core/FeedbackProcessor.js';

const test = new TestFramework();

// Test the identifyGrammarIssues method
test.test('identifyGrammarIssues should find grammar issues in text', () => {
  const processor = new FeedbackProcessor();
  
  // Test with a sentence that has capitalization issues
  const text1 = 'this is a test. i hope it works.';
  const issues1 = processor.identifyGrammarIssues(text1);
  
  assert.isArray(issues1);
  assert.true(issues1.length > 0, 'Should find at least one grammar issue');
  
  // Check that the issue is about capitalization
  const hasCapitalizationIssue = issues1.some(issue => 
    issue.issue.toLowerCase().includes('sentence should start with a capital letter')
  );
  
  assert.true(
    hasCapitalizationIssue,
    'Should detect capitalization issues in the first sentence'
  );
  
  // Test with a sentence that's too long (more than 30 words)
  const longSentence = 'This is a very long sentence that should trigger the long sentence detection ' + 
    'because it exceeds the recommended length of 30 words by quite a large margin ' +
    'and continues on and on and on and on and on and on and on and on and on and on ' +
    'and on and on and on and on and on and on and on and on and on and on.';
    
  const issues2 = processor.identifyGrammarIssues(longSentence);
  
  const hasLongSentenceIssue = issues2.some(issue => 
    issue.issue.toLowerCase().includes('sentence may be too long')
  );
  
  assert.true(
    hasLongSentenceIssue,
    'Should detect long sentences (more than 30 words)'
  );
});

// Test the analyzeVocabulary method
test.test('analyzeVocabulary should analyze word diversity', () => {
  const processor = new FeedbackProcessor();
  
  // Test with a simple text
  const words1 = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];
  const analysis1 = processor.analyzeVocabulary(words1);
  
  assert.hasProperty(analysis1, 'diversity');
  assert.hasProperty(analysis1, 'uniqueWords');
  assert.hasProperty(analysis1, 'totalWords');
  
  // Test with all unique words
  const words2 = ['one', 'two', 'three', 'four'];
  const analysis2 = processor.analyzeVocabulary(words2);
  assert.equal(analysis2.diversity, 1, 'Diversity should be 1 when all words are unique');
  
  // Test with all same words
  const words3 = ['test', 'test', 'test'];
  const analysis3 = processor.analyzeVocabulary(words3);
  assert.true(
    analysis3.diversity < 0.5, 
    'Diversity should be low when all words are the same'
  );
});

// Test the calculateOverallQuality method (if it exists)
test.test('processSingleAssignment should return analysis with quality metrics', async () => {
  const processor = new FeedbackProcessor();
  
  // Create a mock file object
  const testFile = {
    name: 'test_essay.txt',
    content: 'This is a test essay. It contains multiple sentences. The quick brown fox jumps over the lazy dog.'
  };
  
  // Process the assignment
  const result = await processor.processSingleAssignment(testFile, {
    assignmentType: 'essay',
    evaluationCriteria: ['structure', 'clarity']
  });
  
  // Check the structure of the result
  assert.hasProperty(result, 'textAnalysis');
  assert.hasProperty(result, 'assignmentAnalysis');
  assert.hasProperty(result, 'dimensionScores');
  assert.hasProperty(result, 'feedbackSuggestions');
  
  // Check text analysis metrics
  const { textAnalysis } = result;
  assert.true(textAnalysis.wordCount > 0, 'Should count words');
  assert.true(textAnalysis.sentenceCount > 0, 'Should count sentences');
  assert.hasProperty(textAnalysis, 'readabilityScore');
  
  // Check dimension scores
  const { dimensionScores } = result;
  assert.true(
    dimensionScores.structure !== undefined || 
    dimensionScores.clarity !== undefined,
    'Should have at least one dimension score'
  );
  
  // Check feedback suggestions
  const { feedbackSuggestions } = result;
  assert.isArray(feedbackSuggestions);
  assert.true(
    feedbackSuggestions.length > 0,
    'Should provide at least one feedback suggestion'
  );
});

// Export the test function
export default async function runTests() {
  return test.run();
}

// Run the tests if this file is executed directly
if (process.argv[1] === import.meta.filename) {
  test.run();
}
