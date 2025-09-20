#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const runUnit = args.includes('--unit') || args.length === 0;
const runIntegration = args.includes('--integration') || args.length === 0;

console.log('🧪 Bulk Feedback Generator Test Suite\n');

let allPassed = true;

// Run unit tests
if (runUnit) {
  console.log('📋 Running Unit Tests...\n');
  
  try {
    const { default: feedbackProcessorTest } = await import('./unit/FeedbackProcessor.test.js');
    const feedbackPassed = await feedbackProcessorTest.run();
    allPassed = allPassed && feedbackPassed;
  } catch (error) {
    console.log(`❌ FeedbackProcessor tests failed to load: ${error.message}`);
    allPassed = false;
  }

  try {
    const { default: fileUploadHandlerTest } = await import('./unit/FileUploadHandler.basic.test.js');
    const fileUploadPassed = await fileUploadHandlerTest.run();
    allPassed = allPassed && fileUploadPassed;
  } catch (error) {
    console.log(`❌ FileUploadHandler tests failed to load: ${error.message}`);
    allPassed = false;
  }

  try {
    const { default: reportGeneratorTest } = await import('./unit/ReportGenerator.test.js');
    const reportPassed = await reportGeneratorTest.run();
    allPassed = allPassed && reportPassed;
  } catch (error) {
    console.log(`❌ ReportGenerator tests failed to load: ${error.message}`);
    allPassed = false;
  }

  try {
    const { default: assignmentAnalyzerTest } = await import('./unit/AssignmentAnalyzer.test.js');
    const assignmentPassed = await assignmentAnalyzerTest.run();
    allPassed = allPassed && assignmentPassed;
  } catch (error) {
    console.log(`❌ AssignmentAnalyzer tests failed to load: ${error.message}`);
    allPassed = false;
  }

  try {
    const { default: evaluationDimensionsTest } = await import('./unit/EvaluationDimensions.test.js');
    const evaluationPassed = await evaluationDimensionsTest.run();
    allPassed = allPassed && evaluationPassed;
  } catch (error) {
    console.log(`❌ EvaluationDimensions tests failed to load: ${error.message}`);
    allPassed = false;
  }
}

// Run integration tests
if (runIntegration) {
  console.log('\n🔗 Running Integration Tests...\n');
  
  try {
    const { default: apiTest } = await import('./integration/api.test.js');
    const apiPassed = await apiTest.run();
    allPassed = allPassed && apiPassed;
  } catch (error) {
    console.log(`❌ API integration tests failed to load: ${error.message}`);
    allPassed = false;
  }
}

// Final results
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}
