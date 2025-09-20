import { TestFramework, assert } from '../test-framework.js';
import { FeedbackProcessor } from '../../src/core/FeedbackProcessor.js';

const test = new TestFramework();

// Test the countSyllables method
test.test('countSyllables should count syllables correctly', () => {
  const processor = new FeedbackProcessor();
  
  // Test various words with known syllable counts
  assert.equal(processor.countSyllables('hello'), 2);
  assert.equal(processor.countSyllables('world'), 1);
  assert.equal(processor.countSyllables('syllable'), 3);
  assert.equal(processor.countSyllables('beautiful'), 4); // beau-ti-ful-ly
  assert.equal(processor.countSyllables('the'), 1);
  assert.equal(processor.countSyllables('extraordinary'), 5); // ex-tra-or-di-nary
  assert.equal(processor.countSyllables('testing'), 2);
  assert.equal(processor.countSyllables('a'), 1);
  assert.equal(processor.countSyllables('I'), 1);
});

// Test the analyzeVocabulary method
test.test('analyzeVocabulary should calculate vocabulary diversity', () => {
  const processor = new FeedbackProcessor();
  const words = ['hello', 'world', 'hello', 'test', 'world', 'example'];
  const result = processor.analyzeVocabulary(words);
  
  assert.hasProperty(result, 'uniqueWords');
  assert.hasProperty(result, 'totalWords');
  assert.hasProperty(result, 'diversity');
  
  assert.equal(result.uniqueWords, 4); // hello, world, test, example
  assert.equal(result.totalWords, 6);
  
  // Check that diversity is between 0 and 1
  assert.true(result.diversity > 0 && result.diversity <= 1);
});

// Test the identifyGrammarIssues method
test.test('identifyGrammarIssues should find capitalization issues', () => {
  const processor = new FeedbackProcessor();
  const text = 'this is a test. this sentence has no capital letter.';
  const issues = processor.identifyGrammarIssues(text);
  
  assert.isArray(issues);
  assert.true(issues.length > 0, 'Expected to find at least one issue');
  
  // Check that at least one issue is found
  const hasCapitalizationIssue = issues.some(issue => 
    issue.type === 'capitalization' && 
    issue.issue === 'Sentence should start with a capital letter' &&
    issue.suggestion === 'Capitalize the first letter of the sentence'
  );
  
  assert.true(hasCapitalizationIssue, 'Expected to find a capitalization issue with specific format');
});

// Test the identifyGrammarIssues method with long sentences
test.test('identifyGrammarIssues should find long sentences', () => {
  const processor = new FeedbackProcessor();
  // Create a very long sentence (more than 30 words)
  const longSentence = 'This is a very long sentence that should trigger the run-on detection because it contains more than thirty words which is quite a lot for a single sentence and should be broken up into smaller pieces for better readability and comprehension.';
  const issues = processor.identifyGrammarIssues(longSentence);
  
  assert.isArray(issues);
  const hasRunOnIssue = issues.some(issue => 
    issue.type === 'run-on' && 
    issue.suggestion && 
    issue.suggestion.includes('shorter')
  );
  
  assert.true(hasRunOnIssue, 'Expected to find a run-on sentence issue');
});

// Export the test function
export default async function runTests() {
  return test.run();
}

// Run the tests if this file is executed directly
if (process.argv[1] === import.meta.filename) {
  test.run();
}
