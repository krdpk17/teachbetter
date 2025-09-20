import { TestFramework, assert } from '../test-framework.js';
import { ReportGenerator } from '../../src/core/ReportGenerator.js';
import { cleanupTestFiles } from '../setup.js';

const test = new TestFramework();

test.test('ReportGenerator Constructor', () => {
  const generator = new ReportGenerator();
  assert.hasProperty(generator, 'templatesDir');
  assert.hasProperty(generator, 'outputDir');
});

test.test('prepareReportData should prepare data correctly', () => {
  const generator = new ReportGenerator();
  const analysisResults = [
    {
      fileName: 'test.txt',
      studentName: 'John Doe',
      analysis: {
        overallQuality: 0.8,
        wordCount: 100,
        readabilityScore: 75
      }
    }
  ];
  
  const result = generator.prepareReportData(analysisResults);
  
  assert.hasProperty(result, 'students');
  assert.hasProperty(result, 'summary');
  assert.hasProperty(result, 'statistics');
  assert.equal(result.students.length, 1);
  assert.equal(result.students[0].name, 'John Doe');
});

test.test('generateSummary should generate summary for valid students', () => {
  const generator = new ReportGenerator();
  const students = [
    { hasError: false, overallScore: 0.8, strengths: [], improvements: [] },
    { hasError: false, overallScore: 0.6, strengths: [], improvements: [] },
    { hasError: true, error: 'Processing error' }
  ];
  
  const result = generator.generateSummary(students);
  
  assert.equal(result.totalStudents, 3);
  assert.equal(result.processedStudents, 2);
  assert.equal(result.errorCount, 1);
  assert.closeTo(result.averageScore, 0.7, 2);
  assert.hasProperty(result, 'scoreDistribution');
});

test.test('generateSummary should handle empty students array', () => {
  const generator = new ReportGenerator();
  const result = generator.generateSummary([]);
  
  assert.equal(result.totalStudents, 0);
  assert.equal(result.processedStudents, 0);
  assert.equal(result.averageScore, 0);
});

test.test('convertToCSV should convert data to CSV format', () => {
  const generator = new ReportGenerator();
  const data = [
    ['Name', 'Score'],
    ['John', 0.8],
    ['Jane', 0.6]
  ];
  
  const result = generator.convertToCSV(data);
  
  assert.true(result.includes('Name,Score'));
  assert.true(result.includes('John,0.8'));
  assert.true(result.includes('Jane,0.6'));
});

test.test('convertToCSV should handle special characters', () => {
  const generator = new ReportGenerator();
  const data = [
    ['Name', 'Description'],
    ['John', 'He said "Hello" to me']
  ];
  
  const result = generator.convertToCSV(data);
  
  assert.true(result.includes('"He said ""Hello"" to me"'));
});

test.test('getMostCommon should return most common items', () => {
  const generator = new ReportGenerator();
  const items = ['a', 'b', 'a', 'c', 'b', 'a', 'd'];
  
  const result = generator.getMostCommon(items, 2);
  
  assert.equal(result.length, 2);
  assert.equal(result[0], 'a');
  assert.equal(result[1], 'b');
});

export default test;
