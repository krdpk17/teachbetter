import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FeedbackProcessor } from '../src/core/FeedbackProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_FILES_DIR = path.join(__dirname, 'fixtures');

// Helper function to read test files
const readTestFile = (filename) => {
  return fs.readFileSync(path.join(TEST_FILES_DIR, filename), 'utf-8');
};

describe('Feedback Comparison Test', () => {
  let feedbackProcessor;
  
  before(() => {
    feedbackProcessor = new FeedbackProcessor();
  });

  it('should generate and compare feedback for two different files', async () => {
    // Read test files
    const file1 = { 
      originalname: 'essay1.txt',
      buffer: Buffer.from(readTestFile('essay1.txt')),
      mimetype: 'text/plain'
    };
    
    const file2 = { 
      originalname: 'essay2.txt',
      buffer: Buffer.from(readTestFile('essay2.txt')),
      mimetype: 'text/plain'
    };

    // Process both files
    const [result1, result2] = await Promise.all([
      feedbackProcessor.processSingleAssignment(file1, { type: 'essay' }),
      feedbackProcessor.processSingleAssignment(file2, { type: 'essay' })
    ]);

    // Log the structure of the results for debugging
    console.log('Result 1 structure:', JSON.stringify(result1, null, 2));
    console.log('Result 2 structure:', JSON.stringify(result2, null, 2));
    
    // Compare the analysis results
    console.log('\n--- Feedback Comparison Report ---');
    
    // Compare word counts
    console.log('\n--- Word Count ---');
    console.log(`File 1 (${file1.originalname}): ${result1.wordCount} words`);
    console.log(`File 2 (${file2.originalname}): ${result2.wordCount} words`);
    
    // Compare readability scores
    console.log('\n--- Readability ---');
    console.log(`File 1 (${file1.originalname}): ${result1.readabilityScore.toFixed(2)}`);
    console.log(`File 2 (${file2.originalname}): ${result2.readabilityScore.toFixed(2)}`);
    
    // Compare sentiment
    console.log('\n--- Sentiment Analysis ---');
    console.log(`File 1 (${file1.originalname}):`);
    console.log(`  Score: ${result1.textAnalysis.sentiment.score}`);
    console.log(`  Comparative: ${result1.textAnalysis.sentiment.comparative.toFixed(2)}`);
    console.log(`  Positive words: ${result1.textAnalysis.sentiment.positive.slice(0, 5).join(', ')}${result1.textAnalysis.sentiment.positive.length > 5 ? '...' : ''}`);
    
    console.log(`\nFile 2 (${file2.originalname}):`);
    console.log(`  Score: ${result2.textAnalysis.sentiment.score}`);
    console.log(`  Comparative: ${result2.textAnalysis.sentiment.comparative.toFixed(2)}`);
    console.log(`  Positive words: ${result2.textAnalysis.sentiment.positive.slice(0, 5).join(', ')}${result2.textAnalysis.sentiment.positive.length > 5 ? '...' : ''}`);
    
    // Compare strengths
    console.log('\n--- Strengths ---');
    console.log(`File 1 (${file1.originalname}):`);
    result1.strengths.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.description} (${s.dimension}: ${s.score})`);
    });
    
    console.log(`\nFile 2 (${file2.originalname}):`);
    result2.strengths.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.description} (${s.dimension}: ${s.score})`);
    });
    
    // Compare assignment analysis
    console.log('\n--- Assignment Analysis ---');
    console.log(`File 1 (${file1.originalname}):`);
    console.log(`  Clarity: ${result1.assignmentAnalysis.clarity.toFixed(2)}`);
    console.log(`  Overall Score: ${result1.assignmentAnalysis.overallScore}`);
    
    console.log(`\nFile 2 (${file2.originalname}):`);
    console.log(`  Clarity: ${result2.assignmentAnalysis.clarity.toFixed(2)}`);
    console.log(`  Overall Score: ${result2.assignmentAnalysis.overallScore}`);
    
    // Basic assertions
    expect(result1).to.have.property('textAnalysis');
    expect(result2).to.have.property('textAnalysis');
    expect(result1).to.have.property('assignmentAnalysis');
    expect(result2).to.have.property('assignmentAnalysis');
  });
});
