import natural from 'natural';
import compromise from 'compromise';

export class EvaluationDimensions {
  constructor() {
    // Define methods as arrow functions to maintain 'this' binding
    this.analyzeStructure = async (text, assignmentType) => {
      const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/);
      
      // Calculate structure score based on various factors
      let score = 0.5; // Base score
      const feedback = [];
      const details = {
        paragraphCount: paragraphs.length,
        avgSentenceLength: sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(1, sentences.length),
        hasIntroduction: paragraphs[0]?.toLowerCase().includes('introduction') || false,
        hasConclusion: paragraphs[paragraphs.length - 1]?.toLowerCase().includes('conclusion') || false,
        transitionWords: (text.match(/(however|furthermore|moreover|therefore|consequently|in conclusion|in summary)/gi) || []).length
      };
      
      // Score adjustments
      if (paragraphs.length >= 5) score += 0.2;
      if (details.avgSentenceLength > 10 && details.avgSentenceLength < 25) score += 0.1;
      if (details.hasIntroduction) score += 0.1;
      if (details.hasConclusion) score += 0.1;
      if (details.transitionWords >= 3) score += 0.1;
      
      // Cap the score
      score = Math.min(1, Math.max(0, score));
      
      // Generate feedback
      if (score > 0.8) feedback.push("Excellent structure with clear organization and flow.");
      else if (score > 0.6) feedback.push("Good structure, but could benefit from better organization.");
      else feedback.push("Needs improvement in organization and structure.");
      
      return { 
        score, 
        feedback: feedback.join(' '), 
        details 
      };
    };
    
    this.analyzeCreativity = async (text, assignmentType) => {
      const words = text.split(/\s+/);
      const uniqueWords = new Set(words.map(w => w.toLowerCase()));
      const creativityWords = ['imagine', 'what if', 'perhaps', 'maybe', 'could', 'might', 'suggest', 'propose', 'innovative', 'unique'];
      
      let creativityCount = 0;
      const lowerText = text.toLowerCase();
      creativityWords.forEach(word => {
        creativityCount += (lowerText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      });
      
      // Calculate creativity score
      let score = 0.3; // Base score
      const wordDiversity = uniqueWords.size / words.length;
      
      score += Math.min(0.3, creativityCount * 0.05); // Up to 0.3 for creativity words
      score += Math.min(0.4, wordDiversity * 2); // Up to 0.4 for word diversity
      
      // Generate feedback
      const feedback = [];
      if (score > 0.7) feedback.push("Highly creative and original thinking demonstrated.");
      else if (score > 0.5) feedback.push("Shows some creative elements.");
      else feedback.push("Could benefit from more creative and original ideas.");
      
      return { 
        score, 
        feedback: feedback.join(' '),
        details: {
          uniqueWordRatio: wordDiversity,
          creativityWordCount: creativityCount
        }
      };
    };
    
    this.analyzeAccuracy = async (text, assignmentType) => {
      // This is a simplified version - in a real app, you'd want to check facts against a knowledge base
      const words = text.split(/\s+/);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Check for common factual claims that can be verified
      const factualClaims = [
        { claim: /education increases gdp/i, isTrue: true },
        { claim: /education reduces poverty/i, isTrue: true },
        { claim: /education is unimportant/i, isFalse: true },
        { claim: /education has no benefits/i, isFalse: true }
      ];
      
      let accurateClaims = 0;
      let totalClaims = 0;
      
      factualClaims.forEach(({ claim, isTrue, isFalse }) => {
        const matches = text.match(claim);
        if (matches) {
          totalClaims++;
          if ((isTrue && !isFalse) || (!isTrue && isFalse)) {
            accurateClaims++;
          }
        }
      });
      
      // Calculate accuracy score (default to 0.8 if no claims to check)
      const score = totalClaims > 0 ? (accurateClaims / totalClaims) : 0.8;
      
      // Generate feedback
      const feedback = [];
      if (score > 0.9) feedback.push("Highly accurate and well-researched content.");
      else if (score > 0.7) feedback.push("Mostly accurate, but could benefit from more precise information.");
      else if (totalClaims > 0) feedback.push("Contains some inaccuracies that should be addressed.");
      
      return { 
        score,
        feedback: feedback.length > 0 ? feedback.join(' ') : 'Accuracy assessment not fully applicable.',
        details: {
          claimsChecked: totalClaims,
          accurateClaims
        }
      };
    };
    
    this.analyzePresentation = async (text, assignmentType) => {
      const words = text.split(/\s+/);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
      
      // Check for presentation elements
      const hasHeadings = /^#+\s+.+/m.test(text);
      const hasBulletPoints = /^\s*[-*•]\s+/m.test(text);
      const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
      const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
      
      // Calculate presentation score
      let score = 0.5; // Base score
      
      if (hasHeadings) score += 0.1;
      if (hasBulletPoints) score += 0.1;
      if (avgSentenceLength > 8 && avgSentenceLength < 25) score += 0.2;
      if (paragraphs.length >= 3) score += 0.1;
      
      // Check for very short paragraphs (could indicate poor structure)
      const shortParagraphs = paragraphs.filter(p => p.split(/\s+/).length < 15).length;
      if (shortParagraphs > 1) score -= 0.1 * shortParagraphs;
      
      // Cap the score
      score = Math.min(1, Math.max(0, score));
      
      // Generate feedback
      const feedback = [];
      if (score > 0.8) feedback.push("Excellent presentation with good use of formatting and structure.");
      else if (score > 0.6) feedback.push("Good presentation, but could be enhanced with better formatting.");
      else feedback.push("Needs improvement in presentation and formatting.");
      
      return { 
        score, 
        feedback: feedback.join(' '),
        details: {
          hasHeadings,
          hasBulletPoints,
          avgSentenceLength,
          paragraphCount: paragraphs.length,
          shortParagraphs
        }
      };
    };
    
    this.analyzeCriticalThinking = async (text, assignmentType) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/);
      
