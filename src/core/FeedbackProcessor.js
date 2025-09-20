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
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided for processing');
    }

    console.log(`Processing ${files.length} files with options:`, options);
    
    const results = [];
    let successCount = 0;
    
    for (const [index, file] of files.entries()) {
      const fileInfo = {
        name: file.originalname || file.name || `file-${index + 1}`,
        size: file.size || 0,
        type: file.mimetype || 'unknown'
      };
      
      console.log(`Processing file ${index + 1}/${files.length}:`, fileInfo.name);
      
      try {
        const analysis = await this.processSingleAssignment(file, options);
        const result = {
          fileName: fileInfo.name,
          studentName: this.extractStudentName(fileInfo.name),
          analysis: analysis,
          status: 'success',
          timestamp: new Date().toISOString()
        };
        
        results.push(result);
        successCount++;
        console.log(`✅ Successfully processed: ${fileInfo.name}`);
        
      } catch (error) {
        console.error(`❌ Error processing ${fileInfo.name}:`, error);
        
        const errorResult = {
          fileName: fileInfo.name,
          studentName: this.extractStudentName(fileInfo.name),
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString()
        };
        
        results.push(errorResult);
      }
    }
    
    console.log(`Processing complete. Success: ${successCount}, Failed: ${files.length - successCount}`);
    return results;
  }

  /**
   * Process a single assignment
   * @param {Object} file - File object with content and metadata
   * @param {Object} options - Processing options
   * @returns {Object} Analysis result
   */
  async processSingleAssignment(file, options) {
    const { assignmentType = 'essay', evaluationCriteria = [] } = options;
    
    if (!file) {
      throw new Error('No file provided for processing');
    }
    
    // Log file info for debugging
    console.log('Processing file:', {
      name: file.originalname || file.name || 'unknown',
      size: file.size || 0,
      type: file.mimetype || 'unknown'
    });
    
    // Extract text content
    let textContent;
    try {
      textContent = await this.extractTextContent(file);
      
      if (!textContent || textContent.trim().length === 0) {
        throw new Error('File appears to be empty');
      }
    } catch (error) {
      console.error('Error extracting text content:', error);
      throw new Error(`Could not process file: ${error.message}`);
    }

    // Perform comprehensive evaluation using EvaluationDimensions
    const evaluation = await this.evaluationDimensions.evaluate(textContent, assignmentType);
    
    // Basic text analysis
    const textAnalysis = this.analyzeText(textContent);
    
    // Assignment-specific analysis
    const assignmentAnalysis = await this.analyzer.analyzeByType(textContent, assignmentType);
    
    // Generate feedback suggestions
    const feedbackSuggestions = this.generateFeedbackSuggestions(
      textAnalysis, 
      assignmentAnalysis, 
      evaluation.dimensions,
      assignmentType
    );
    
    // Combine results
    const result = {
      textAnalysis: {
        ...textAnalysis,
        wordCount: evaluation.wordCount,
        sentenceCount: evaluation.sentenceCount,
        paragraphCount: evaluation.paragraphCount,
        readabilityScore: evaluation.readabilityScore
      },
      assignmentAnalysis,
      dimensionScores: evaluation.dimensions,
      feedback: evaluation.feedback,
      feedbackSuggestions,
      improvementAreas: evaluation.areasForImprovement,
      strengths: evaluation.strengths,
      wordCount: evaluation.wordCount,
      readabilityScore: evaluation.readabilityScore,
      overallQuality: evaluation.overallScore,
      metadata: {
        processedAt: new Date().toISOString(),
        assignmentType,
        evaluationCriteria: evaluationCriteria.length > 0 ? evaluationCriteria : Object.keys(evaluation.dimensions)
      }
    };
    
    return result;
  }

  /**
   * Extract text content from various file types
   */
  async extractTextContent(file) {
    try {
      // If the file has a buffer, convert it to a string
      if (file.buffer) {
        return file.buffer.toString('utf8');
      }
      
      // If the file has a path, read it from the file system
      if (file.path) {
        const fs = await import('fs/promises');
        return await fs.readFile(file.path, 'utf8');
      }
      
      // Fallback to any existing content or text
      return file.content || file.text || '';
      
    } catch (error) {
      console.error('Error reading file content:', error);
      throw new Error(`Failed to read file content: ${error.message}`);
    }
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
   * Generate feedback suggestions based on evaluation results
   */
  generateFeedbackSuggestions(textAnalysis, assignmentAnalysis, dimensionScores, assignmentType) {
    const suggestions = [];
    const feedbackMap = {
      structure: {
        high: 'Your essay structure needs significant improvement. Focus on clear organization with distinct introduction, body, and conclusion sections.',
        medium: 'Your structure is good but could be more effective with better paragraph organization and transitions.',
        specific: 'Consider using topic sentences and transition words to improve flow.'
      },
      creativity: {
        high: 'Try to include more original ideas and unique perspectives in your work.',
        medium: 'Good start on creativity, but push yourself to think more outside the box.',
        specific: 'Consider using more varied vocabulary and unique examples.'
      },
      accuracy: {
        high: 'Review your facts and ensure all information is accurate and properly cited.',
        medium: 'Most information is accurate, but some details need verification.',
        specific: 'Check your sources and citations for accuracy.'
      },
      presentation: {
        high: 'Pay close attention to formatting, grammar, and overall presentation quality.',
        medium: 'Good presentation overall, but some areas need polishing.',
        specific: 'Review your work for consistent formatting and grammar.'
      },
      criticalThinking: {
        high: 'Develop stronger analytical skills by examining issues from multiple perspectives.',
        medium: 'Good analysis, but try to explore counterarguments more thoroughly.',
        specific: 'Consider alternative viewpoints and their implications.'
      },
      clarity: {
        high: 'Work on making your writing clearer and more concise.',
        medium: 'Your writing is generally clear but could be more direct in places.',
        specific: 'Simplify complex sentences and define technical terms.'
      },
      depth: {
        high: 'Your analysis needs more depth and detail to fully develop your ideas.',
        medium: 'Good analysis, but some points could be explored more thoroughly.',
        specific: 'Provide more examples and evidence to support your arguments.'
      }
    };

    // Generate suggestions for each dimension
    Object.entries(dimensionScores).forEach(([dimension, result]) => {
      if (!feedbackMap[dimension]) return;
      
      const score = result.score;
      let priority, feedback;
      
      if (score < 0.4) {
        priority = 'high';
        feedback = feedbackMap[dimension].high;
      } else if (score < 0.7) {
        priority = 'medium';
        feedback = feedbackMap[dimension].medium;
      } else {
        // Only include positive feedback for strengths
        if (score > 0.8) {
          priority = 'low';
          feedback = `Excellent work on ${dimension}. ${result.feedback || ''}`;
        }
        return;
      }
      
      suggestions.push({
        category: dimension.charAt(0).toUpperCase() + dimension.slice(1),
        priority,
        score: Math.round(score * 100) / 100,
        feedback: result.feedback || feedback,
        specificSuggestions: feedbackMap[dimension].specific,
        details: result.details || {}
      });
    });

    // Add grammar and style suggestions
    if (textAnalysis.grammarIssues && textAnalysis.grammarIssues.length > 0) {
      const grammarScore = Math.max(0, 1 - (textAnalysis.grammarIssues.length / textAnalysis.wordCount * 100));
      suggestions.push({
        category: 'Grammar & Style',
        priority: grammarScore < 0.6 ? 'high' : 'medium',
        score: grammarScore,
        feedback: grammarScore < 0.6 ? 
          'Several grammar and style issues were found that affect readability.' :
          'Some grammar and style issues were found that could be improved.',
        specificSuggestions: 'Review your work for grammar, punctuation, and style consistency.',
        details: {
          issues: textAnalysis.grammarIssues.slice(0, 5), // Limit to top 5 issues
          totalIssues: textAnalysis.grammarIssues.length
        }
      });
    }

    // Sort by priority (high to low) and then by score (low to high)
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.score - b.score;
    });
  }

  /**
   * Identify areas for improvement based on evaluation results
   */
  identifyImprovementAreas(dimensionScores, textAnalysis) {
    const areas = [];
    
    // Process each dimension score
    Object.entries(dimensionScores).forEach(([dimension, result]) => {
      // Only consider scores below 0.7 for improvement areas
      if (result.score < 0.7) {
        const priority = result.score < 0.4 ? 'high' : 
                        result.score < 0.6 ? 'medium' : 'low';
        
        areas.push({
          dimension: dimension.charAt(0).toUpperCase() + dimension.slice(1),
          currentScore: Math.round(result.score * 100) / 100,
          description: result.feedback || `Needs improvement in ${dimension}`,
          priority,
          details: result.details || {}
        });
      }
    });
    
    // Add grammar and style improvements if issues exist
    if (textAnalysis.grammarIssues && textAnalysis.grammarIssues.length > 0) {
      const grammarScore = Math.max(0, 1 - (textAnalysis.grammarIssues.length / Math.max(1, textAnalysis.wordCount) * 100));
      areas.push({
        dimension: 'Grammar & Style',
        currentScore: Math.round(grammarScore * 100) / 100,
        description: grammarScore < 0.6 ? 
          'Several grammar and style issues affect readability' :
          'Some grammar and style issues need attention',
        priority: grammarScore < 0.5 ? 'high' : 'medium',
        details: {
          issueCount: textAnalysis.grammarIssues.length,
          sampleIssues: textAnalysis.grammarIssues.slice(0, 3)
        }
      });
    }
    
    // Add vocabulary suggestions if vocabulary analysis is available
    if (textAnalysis.vocabulary) {
      const { uniqueWordRatio, wordFrequency } = textAnalysis.vocabulary;
      if (uniqueWordRatio < 0.4) {
        areas.push({
          dimension: 'Vocabulary',
          currentScore: uniqueWordRatio,
          description: 'Limited vocabulary variety detected',
          priority: 'medium',
          details: {
            suggestion: 'Try using more varied vocabulary and synonyms',
            uniqueWordRatio: Math.round(uniqueWordRatio * 100) / 100
          }
        });
      }
      
      // Check for overused words
      const overusedWords = Object.entries(wordFrequency || {})
        .filter(([_, count]) => count > 5) // Words used more than 5 times
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3); // Top 3 most used words
      
      if (overusedWords.length > 0) {
        areas.push({
          dimension: 'Word Choice',
          currentScore: 0.6, // Medium priority
          description: 'Some words may be overused',
          priority: 'medium',
          details: {
            suggestion: 'Consider using synonyms or rephrasing to vary your word choice',
            overusedWords: overusedWords.map(([word, count]) => ({ word, count }))
          }
        });
      }
    }
    
    // Sort by priority (high to low) and then by score (low to high)
    return areas.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.currentScore - b.currentScore;
    });
  }

  /**
   * Identify and highlight student strengths based on evaluation results
   */
  identifyStrengths(dimensionScores, textAnalysis) {
    const strengths = [];
    const strengthCategories = {
      structure: {
        high: 'Excellent organization and logical flow',
        medium: 'Good structure with clear progression of ideas',
        details: 'Your writing shows strong organization with clear introduction, body, and conclusion.'
      },
      creativity: {
        high: 'Highly original and creative thinking',
        medium: 'Shows good creative elements',
        details: 'Your work demonstrates innovative thinking and unique perspectives.'
      },
      accuracy: {
        high: 'Exceptionally accurate and well-researched',
        medium: 'Good attention to factual accuracy',
        details: 'Your work shows strong research and attention to detail.'
      },
      presentation: {
        high: 'Outstanding presentation and formatting',
        medium: 'Good presentation with minor areas for polish',
        details: 'Your work is well-formatted and professional in appearance.'
      },
      criticalThinking: {
        high: 'Exceptional analytical and critical thinking',
        medium: 'Good analysis with thoughtful insights',
        details: 'Your work demonstrates strong analytical skills and depth of thought.'
      },
      clarity: {
        high: 'Exceptionally clear and well-articulated',
        medium: 'Clear communication of ideas',
        details: 'Your writing is clear, concise, and easy to understand.'
      },
      depth: {
        high: 'Extremely thorough and detailed analysis',
        medium: 'Good depth of analysis',
        details: 'Your work shows comprehensive understanding and thorough exploration of the topic.'
      }
    };

    // Process each dimension score to identify strengths
    Object.entries(dimensionScores).forEach(([dimension, result]) => {
      // Only consider scores above 0.7 as strengths
      if (result.score >= 0.7) {
        const category = strengthCategories[dimension] || {
          high: `Strong ${dimension}`,
          medium: `Good ${dimension}`,
          details: `Your work shows strength in ${dimension}.`
        };
        
        const strengthLevel = result.score >= 0.85 ? 'high' : 'medium';
        
        strengths.push({
          dimension: dimension.charAt(0).toUpperCase() + dimension.slice(1),
          score: Math.round(result.score * 100) / 100,
          strengthLevel,
          description: result.feedback || category[strengthLevel],
          details: result.details || { feedback: category.details }
        });
      }
    });

    // Add text analysis based strengths
    if (textAnalysis) {
      // Length and detail strength
      if (textAnalysis.wordCount > 150) {
        const lengthScore = Math.min(1, (textAnalysis.wordCount - 100) / 400); // Normalize to 0-1 scale
        strengths.push({
          dimension: 'Length & Detail',
          score: Math.round(lengthScore * 100) / 100,
          strengthLevel: lengthScore > 0.8 ? 'high' : 'medium',
          description: lengthScore > 0.8 ? 
            'Excellent level of detail and thorough coverage' : 
            'Good level of detail in your response',
          details: {
            wordCount: textAnalysis.wordCount,
            suggestion: lengthScore > 0.8 ? 
              'Your thorough coverage demonstrates strong understanding.' :
              'Consider adding more examples or explanations to strengthen your arguments.'
          }
        });
      }

      // Readability strength
      if (textAnalysis.readabilityScore > 60) {
        const readabilityLevel = textAnalysis.readabilityScore > 80 ? 'high' : 'medium';
        strengths.push({
          dimension: 'Readability',
          score: Math.round((textAnalysis.readabilityScore / 100) * 100) / 100,
          strengthLevel: readabilityLevel,
          description: readabilityLevel === 'high' ?
            'Exceptional clarity and readability' :
            'Clear and readable writing style',
          details: {
            score: textAnalysis.readabilityScore,
            level: textAnalysis.readabilityScore > 80 ? 'Very Easy' : 'Standard',
            suggestion: 'Your writing is accessible to your target audience.'
          }
        });
      }

      // Vocabulary strength if available
      if (textAnalysis.vocabulary) {
        const { uniqueWordRatio, wordFrequency } = textAnalysis.vocabulary;
        if (uniqueWordRatio > 0.6) {
          strengths.push({
            dimension: 'Vocabulary',
            score: Math.round(uniqueWordRatio * 100) / 100,
            strengthLevel: uniqueWordRatio > 0.75 ? 'high' : 'medium',
            description: uniqueWordRatio > 0.75 ?
              'Excellent vocabulary range and word choice' :
              'Good use of varied vocabulary',
            details: {
              uniqueWordRatio: Math.round(uniqueWordRatio * 100) / 100,
              suggestion: 'Your varied vocabulary enhances the quality of your writing.'
            }
          });
        }
      }
    }

    // Sort by strength level (high to low) and then by score (high to low)
    return strengths.sort((a, b) => {
      const strengthOrder = { high: 0, medium: 1 };
      if (strengthOrder[a.strengthLevel] !== strengthOrder[b.strengthLevel]) {
        return strengthOrder[a.strengthLevel] - strengthOrder[b.strengthLevel];
      }
      return b.score - a.score; // Higher scores first
    });
  }

  /**
   * Calculate overall quality score using weighted dimensions
   * @param {Object} dimensionScores - Object containing dimension scores and details
   * @returns {number} Overall quality score (0-1)
   */
  calculateOverallQuality(dimensionScores) {
    // Define weights for each dimension (sum should be 1.0)
    const weights = {
      structure: 0.20,
      criticalThinking: 0.20,
      accuracy: 0.15,
      creativity: 0.15,
      clarity: 0.10,
      depth: 0.10,
      presentation: 0.10
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    // Calculate weighted sum of scores
    Object.entries(dimensionScores).forEach(([dimension, result]) => {
      const weight = weights[dimension] || 0.05; // Default weight for any unexpected dimensions
      weightedSum += (result.score * weight);
      totalWeight += weight;
    });
    
    // Calculate weighted average (ensure we don't divide by zero)
    const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Apply length penalty for very short essays (less than 150 words)
    // This is a placeholder - in practice, you'd get wordCount from textAnalysis
    const wordCount = dimensionScores.wordCount || 0;
    const lengthPenalty = wordCount > 0 ? Math.min(1, wordCount / 150) : 1;
    
    // Final score with length penalty (capped at 1.0)
    const finalScore = Math.min(1, weightedAverage * lengthPenalty);
    
    // Round to 2 decimal places for display
    return Math.round(finalScore * 100) / 100;
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
