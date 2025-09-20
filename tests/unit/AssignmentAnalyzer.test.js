import { TestFramework, assert } from '../test-framework.js';
import { AssignmentAnalyzer } from '../../src/core/analyzers/AssignmentAnalyzer.js';
import { sampleEssay, sampleWorksheet } from '../setup.js';

const test = new TestFramework();

test.test('AssignmentAnalyzer Constructor', () => {
  const analyzer = new AssignmentAnalyzer();
  assert.hasProperty(analyzer, 'assignmentHandlers');
  assert.hasProperty(analyzer.assignmentHandlers, 'essay');
  assert.hasProperty(analyzer.assignmentHandlers, 'worksheet');
  assert.hasProperty(analyzer.assignmentHandlers, 'report');
  assert.hasProperty(analyzer.assignmentHandlers, 'creative');
  assert.hasProperty(analyzer.assignmentHandlers, 'analysis');
  assert.hasProperty(analyzer.assignmentHandlers, 'general');
});

test.test('analyzeByType should analyze essay assignment', async () => {
  const analyzer = new AssignmentAnalyzer();
  const result = await analyzer.analyzeByType(sampleEssay, 'essay');
  
  assert.equal(result.type, 'essay');
  assert.hasProperty(result, 'overallScore');
  assert.hasProperty(result, 'strengths');
  assert.hasProperty(result, 'improvements');
});

test.test('analyzeByType should analyze worksheet assignment', async () => {
  const analyzer = new AssignmentAnalyzer();
  const result = await analyzer.analyzeByType(sampleWorksheet, 'worksheet');
  
  assert.equal(result.type, 'worksheet');
  assert.hasProperty(result, 'overallScore');
  assert.hasProperty(result, 'strengths');
  assert.hasProperty(result, 'improvements');
});

test.test('analyzeByType should analyze general assignment', async () => {
  const analyzer = new AssignmentAnalyzer();
  const result = await analyzer.analyzeByType(sampleEssay, 'general');
  
  assert.equal(result.type, 'general');
  assert.hasProperty(result, 'overallScore');
});

test.test('analyzeByType should handle unknown assignment type', async () => {
  const analyzer = new AssignmentAnalyzer();
  const result = await analyzer.analyzeByType(sampleEssay, 'unknown');
  
  assert.equal(result.type, 'general');
});

test.test('analyzeContent should analyze content quality', () => {
  const analyzer = new AssignmentAnalyzer();
  const result = analyzer.analyzeContent(sampleEssay);
  
  assert.hasProperty(result, 'wordCount');
  assert.hasProperty(result, 'sentenceCount');
  assert.hasProperty(result, 'paragraphCount');
  assert.greaterThan(result.wordCount, 0);
});

test.test('analyzeGeneralOrganization should analyze text organization', () => {
  const analyzer = new AssignmentAnalyzer();
  const result = analyzer.analyzeGeneralOrganization(sampleEssay);
  
  assert.hasProperty(result, 'score');
  assert.hasProperty(result, 'paragraphCount');
  assert.true(result.score >= 0);
  assert.true(result.score <= 1);
});

test.test('analyzeClarity should analyze text clarity', () => {
  const analyzer = new AssignmentAnalyzer();
  const result = analyzer.analyzeClarity(sampleEssay);
  
  assert.true(typeof result === 'number');
  assert.true(result >= 0);
  assert.true(result <= 1);
});

export default test;
