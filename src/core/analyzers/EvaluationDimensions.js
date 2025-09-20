import natural from 'natural';
import compromise from 'compromise';

export class EvaluationDimensions {
  constructor() {
    this.dimensionAnalyzers = {
      structure: this.analyzeStructure.bind(this),
      creativity: this.analyzeCreativity.bind(this),
      accuracy: this.analyzeAccuracy.bind(this),
      presentation: this.analyzePresentation.bind(this),
      critical_thinking: this.analyzeCriticalThinking.bind(this),
      originality: this.analyzeOriginality.bind(this),
      clarity: this.analyzeClarity.bind(this),
      depth: this.analyzeDepth.bind(this)
    };
  }

  /**
   * Evaluate a specific dimension
   */
  async evaluate(text, dimension, assignmentType) {
    const analyzer = this.dimensionAnalyzers[dimension];
    if (!analyzer) {
      throw new Error(`Unknown evaluation dimension: ${dimension}`);
    }
    
    return await analyzer(text, assignmentType);
  }

  /**
   * Analyze structure and organization
   */
  async analyzeStructure(text, assignmentType) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let score = 0;
    const feedback = [];
    
    // Check for clear introduction
    const hasIntroduction = this.hasClearIntroduction(paragraphs[0]);
    if (hasIntroduction) {
      score += 0.2;
      feedback.push('Good introduction that sets up the topic');
    } else {
      feedback.push('Consider adding a clearer introduction');
    }
    
    // Check for logical flow
    const flowScore = this.analyzeLogicalFlow(sentences);
    score += flowScore * 0.3;
    if (flowScore > 0.7) {
      feedback.push('Good logical flow between ideas');
    } else {
      feedback.push('Work on improving the logical flow between sentences');
    }
    
    // Check for conclusion
    const hasConclusion = this.hasClearConclusion(paragraphs[paragraphs.length - 1]);
    if (hasConclusion) {
      score += 0.2;
      feedback.push('Good conclusion that summarizes key points');
    } else {
      feedback.push('Consider adding a stronger conclusion');
    }
    
    // Check paragraph structure
    const paragraphScore = this.analyzeParagraphStructure(paragraphs);
    score += paragraphScore * 0.3;
    if (paragraphScore > 0.7) {
      feedback.push('Well-structured paragraphs with clear topic sentences');
    } else {
      feedback.push('Work on paragraph structure and topic sentences');
    }
    
