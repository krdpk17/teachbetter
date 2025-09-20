import { TestFramework, assert } from '../test-framework.js';
import { EvaluationDimensions } from '../../src/core/analyzers/EvaluationDimensions.js';
import { sampleEssay, sampleWorksheet } from '../setup.js';

const test = new TestFramework();

test.test('EvaluationDimensions Constructor', () => {
  const evaluator = new EvaluationDimensions();
  assert.hasProperty(evaluator, 'dimensionAnalyzers');
  assert.hasProperty(evaluator.dimensionAnalyzers, 'structure');
  assert.hasProperty(evaluator.dimensionAnalyzers, 'creativity');
  assert.hasProperty(evaluator.dimensionAnalyzers, 'accuracy');
  assert.hasProperty(evaluator.dimensionAnalyzers, 'presentation');
  assert.hasProperty(evaluator.dimensionAnalyzers, 'critical_thinking');
  assert.hasProperty(evaluator.dimensionAnalyzers, 'originality');
  assert.hasProperty(evaluator.dimensionAnalyzers, 'clarity');
  assert.hasProperty(evaluator.dimensionAnalyzers, 'depth');
});

test.test('evaluate should evaluate structure dimension', async () => {
  const evaluator = new EvaluationDimensions();
  const result = await evaluator.evaluate(sampleEssay, 'structure', 'essay');
  
  assert.hasProperty(result, 'score');
  assert.hasProperty(result, 'feedback');
  assert.true(typeof result.score === 'number');
  assert.true(result.score >= 0);
  assert.true(result.score <= 1);
});

test.test('evaluate should evaluate creativity dimension', async () => {
  const evaluator = new EvaluationDimensions();
  const result = await evaluator.evaluate(sampleEssay, 'creativity', 'essay');
  
  assert.hasProperty(result, 'score');
  assert.hasProperty(result, 'feedback');
});

test.test('evaluate should evaluate accuracy dimension', async () => {
  const evaluator = new EvaluationDimensions();
  const result = await evaluator.evaluate(sampleEssay, 'accuracy', 'essay');
  
  assert.hasProperty(result, 'score');
  assert.hasProperty(result, 'feedback');
});

test.test('evaluate should evaluate presentation dimension', async () => {
  const evaluator = new EvaluationDimensions();
  const result = await evaluator.evaluate(sampleEssay, 'presentation', 'essay');
  
  assert.hasProperty(result, 'score');
  assert.hasProperty(result, 'feedback');
});

test.test('evaluate should throw error for unknown dimension', async () => {
  const evaluator = new EvaluationDimensions();
  
  await assert.throwsAsync(
    () => evaluator.evaluate(sampleEssay, 'unknown', 'essay'),
    'Unknown evaluation dimension'
  );
});

test.test('analyzeStructure should analyze structure for essay', async () => {
  const evaluator = new EvaluationDimensions();
  const result = await evaluator.analyzeStructure(sampleEssay, 'essay');
  
  assert.hasProperty(result, 'score');
  assert.hasProperty(result, 'feedback');
  assert.true(result.score >= 0);
  assert.true(result.score <= 1);
});

test.test('analyzeStructure should analyze structure for worksheet', async () => {
  const evaluator = new EvaluationDimensions();
  const result = await evaluator.analyzeStructure(sampleWorksheet, 'worksheet');
  
  assert.hasProperty(result, 'score');
  assert.hasProperty(result, 'feedback');
});

export default test;

