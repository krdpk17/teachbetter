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

describe('Extreme Essays Comparison Test', () => {
  let feedbackProcessor;
  
  before(() => {
    feedbackProcessor = new FeedbackProcessor();
  });

  it('should show significant score differences between high and low quality essays', async () => {
    // Read test files
    const highQualityEssay = { 
      originalname: 'high_quality_essay.txt',
      buffer: Buffer.from(readTestFile('high_quality_essay.txt')),
      mimetype: 'text/plain'
    };
    
    const lowQualityEssay = { 
      originalname: 'low_quality_essay.txt',
      buffer: Buffer.from(readTestFile('low_quality_essay.txt')),
      mimetype: 'text/plain'
    };

    // Process both files
    const [highQualityResult, lowQualityResult] = await Promise.all([
      feedbackProcessor.processSingleAssignment(highQualityEssay, { type: 'essay' }),
      feedbackProcessor.processSingleAssignment(lowQualityEssay, { type: 'essay' })
    ]);

    // Log the structure of the results for debugging
    console.log('High Quality Essay Analysis:', JSON.stringify(highQualityResult, null, 2));
    console.log('\nLow Quality Essay Analysis:', JSON.stringify(lowQualityResult, null, 2));
    
    // Compare the analysis results
    console.log('\n' + '='.repeat(80));
    console.log('EXTREME ESSAYS COMPARISON REPORT'.padStart(55));
    console.log('='.repeat(80));
    
    // Compare basic metrics
    console.log('\n--- Basic Metrics ---');
    console.log(`High Quality Essay:`);
    console.log(`- Word Count: ${highQualityResult.wordCount}`);
    console.log(`- Sentence Count: ${highQualityResult.textAnalysis.sentenceCount}`);
    console.log(`- Paragraphs: ${highQualityResult.textAnalysis.paragraphCount}`);
    
    console.log(`\nLow Quality Essay:`);
    console.log(`- Word Count: ${lowQualityResult.wordCount}`);
    console.log(`- Sentence Count: ${lowQualityResult.textAnalysis.sentenceCount}`);
    console.log(`- Paragraphs: ${lowQualityResult.textAnalysis.paragraphCount}`);
    
    // Compare readability scores
    console.log('\n--- Readability Analysis ---');
    console.log(`High Quality Essay: ${highQualityResult.readabilityScore?.toFixed(2) || 'N/A'}`);
    console.log(`Low Quality Essay:  ${lowQualityResult.readabilityScore?.toFixed(2) || 'N/A'}`);
    
    // Compare vocabulary
    console.log('\n--- Vocabulary Analysis ---');
    console.log('High Quality Essay:');
    console.log(`- Unique Words: ${highQualityResult.textAnalysis.vocabulary?.uniqueWords || 'N/A'}`);
    console.log(`- Vocabulary Diversity: ${highQualityResult.textAnalysis.vocabulary ? (highQualityResult.textAnalysis.vocabulary.diversity * 100).toFixed(1) : 'N/A'}%`);
    
    console.log('\nLow Quality Essay:');
    console.log(`- Unique Words: ${lowQualityResult.textAnalysis.vocabulary?.uniqueWords || 'N/A'}`);
    console.log(`- Vocabulary Diversity: ${lowQualityResult.textAnalysis.vocabulary ? (lowQualityResult.textAnalysis.vocabulary.diversity * 100).toFixed(1) : 'N/A'}%`);
    
    // Compare dimension scores
    console.log('\n--- Dimension Scores ---');
    console.log('High Quality Essay:');
    Object.entries(highQualityResult.dimensionScores || {}).forEach(([dimension, score]) => {
      console.log(`- ${dimension.charAt(0).toUpperCase() + dimension.slice(1)}: ${(score.score * 100).toFixed(1)}%`);
    });
    
    console.log('\nLow Quality Essay:');
    Object.entries(lowQualityResult.dimensionScores || {}).forEach(([dimension, score]) => {
      console.log(`- ${dimension.charAt(0).toUpperCase() + dimension.slice(1)}: ${(score.score * 100).toFixed(1)}%`);
    });
    
    // Compare strengths and improvements
    console.log('\n--- Identified Strengths ---');
    console.log('High Quality Essay:');
    (highQualityResult.strengths || []).forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.dimension}: ${s.description || s.feedback} (${(s.score * 100).toFixed(1)}%)`);
    });
    
    console.log('\nLow Quality Essay:');
    (lowQualityResult.strengths || []).forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.dimension}: ${s.description || s.feedback} (${(s.score * 100).toFixed(1)}%)`);
    });
    
    console.log('\n--- Areas for Improvement ---');
    console.log('High Quality Essay:');
    (highQualityResult.improvementAreas || []).forEach((area, i) => {
      console.log(`  ${i + 1}. ${area.dimension || 'General'}: ${area.feedback || area.suggestion}`);
    });
    
    console.log('\nLow Quality Essay:');
    (lowQualityResult.improvementAreas || []).forEach((area, i) => {
      console.log(`  ${i + 1}. ${area.dimension || 'General'}: ${area.feedback || area.suggestion}`);
    });
    
    // Add assertions to verify significant differences
    const scoreDifference = (highQualityResult.overallQuality || 0) - (lowQualityResult.overallQuality || 0);
    console.log(`\nOverall Quality Difference: ${(scoreDifference * 100).toFixed(1)}%`);
    
    // Verify significant quality difference
    expect(scoreDifference).to.be.above(0.2, 
      `Expected significant quality difference (>20%) between essays, but got only ${(scoreDifference * 100).toFixed(1)}%`);
      
    // Verify word count difference
    const wordCountRatio = (highQualityResult.wordCount || 0) / (lowQualityResult.wordCount || 1);
    expect(wordCountRatio).to.be.above(1.5, 
      `Expected high quality essay to be at least 1.5x longer, but was only ${wordCountRatio.toFixed(1)}x longer`);
      
    // Verify dimension score differences
    const dimensions = Object.keys(highQualityResult.dimensionScores || {});
    if (dimensions.length > 0) {
      let significantDifferences = 0;
      const significantThreshold = 0.15; // 15% difference threshold
      
      console.log('\n--- Detailed Dimension Analysis ---');
      for (const dim of dimensions) {
        const highScore = highQualityResult.dimensionScores[dim]?.score || 0;
        const lowScore = lowQualityResult.dimensionScores[dim]?.score || 0;
        const diff = highScore - lowScore;
        const diffPercent = diff * 100;
        
        console.log(`- ${dim}:`);
        console.log(`  High: ${(highScore * 100).toFixed(1)}%`);
        console.log(`  Low:  ${(lowScore * 100).toFixed(1)}%`);
        console.log(`  Diff: ${diffPercent.toFixed(1)}%`);
        
        // Check for significant difference (exclude structure and presentation as they may be similar)
        if (dim === 'structure' || dim === 'presentation' || dim === 'accuracy') {
          console.log(`  Note: ${dim} differences may be less significant`);
        } else if (diff > significantThreshold) {
          significantDifferences++;
          console.log(`  ✅ Significant difference (${diffPercent.toFixed(1)}%)`);
        } else {
          console.log(`  ⚠️  Small difference (${diffPercent.toFixed(1)}%)`);
        }
      }
      
      // Ensure at least one dimension shows significant differences
      expect(significantDifferences).to.be.at.least(
        1,
        `Expected at least 1 dimension to show significant differences (>${significantThreshold * 100}%), but found none.`
      );
    }
    
    // Verify vocabulary diversity if available
    if (highQualityResult.textAnalysis?.vocabulary?.diversity && 
        lowQualityResult.textAnalysis?.vocabulary?.diversity) {
      expect(highQualityResult.textAnalysis.vocabulary.diversity).to.be.at.least(
        lowQualityResult.textAnalysis.vocabulary.diversity * 0.8, // Allow some flexibility
        'Expected high quality essay to have similar or better vocabulary diversity'
      );
    }
  });
});