      // Look for evidence of critical thinking
      const criticalThinkingIndicators = [
        'because', 'therefore', 'thus', 'consequently', 'as a result',
        'however', 'although', 'nevertheless', 'on the other hand',
        'suggests', 'indicates', 'demonstrates', 'implies', 'shows that',
        'in contrast', 'compared to', 'similarly', 'unlike', 'whereas'
      ];
      
      let indicatorCount = 0;
      const lowerText = text.toLowerCase();
      criticalThinkingIndicators.forEach(indicator => {
        indicatorCount += (lowerText.match(new RegExp(`\\b${indicator}\\b`, 'g')) || []).length;
      });
      
      // Calculate score based on indicator density
      const indicatorDensity = indicatorCount / sentences.length;
      let score = 0.3; // Base score
      
      if (indicatorDensity > 0.8) score += 0.5;
      else if (indicatorDensity > 0.5) score += 0.3;
      else if (indicatorDensity > 0.2) score += 0.1;
      
      // Check for evidence and reasoning
      const hasEvidence = /(research shows|studies indicate|according to|\d{4})/i.test(text);
      if (hasEvidence) score += 0.2;
      
      // Cap the score
      score = Math.min(1, Math.max(0, score));
      
      // Generate feedback
      const feedback = [];
      if (score > 0.8) feedback.push("Excellent critical thinking demonstrated with clear reasoning and evidence.");
      else if (score > 0.6) feedback.push("Shows good critical thinking, but could benefit from more analysis.");
      else feedback.push("Needs to develop stronger critical thinking and analytical skills.");
      
