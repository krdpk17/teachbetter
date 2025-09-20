import { TestFramework, assert } from '../test-framework.js';
import { FeedbackProcessor } from '../../src/core/FeedbackProcessor.js';

const test = new TestFramework();

test.test('identifyGrammarIssues should find capitalization issues', () => {
  const processor = new FeedbackProcessor();
  const text = 'this is a test. this sentence has no capital letter.';
  const issues = processor.identifyGrammarIssues(text);
  
  assert.isArray(issues);
  assert.greaterThan(issues.length, 0);
  assert.hasProperty(issues[0], 'type');
  assert.equal(issues[0].type, 'capitalization');
  assert.include(issues[0].suggestion, 'Capitalize');
});

test.test('identifyGrammarIssues should find long sentences', () => {
  const processor = new FeedbackProcessor();
  // Create a very long sentence (more than 30 words)
  const longSentence = 'This is a very long sentence that should trigger the run-on detection because it contains more than thirty words which is quite a lot for a single sentence and should be broken up into smaller pieces for better readability and comprehension.';
  const issues = processor.identifyGrammarIssues(longSentence);
  
  assert.isArray(issues);
  const runOnIssues = issues.filter(issue => issue.type === 'run-on');
  assert.greaterThan(runOnIssues.length, 0);
  assert.include(runOnIssues[0].suggestion, 'shorter sentences');
});

test.test('countSyllables should count syllables correctly', () => {
  const processor = new FeedbackProcessor();
  
  // Test various words with known syllable counts
  const testCases = [
    { word: 'hello', expected: 2 },
    { word: 'world', expected: 1 },
    { word: 'syllable', expected: 3 },
    { word: 'beautiful', expected: 3 },
    { word: 'the', expected: 1 },
    { word: 'extraordinary', expected: 6 },
    { word: 'testing', expected: 2 },
    { word: 'a', expected: 1 },
    { word: 'I', expected: 1 }
  ];
  
  testCases.forEach(({ word, expected }) => {
    const result = processor.countSyllables(word);
    assert.equal(result, expected, `Expected '${word}' to have ${expected} syllables, got ${result}`);
  });
});

test.test('analyzeVocabulary should calculate vocabulary diversity', () => {
  const processor = new FeedbackProcessor();
  const words = ['hello', 'world', 'hello', 'test', 'world', 'example'];
  const result = processor.analyzeVocabulary(words);
  
  assert.hasProperty(result, 'uniqueWords');
  assert.hasProperty(result, 'totalWords');
  assert.hasProperty(result, 'diversity');
  
  assert.equal(result.uniqueWords, 4); // hello, world, test, example
  assert.equal(result.totalWords, 6);
  assert.approximately(result.diversity, 0.67, 0.01); // 4/6 ≈ 0.67
});

test.test('evaluateDimension should call evaluationDimensions.evaluate', async () => {
  const processor = new FeedbackProcessor();
  const mockText = 'Sample text';
  const mockDimension = 'structure';
  const mockAssignmentType = 'essay';
  
  // Mock the evaluationDimensions.evaluate method
  const originalEvaluate = processor.evaluationDimensions.evaluate;
  let calledWith = null;
  
  try {
    processor.evaluationDimensions.evaluate = async (text, dimension, assignmentType) => {
      calledWith = { text, dimension, assignmentType };
      return { score: 0.8, feedback: 'Good structure' };
    };
    
    const result = await processor.evaluateDimension(mockText, mockDimension, mockAssignmentType);
    
    assert.deepEqual(calledWith, {
      text: mockText,
      dimension: mockDimension,
      assignmentType: mockAssignmentType
    });
    
    assert.hasProperty(result, 'score');
    assert.hasProperty(result, 'feedback');
  } finally {
    // Restore original method
    processor.evaluationDimensions.evaluate = originalEvaluate;
  }
});

test.test('identifyImprovementAreas should identify areas with low scores', () => {
  const processor = new FeedbackProcessor();
  
  const dimensionScores = {
    structure: { score: 0.5, feedback: 'Needs work' },
    creativity: { score: 0.8, feedback: 'Good' },
    accuracy: { score: 0.3, feedback: 'Needs improvement' },
    presentation: { score: 0.7, feedback: 'Acceptable' }
  };
  
  const textAnalysis = {
    grammarIssues: [
      { type: 'capitalization', issue: 'Missing capital', suggestion: 'Add capital' }
    ],
    wordCount: 50
  };
  
  const areas = processor.identifyImprovementAreas(dimensionScores, textAnalysis);
  
  // Should include structure and accuracy (scores < 0.6)
  assert.equal(areas.length, 3); // structure, accuracy, and grammar
  
  const dimensionNames = areas.map(area => area.dimension);
  assert.include(dimensionNames, 'structure');
  assert.include(dimensionNames, 'accuracy');
  assert.include(dimensionNames, 'Grammar & Style');
  
  // Check priorities
  const accuracyArea = areas.find(area => area.dimension === 'accuracy');
  assert.equal(accuracyArea.priority, 'high'); // score < 0.4
  
  const structureArea = areas.find(area => area.dimension === 'structure');
  assert.equal(structureArea.priority, 'medium'); // 0.4 <= score < 0.6
});

// Run the tests
test.run();
