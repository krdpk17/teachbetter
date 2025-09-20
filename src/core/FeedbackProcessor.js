import natural from 'natural';
import compromise from 'compromise';
import Sentiment from 'sentiment';
import { AssignmentAnalyzer } from './analyzers/AssignmentAnalyzer.js';
import { EvaluationDimensions } from './analyzers/EvaluationDimensions.js';

export class FeedbackProcessor {
  constructor() {
    this.analyzer = new AssignmentAnalyzer();
    this.evaluationDimensions = new EvaluationDimensions();
    this.sentiment = new Sentiment();
    
    // Initialize natural language processing
    // Note: PorterStemmer doesn't need attach() in current Natural.js version
  }

  /**
   * Process multiple assignments in bulk
   * @param {Array} files - Array of file objects with content and metadata
   * @param {Object} options - Processing options
   * @returns {Array} Array of analysis results
   */
  async processBulkAssignments(files, options = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        const analysis = await this.processSingleAssignment(file, options);
        results.push({
          fileName: file.name,
          studentName: this.extractStudentName(file.name),
          analysis: analysis,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({
          fileName: file.name,
          studentName: this.extractStudentName(file.name),
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  /**
   * Process a single assignment
   * @param {Object} file - File object with content and metadata
   * @param {Object} options - Processing options
   * @returns {Object} Analysis result
   */
  async processSingleAssignment(file, options) {
    const { assignmentType = 'general', evaluationCriteria = [] } = options;
    
    // Extract text content
    const textContent = await this.extractTextContent(file);
    
    if (!textContent || textContent.trim().length === 0) {
      throw new Error('No text content found in file');
    }

    // Basic text analysis
    const textAnalysis = this.analyzeText(textContent);
    
    // Assignment-specific analysis
    const assignmentAnalysis = await this.analyzer.analyzeByType(textContent, assignmentType);
    
    // Evaluation dimension analysis
    const dimensionScores = {};
    for (const dimension of evaluationCriteria) {
      dimensionScores[dimension] = await this.evaluateDimension(textContent, dimension, assignmentType);
    }
    
    // Generate feedback suggestions
    const feedbackSuggestions = this.generateFeedbackSuggestions(
      textAnalysis, 
      assignmentAnalysis, 
      dimensionScores,
      assignmentType
    );
    
    // Identify areas for improvement
    const improvementAreas = this.identifyImprovementAreas(dimensionScores, textAnalysis);
    
    // Generate strengths
    const strengths = this.identifyStrengths(dimensionScores, textAnalysis);
    
    return {
      textAnalysis,
      assignmentAnalysis,
      dimensionScores,
      feedbackSuggestions,
      improvementAreas,
      strengths,
      wordCount: textAnalysis.wordCount,
      readabilityScore: textAnalysis.readabilityScore,
      overallQuality: this.calculateOverallQuality(dimensionScores)
    };
  }

  /**
   * Extract text content from various file types
   */
  async extractTextContent(file) {
    // This would be implemented based on file type
    // For now, assuming text content is already extracted
    return file.content || file.text || '';
  }

  /**
   * Perform basic text analysis
   */
  analyzeText(text) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
    
    // Calculate readability (simplified Flesch Reading Ease)
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = this.calculateAvgSyllables(words);
    const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    // Sentiment analysis
    const sentiment = this.sentiment.analyze(text);
    
    // Grammar and style analysis
    const grammarIssues = this.identifyGrammarIssues(text);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 100) / 100,
      avgWordsPerParagraph: Math.round(words.length / paragraphs.length * 100) / 100,
      readabilityScore: Math.round(readabilityScore * 100) / 100,
      sentiment: {
        score: sentiment.score,
        comparative: sentiment.comparative,
        positive: sentiment.positive,
        negative: sentiment.negative
      },
      grammarIssues,
      vocabulary: this.analyzeVocabulary(words)
    };
  }

  /**
   * Evaluate a specific dimension
   */
  async evaluateDimension(text, dimension, assignmentType) {
    return await this.evaluationDimensions.evaluate(text, dimension, assignmentType);
  }

  /**
   * Generate feedback suggestions
   */
  generateFeedbackSuggestions(textAnalysis, assignmentAnalysis, dimensionScores, assignmentType) {
    const suggestions = [];
    
    // Structure suggestions
    if (dimensionScores.structure && dimensionScores.structure.score < 0.6) {
      suggestions.push({
        category: 'Structure',
        priority: 'high',
        suggestion: 'Consider organizing your ideas with clear topic sentences and logical flow between paragraphs.',
        specificAreas: ['introduction', 'body paragraphs', 'conclusion']
      });
    }
    
    // Creativity suggestions
    if (dimensionScores.creativity && dimensionScores.creativity.score < 0.5) {
      suggestions.push({
        category: 'Creativity',
        priority: 'medium',
        suggestion: 'Try to incorporate more original ideas and unique perspectives in your work.',
        specificAreas: ['original thinking', 'unique examples', 'creative expression']
      });
    }
    
    // Accuracy suggestions
    if (dimensionScores.accuracy && dimensionScores.accuracy.score < 0.7) {
      suggestions.push({
        category: 'Accuracy',
        priority: 'high',
        suggestion: 'Review your facts and ensure all information is accurate and properly cited.',
        specificAreas: ['fact-checking', 'citations', 'data accuracy']
      });
    }
    
    // Presentation suggestions
    if (dimensionScores.presentation && dimensionScores.presentation.score < 0.6) {
      suggestions.push({
        category: 'Presentation',
        priority: 'medium',
        suggestion: 'Pay attention to formatting, grammar, and overall presentation quality.',
        specificAreas: ['formatting', 'grammar', 'clarity']
      });
    }
    
    return suggestions;
  }

  /**
   * Identify areas for improvement
   */
  identifyImprovementAreas(dimensionScores, textAnalysis) {
    const areas = [];
    
    Object.entries(dimensionScores).forEach(([dimension, score]) => {
      if (score.score < 0.6) {
        areas.push({
          dimension,
          currentScore: score.score,
          description: score.feedback,
          priority: score.score < 0.4 ? 'high' : 'medium'
        });
      }
    });
    
    // Add grammar and style improvements
    if (textAnalysis.grammarIssues.length > 0) {
      areas.push({
        dimension: 'Grammar & Style',
        currentScore: Math.max(0, 1 - (textAnalysis.grammarIssues.length / textAnalysis.wordCount * 100)),
        description: 'Address grammar and style issues for better clarity',
        priority: 'medium',
        specificIssues: textAnalysis.grammarIssues
      });
    }
    
    return areas;
  }

  /**
   * Identify strengths
   */
  identifyStrengths(dimensionScores, textAnalysis) {
    const strengths = [];
    
    Object.entries(dimensionScores).forEach(([dimension, score]) => {
      if (score.score >= 0.7) {
        strengths.push({
          dimension,
          score: score.score,
          description: score.feedback
        });
      }
    });
    
    // Add text analysis strengths
    if (textAnalysis.wordCount > 100) {
      strengths.push({
        dimension: 'Length & Detail',
        score: Math.min(1, textAnalysis.wordCount / 500),
        description: 'Good length and detail in your response'
      });
    }
    
    if (textAnalysis.readabilityScore > 60) {
      strengths.push({
        dimension: 'Clarity',
        score: textAnalysis.readabilityScore / 100,
        description: 'Clear and readable writing style'
      });
    }
    
    return strengths;
  }

  /**
   * Calculate overall quality score
   */
  calculateOverallQuality(dimensionScores) {
    const scores = Object.values(dimensionScores).map(score => score.score);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average * 100) / 100;
  }

  /**
   * Extract student name from filename
   */
  extractStudentName(filename) {
    // Simple extraction - could be enhanced with more sophisticated parsing
    const nameMatch = filename.match(/([A-Za-z\s]+)/);
    return nameMatch ? nameMatch[1].trim() : 'Unknown Student';
  }

  /**
   * Calculate average syllables per word
   */
  calculateAvgSyllables(words) {
    let totalSyllables = 0;
    words.forEach(word => {
      totalSyllables += this.countSyllables(word);
    });
    return totalSyllables / words.length;
  }

  /**
   * Count syllables in a word
   */
  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  /**
   * Identify grammar issues
   */
  identifyGrammarIssues(text) {
    const issues = [];
    
    // Simple grammar checks
    const sentences = text.split(/[.!?]+/);
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length === 0) return;
      
      // Check for capitalization
      if (trimmed[0] !== trimmed[0].toUpperCase()) {
        issues.push({
          type: 'capitalization',
          sentence: index + 1,
          issue: 'Sentence should start with a capital letter',
          suggestion: 'Capitalize the first letter of the sentence'
        });
      }
      
      // Check for run-on sentences (simplified)
      const words = trimmed.split(/\s+/);
      if (words.length > 30) {
        issues.push({
          type: 'run-on',
          sentence: index + 1,
          issue: 'Sentence may be too long',
          suggestion: 'Consider breaking into shorter sentences'
        });
      }
    });
    
    return issues;
  }

  /**
   * Analyze vocabulary
   */
  analyzeVocabulary(words) {
    const uniqueWords = new Set(words.map(word => word.toLowerCase()));
    const vocabularyDiversity = uniqueWords.size / words.length;
    
    return {
      uniqueWords: uniqueWords.size,
      totalWords: words.length,
      diversity: Math.round(vocabularyDiversity * 100) / 100
    };
  }
}