    return {
      score: Math.min(1, score),
      feedback: feedback.join('; '),
      details: {
        hasIntroduction,
        hasConclusion,
        flowScore,
        paragraphScore
      }
    };
  }

  /**
   * Analyze creativity and originality
   */
  async analyzeCreativity(text, assignmentType) {
    let score = 0;
    const feedback = [];
    
    // Check for creative language use
    const creativeLanguage = this.analyzeCreativeLanguage(text);
    score += creativeLanguage * 0.4;
    if (creativeLanguage > 0.6) {
      feedback.push('Good use of creative and varied language');
    } else {
      feedback.push('Try to use more creative and varied language');
    }
    
    // Check for unique perspectives
    const uniquePerspectives = this.analyzeUniquePerspectives(text);
    score += uniquePerspectives * 0.3;
    if (uniquePerspectives > 0.6) {
      feedback.push('Shows unique perspectives and original thinking');
    } else {
      feedback.push('Consider adding more unique perspectives');
    }
    
    // Check for creative examples
    const creativeExamples = this.analyzeCreativeExamples(text);
    score += creativeExamples * 0.3;
    if (creativeExamples > 0.6) {
      feedback.push('Good use of creative examples and illustrations');
    } else {
      feedback.push('Try to include more creative examples');
    }
    
    return {
      score: Math.min(1, score),
      feedback: feedback.join('; '),
      details: {
        creativeLanguage,
        uniquePerspectives,
        creativeExamples
      }
    };
  }

  /**
   * Analyze accuracy and correctness
   */
  async analyzeAccuracy(text, assignmentType) {
    let score = 0.8; // Start with high score, deduct for issues
    const feedback = [];
    const issues = [];
    
    // Check for factual consistency
    const consistencyScore = this.checkFactualConsistency(text);
    if (consistencyScore < 0.8) {
      score -= 0.2;
      issues.push('Some factual inconsistencies detected');
    }
    
    // Check for proper citations (if applicable)
    const citationScore = this.checkCitations(text);
    if (citationScore < 0.5) {
      score -= 0.1;
      issues.push('Consider adding proper citations');
    }
    
    // Check for logical consistency
    const logicalConsistency = this.checkLogicalConsistency(text);
    if (logicalConsistency < 0.7) {
      score -= 0.1;
      issues.push('Some logical inconsistencies detected');
    }
    
    if (issues.length === 0) {
      feedback.push('Good accuracy and factual correctness');
    } else {
      feedback.push(...issues);
    }
    
    return {
      score: Math.max(0, score),
      feedback: feedback.join('; '),
      details: {
        consistencyScore,
        citationScore,
        logicalConsistency
      }
    };
  }

  /**
   * Analyze presentation and formatting
   */
  async analyzePresentation(text, assignmentType) {
    let score = 0;
    const feedback = [];
    
    // Check grammar and spelling
    const grammarScore = this.checkGrammar(text);
    score += grammarScore * 0.4;
    if (grammarScore > 0.8) {
      feedback.push('Good grammar and spelling');
    } else {
      feedback.push('Work on improving grammar and spelling');
    }
    
    // Check formatting
    const formattingScore = this.checkFormatting(text);
    score += formattingScore * 0.3;
    if (formattingScore > 0.7) {
      feedback.push('Good formatting and structure');
    } else {
      feedback.push('Improve formatting and structure');
    }
    
    // Check clarity
    const clarityScore = this.checkClarity(text);
    score += clarityScore * 0.3;
    if (clarityScore > 0.7) {
      feedback.push('Clear and easy to understand');
    } else {
      feedback.push('Work on making your writing clearer');
    }
    
    return {
      score: Math.min(1, score),
      feedback: feedback.join('; '),
      details: {
        grammarScore,
        formattingScore,
        clarityScore
      }
    };
  }

  /**
   * Analyze critical thinking
   */
  async analyzeCriticalThinking(text, assignmentType) {
    let score = 0;
    const feedback = [];
    
    // Check for analysis depth
    const analysisDepth = this.analyzeAnalysisDepth(text);
    score += analysisDepth * 0.4;
    if (analysisDepth > 0.7) {
      feedback.push('Good depth of analysis');
    } else {
      feedback.push('Try to provide deeper analysis');
    }
    
    // Check for evidence use
    const evidenceUse = this.analyzeEvidenceUse(text);
    score += evidenceUse * 0.3;
    if (evidenceUse > 0.7) {
      feedback.push('Good use of evidence to support arguments');
    } else {
      feedback.push('Support your arguments with more evidence');
    }
    
    // Check for counterarguments
    const counterarguments = this.analyzeCounterarguments(text);
    score += counterarguments * 0.3;
    if (counterarguments > 0.6) {
      feedback.push('Good consideration of different perspectives');
    } else {
      feedback.push('Consider addressing counterarguments');
    }
    
    return {
      score: Math.min(1, score),
      feedback: feedback.join('; '),
      details: {
        analysisDepth,
        evidenceUse,
        counterarguments
      }
    };
  }

  /**
   * Analyze originality
   */
  async analyzeOriginality(text, assignmentType) {
    let score = 0;
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

  /**
   * Analyze clarity
   */
  async analyzeClarity(text, assignmentType) {
    let score = 0;
    const feedback = [];
    
    // Check sentence clarity
    const sentenceClarity = this.analyzeSentenceClarity(text);
    score += sentenceClarity * 0.4;
    if (sentenceClarity > 0.7) {
      feedback.push('Clear and well-structured sentences');
    } else {
      feedback.push('Work on making sentences clearer');
    }
    
    // Check word choice
    const wordChoice = this.analyzeWordChoice(text);
    score += wordChoice * 0.3;
    if (wordChoice > 0.7) {
      feedback.push('Good word choice and vocabulary');
    } else {
      feedback.push('Improve word choice for better clarity');
    }
    
    // Check overall coherence
    const coherence = this.analyzeCoherence(text);
    score += coherence * 0.3;
    if (coherence > 0.7) {
      feedback.push('Good overall coherence and flow');
    } else {
      feedback.push('Work on improving overall coherence');
    }
    
    return {
      score: Math.min(1, score),
      feedback: feedback.join('; '),
      details: {
        sentenceClarity,
        wordChoice,
        coherence
      }
    };
  }

  /**
   * Analyze depth
   */
  async analyzeDepth(text, assignmentType) {
    let score = 0;
    const feedback = [];
    
    // Check for detailed explanations
    const detailedExplanations = this.analyzeDetailedExplanations(text);
    score += detailedExplanations * 0.4;
    if (detailedExplanations > 0.7) {
      feedback.push('Good depth of explanation and detail');
    } else {
      feedback.push('Provide more detailed explanations');
    }
    
    // Check for comprehensive coverage
    const comprehensiveCoverage = this.analyzeComprehensiveCoverage(text);
    score += comprehensiveCoverage * 0.3;
    if (comprehensiveCoverage > 0.7) {
      feedback.push('Comprehensive coverage of the topic');
    } else {
      feedback.push('Cover the topic more comprehensively');
    }
    
    // Check for nuanced understanding
    const nuancedUnderstanding = this.analyzeNuancedUnderstanding(text);
    score += nuancedUnderstanding * 0.3;
    if (nuancedUnderstanding > 0.7) {
      feedback.push('Shows nuanced understanding of the topic');
    } else {
      feedback.push('Develop more nuanced understanding');
    }
    
    return {
      score: Math.min(1, score),
      feedback: feedback.join('; '),
      details: {
        detailedExplanations,
        comprehensiveCoverage,
        nuancedUnderstanding
      }
    };
  }

  // Helper methods for analysis
  hasClearIntroduction(paragraph) {
    if (!paragraph) return false;
    const introKeywords = ['introduction', 'overview', 'purpose', 'aim', 'goal'];
    return introKeywords.some(keyword => 
      paragraph.toLowerCase().includes(keyword)
    ) || paragraph.length > 50;
  }

  hasClearConclusion(paragraph) {
    if (!paragraph) return false;
    const conclusionKeywords = ['conclusion', 'summary', 'finally', 'overall', 'in conclusion'];
    return conclusionKeywords.some(keyword => 
      paragraph.toLowerCase().includes(keyword)
    ) || paragraph.length > 30;
  }

  analyzeLogicalFlow(sentences) {
    // Simplified flow analysis - check for transition words
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'additionally', 'consequently', 'meanwhile', 'similarly'];
    let transitionCount = 0;
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      transitionWords.forEach(word => {
        if (lowerSentence.includes(word)) {
          transitionCount++;
        }
      });
    });
    
    return Math.min(1, transitionCount / sentences.length * 2);
  }

  analyzeParagraphStructure(paragraphs) {
    let score = 0;
    paragraphs.forEach(paragraph => {
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length >= 3) {
        score += 0.2; // Good paragraph length
      }
      if (sentences[0] && sentences[0].length > 20) {
        score += 0.1; // Likely has topic sentence
      }
    });
    
    return Math.min(1, score / paragraphs.length);
  }

  analyzeCreativeLanguage(text) {
    const words = text.split(/\s+/);
    const creativeWords = words.filter(word => 
      word.length > 6 && /[aeiou]{2,}/.test(word.toLowerCase())
    );
    return Math.min(1, creativeWords.length / words.length * 10);
  }

  analyzeUniquePerspectives(text) {
    const perspectiveWords = ['i believe', 'i think', 'in my opinion', 'personally', 'from my perspective'];
    const lowerText = text.toLowerCase();
    const perspectiveCount = perspectiveWords.filter(phrase => 
      lowerText.includes(phrase)
    ).length;
    return Math.min(1, perspectiveCount / 3);
  }

  analyzeCreativeExamples(text) {
    const exampleWords = ['for example', 'for instance', 'such as', 'like', 'imagine'];
    const lowerText = text.toLowerCase();
    const exampleCount = exampleWords.filter(phrase => 
      lowerText.includes(phrase)
    ).length;
    return Math.min(1, exampleCount / 2);
  }

  checkFactualConsistency(text) {
    // Simplified consistency check
    return 0.9; // Placeholder - would need domain-specific knowledge
  }

  checkCitations(text) {
    const citationPatterns = /\[[\d]+\]|\(\w+\s+\d{4}\)|et al\.|according to|source:/gi;
    const matches = text.match(citationPatterns);
    return Math.min(1, (matches ? matches.length : 0) / 3);
  }

  checkLogicalConsistency(text) {
    // Simplified logical consistency check
    return 0.8; // Placeholder
  }

  checkGrammar(text) {
    // Simplified grammar check
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let correctSentences = 0;
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed[0] === trimmed[0].toUpperCase() && trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')) {
        correctSentences++;
      }
    });
    
    return correctSentences / sentences.length;
  }

  checkFormatting(text) {
    // Check for basic formatting
    const hasParagraphs = text.includes('\n\n');
    const hasProperSpacing = !text.includes('  '); // No double spaces
    const hasProperPunctuation = /[.!?]$/.test(text.trim());
    
    let score = 0;
    if (hasParagraphs) score += 0.4;
    if (hasProperSpacing) score += 0.3;
    if (hasProperPunctuation) score += 0.3;
    
    return score;
  }

  checkClarity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
    
    // Shorter sentences are generally clearer
    const clarityScore = Math.max(0, 1 - (avgWordsPerSentence - 15) / 20);
    return Math.min(1, clarityScore);
  }

  analyzeAnalysisDepth(text) {
    const analysisWords = ['analyze', 'examine', 'investigate', 'explore', 'consider', 'evaluate'];
    const lowerText = text.toLowerCase();
    const analysisCount = analysisWords.filter(word => lowerText.includes(word)).length;
    return Math.min(1, analysisCount / 3);
  }

  analyzeEvidenceUse(text) {
    const evidenceWords = ['evidence', 'data', 'research', 'study', 'findings', 'statistics'];
    const lowerText = text.toLowerCase();
    const evidenceCount = evidenceWords.filter(word => lowerText.includes(word)).length;
    return Math.min(1, evidenceCount / 2);
  }

  analyzeCounterarguments(text) {
    const counterWords = ['however', 'although', 'despite', 'nevertheless', 'on the other hand'];
    const lowerText = text.toLowerCase();
    const counterCount = counterWords.filter(phrase => lowerText.includes(phrase)).length;
    return Math.min(1, counterCount / 2);
  }

  analyzeOriginalIdeas(text) {
    const originalWords = ['unique', 'original', 'novel', 'innovative', 'creative'];
    const lowerText = text.toLowerCase();
    const originalCount = originalWords.filter(word => lowerText.includes(word)).length;
    return Math.min(1, originalCount / 2);
  }

  analyzePersonalVoice(text) {
    const personalWords = ['i', 'my', 'me', 'we', 'our'];
    const words = text.split(/\s+/);
    const personalCount = words.filter(word => 
      personalWords.includes(word.toLowerCase())
    ).length;
    return Math.min(1, personalCount / words.length * 10);
  }

  analyzeSentenceClarity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let clearSentences = 0;
    
    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/);
      // Shorter sentences with clear structure are clearer
      if (words.length <= 25 && words.length >= 5) {
        clearSentences++;
      }
    });
    
    return clearSentences / sentences.length;
  }

  analyzeWordChoice(text) {
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const vocabularyDiversity = uniqueWords.size / words.length;
    return Math.min(1, vocabularyDiversity * 3);
  }

  analyzeCoherence(text) {
    // Check for topic consistency
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0];
    const lastSentence = sentences[sentences.length - 1];
    
    // Simple coherence check - would need more sophisticated analysis
    return 0.8; // Placeholder
  }

  analyzeDetailedExplanations(text) {
    const detailWords = ['specifically', 'in detail', 'thoroughly', 'comprehensive', 'extensive'];
    const lowerText = text.toLowerCase();
    const detailCount = detailWords.filter(phrase => lowerText.includes(phrase)).length;
    return Math.min(1, detailCount / 2);
  }

  analyzeComprehensiveCoverage(text) {
    const coverageWords = ['aspects', 'elements', 'components', 'factors', 'dimensions'];
    const lowerText = text.toLowerCase();
    const coverageCount = coverageWords.filter(word => lowerText.includes(word)).length;
    return Math.min(1, coverageCount / 2);
  }

  analyzeNuancedUnderstanding(text) {
    const nuanceWords = ['however', 'although', 'whereas', 'similarly', 'conversely', 'moreover'];
    const lowerText = text.toLowerCase();
    const nuanceCount = nuanceWords.filter(word => lowerText.includes(word)).length;
    return Math.min(1, nuanceCount / 3);
  }
}