      return { 
        score, 
        feedback: feedback.join(' '),
        details: {
          indicatorCount,
          indicatorDensity,
          hasEvidence
        }
      };
    };
    
    // Implement analyzeDepth as an arrow function
    this.analyzeDepth = async (text, assignmentType) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/);
      
      // Calculate average sentence length as a proxy for depth
      const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(1, sentences.length);
      
      // Check for evidence of deep analysis (e.g., because, therefore, suggests, indicates)
      const analysisIndicators = (text.match(/(because|therefore|suggests|indicates|demonstrates|implies)/gi) || []).length;
      
      // Calculate depth score (0-1)
      let score = 0.5; // Base score
      
      // Adjust based on sentence length (longer sentences may indicate more complex thought)
      if (avgSentenceLength > 15) score += 0.2;
      
      // Adjust based on analysis indicators
      const indicatorDensity = analysisIndicators / (sentences.length || 1);
      if (indicatorDensity > 0.3) score += 0.3;
      else if (indicatorDensity > 0.1) score += 0.15;
      
      // Generate feedback
      const feedback = [];
      if (score > 0.8) {
        feedback.push('Excellent depth of analysis with thorough exploration of ideas');
      } else if (score > 0.6) {
        feedback.push('Good analysis, consider exploring some points in more depth');
      } else {
        feedback.push('Try to provide more in-depth analysis and explanation of key points');
      }
      
      return {
        score: Math.min(1, Math.max(0, score)),
        feedback: feedback.join(' '),
        details: {
          avgSentenceLength,
          analysisIndicators,
          indicatorDensity
        }
      };
    };
    
    // Bind other methods
    this.analyzeOriginality = this.analyzeOriginality.bind(this);
    this.analyzeClarity = this.analyzeClarity.bind(this);
    
    this.dimensionAnalyzers = {
      structure: this.analyzeStructure,
      creativity: this.analyzeCreativity,
      accuracy: this.analyzeAccuracy,
      presentation: this.analyzePresentation,
      critical_thinking: this.analyzeCriticalThinking,
      originality: this.analyzeOriginality,
      clarity: this.analyzeClarity,
      depth: this.analyzeDepth
    };
  }

  /**
   * Evaluate all dimensions and calculate an overall score
   */
  async evaluate(text, assignmentType = 'essay') {
    try {
      const results = {
        dimensions: {},
        overallScore: 0,
        strengths: [],
        areasForImprovement: [],
        wordCount: text.split(/\s+/).length,
        sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        paragraphCount: text.split('\n\n').filter(p => p.trim().length > 0).length,
        readabilityScore: 0,
        feedback: ''
      };

      // Define dimensions with weights (sum should be 1.0)
      const dimensions = [
        { name: 'structure', weight: 0.20 },
        { name: 'creativity', weight: 0.15 },
        { name: 'accuracy', weight: 0.15 },
        { name: 'presentation', weight: 0.10 },
        { name: 'criticalThinking', weight: 0.20 },
        { name: 'clarity', weight: 0.10 },
        { name: 'depth', weight: 0.10 }
      ];

      // Evaluate each dimension
      let weightedScoreSum = 0;
      let totalWeight = 0;
      
      for (const { name, weight } of dimensions) {
        try {
          const analyzer = this.dimensionAnalyzers[name];
          if (!analyzer) continue;
          
          const dimensionResult = await analyzer(text, assignmentType);
          results.dimensions[name] = dimensionResult;
          
          // Apply weight to the score
          weightedScoreSum += dimensionResult.score * weight;
          totalWeight += weight;
          
          // Add to strengths or areas for improvement
          if (dimensionResult.score > 0.7) {
            results.strengths.push({
              dimension: name,
              score: dimensionResult.score,
              feedback: dimensionResult.feedback.split('. ')[0] + '.'
            });
          } else if (dimensionResult.score < 0.5) {
            results.areasForImprovement.push({
              dimension: name,
              score: dimensionResult.score,
              feedback: dimensionResult.feedback.split('. ')[0] + '.'
            });
          }
        } catch (error) {
          console.error(`Error evaluating dimension ${name}:`, error);
        }
      }

      // Calculate overall score using weighted average
      results.overallScore = totalWeight > 0 ? weightedScoreSum / totalWeight : 0;
      
      // Adjust score based on length (penalize very short essays)
      const lengthPenalty = Math.min(1, results.wordCount / 150); // 150 words is minimum expected
      results.overallScore *= lengthPenalty;
      
      // Ensure score is between 0 and 1
      results.overallScore = Math.max(0, Math.min(1, results.overallScore));
      
      // Generate overall feedback
      results.feedback = this.generateOverallFeedback(results);
      
      // Calculate readability score (Flesch-Kincaid Grade Level)
      results.readabilityScore = this.calculateReadability(text);

      return results;
    } catch (error) {
      console.error('Error in evaluate:', error);
      return {
        error: 'Failed to evaluate assignment',
        details: error.message,
        overallScore: 0.5 // Default score on error
      };
    }
  }
  
  /**
   * Generate overall feedback based on evaluation results
   */
  generateOverallFeedback(results) {
    const { overallScore, strengths, areasForImprovement } = results;
    const feedback = [];
    
    // Add overall assessment
    if (overallScore >= 0.8) {
      feedback.push('Excellent work overall!');
    } else if (overallScore >= 0.6) {
      feedback.push('Good work with room for improvement.');
    } else {
      feedback.push('Needs significant improvement.');
    }
    
    // Add strengths
    if (strengths.length > 0) {
      feedback.push('\nStrengths:');
      strengths.forEach((s, i) => {
        feedback.push(`${i + 1}. ${s.feedback} (${s.dimension}: ${(s.score * 100).toFixed(0)}%)`);
      });
    }
    
    // Add areas for improvement
    if (areasForImprovement.length > 0) {
      feedback.push('\nAreas for Improvement:');
      areasForImprovement.forEach((a, i) => {
        feedback.push(`${i + 1}. ${a.feedback} (${a.dimension}: ${(a.score * 100).toFixed(0)}%)`);
      });
    }
    
    // Add word count feedback
    if (results.wordCount < 150) {
      feedback.push('\nNote: The essay is quite short. Consider expanding your ideas to reach at least 150 words.');
    } else if (results.wordCount > 1000) {
      feedback.push('\nNote: The essay is quite long. Consider being more concise or splitting into multiple sections.');
    }
    
    return feedback.join('\n');
  }
  
  /**
   * Calculate Flesch-Kincaid Readability Score
   */
  calculateReadability(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const wordsPerSentence = words.length / sentences.length;
    const syllablesPerWord = syllables / words.length;
    
    // Flesch-Kincaid Grade Level
    const gradeLevel = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
    
    // Convert to 0-1 scale (assuming grade levels 0-16)
    return Math.max(0, Math.min(1, 1 - (gradeLevel / 16)));
  }
  
  /**
   * Count syllables in a word (approximation)
   */
  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? Math.max(1, syllables.length) : 1;
  }
  
  /**
   * Evaluate a specific dimension (legacy method)
   */
  async evaluateDimension(text, dimension, assignmentType) {
    const analyzer = this.dimensionAnalyzers[dimension];
    if (!analyzer) {
      throw new Error(`Unknown evaluation dimension: ${dimension}`);
    }
    return await analyzer(text, assignmentType);
  }

  // Add all the analysis methods here with proper implementations
  // ...

  /**
   * Analyze clarity of writing
   */
  async analyzeClarity(text, assignmentType) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    
    // Calculate average sentence length
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(1, sentences.length);
    
    // Calculate word complexity (using syllable count as a proxy)
    const complexWords = words.filter(word => {
      const syllables = word.toLowerCase().split(/[aeiouy]+/).filter(s => s).length;
      return syllables >= 3;
    });
    const complexityRatio = complexWords.length / Math.max(1, words.length);
    
    // Check for passive voice (simplified check)
    const passiveVoice = (text.match(/(is|are|was|were|be|been|being)\s+[a-z]+ed\b/gi) || []).length;
    
    // Calculate clarity score (lower is better for some metrics)
    let score = 1;
    const feedback = [];
    
    if (avgSentenceLength > 25) {
      score -= 0.2;
      feedback.push('Consider breaking up long sentences for better clarity');
    }
    
    if (complexityRatio > 0.15) {
      score -= 0.2;
      feedback.push('Some complex words could be simplified for better understanding');
    }
    
    if (passiveVoice > 3) {
      score -= 0.1;
      feedback.push('Try to use more active voice for clearer writing');
    }
    
    // Ensure score is between 0 and 1
    score = Math.max(0, Math.min(1, score));
    
    // Add positive feedback if clarity is good
    if (score > 0.8) {
      feedback.unshift('Clear and easy to understand');
    } else if (score > 0.6) {
      feedback.unshift('Generally clear, but could be improved');
    } else {
      feedback.unshift('Work on improving clarity and readability');
    }
    
    return {
      score,
      feedback: feedback.join('; '),
      details: {
        avgSentenceLength,
        complexityRatio,
        passiveVoiceCount: passiveVoice
      }
    };
  }

  /**
   * Analyze originality of ideas
   */
  async analyzeOriginality(text, assignmentType) {
    let score = 0.5; // Base score
    const feedback = [];
    
    // Check for original ideas
    const originalIdeas = this.analyzeOriginalIdeas(text);
    score += originalIdeas * 0.5;
    
    if (originalIdeas > 0.7) {
      feedback.push('Shows original thinking and ideas');
    } else {
      feedback.push('Try to develop more original ideas');
    }
    
    // Check for personal voice
    const personalVoice = this.analyzePersonalVoice(text);
    score += personalVoice * 0.5;
    
    if (personalVoice > 0.6) {
      feedback.push('Good personal voice and style');
    } else {
      feedback.push('Develop your personal voice more');
    }
    
    return {
      score: Math.min(1, score),
      feedback: feedback.join('; '),
      details: {
        originalIdeas,
        personalVoice
      }
    };
  }

  // Add other analysis methods with proper implementations
  // ...

  // Helper methods
  analyzeOriginalIdeas(text) {
    // Implement actual logic to analyze original ideas
    return 0.7; // Placeholder
  }

  analyzePersonalVoice(text) {
    // Implement actual logic to analyze personal voice
    return 0.6; // Placeholder
  }

  analyzeLogicalFlow(sentences) {
    // Implement actual logic to analyze logical flow
    return 0.7; // Placeholder
  }

  analyzeParagraphStructure(paragraphs) {
    // Implement actual logic to analyze paragraph structure
    return 0.7; // Placeholder
  }

  hasClearConclusion(conclusion) {
    // Implement actual logic to check for clear conclusion
    return true; // Placeholder
  }

  analyzeCreativeElements(text) {
    // Implement actual logic to analyze creative elements
    return {
      score: 0.7,
      feedback: ['Good creative elements'],
      details: {}
    };
  }

  analyzeUniquePerspectives(text) {
    // Implement actual logic to analyze unique perspectives
    return {
      score: 0.7,
      feedback: ['Good unique perspectives'],
      details: {}
    };
  }

  analyzeLanguageCreativity(text) {
    // Implement actual logic to analyze language creativity
    return {
      score: 0.7,
      feedback: ['Good language creativity'],
      details: {}
    };
  }

  analyzeExamplesQuality(text) {
    // Implement actual logic to analyze examples quality
    return {
      score: 0.7,
      feedback: ['Good examples'],
      details: {}
    };
  }

  // Add other helper methods as needed
  // ...
}

export default new EvaluationDimensions();
