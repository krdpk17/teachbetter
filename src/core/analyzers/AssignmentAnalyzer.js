import natural from 'natural';
import compromise from 'compromise';

export class AssignmentAnalyzer {
  constructor() {
    this.assignmentHandlers = {
      essay: this.analyzeEssay.bind(this),
      worksheet: this.analyzeWorksheet.bind(this),
      report: this.analyzeReport.bind(this),
      creative: this.analyzeCreative.bind(this),
      analysis: this.analyzeAnalysis.bind(this),
      general: this.analyzeGeneral.bind(this)
    };
  }

  /**
   * Analyze assignment based on type
   */
  async analyzeByType(text, assignmentType) {
    const handler = this.assignmentHandlers[assignmentType] || this.assignmentHandlers.general;
    return await handler(text);
  }

  /**
   * Analyze essay assignments
   */
  async analyzeEssay(text) {
    const analysis = {
      type: 'essay',
      structure: this.analyzeEssayStructure(text),
      argumentation: this.analyzeArgumentation(text),
      evidence: this.analyzeEvidence(text),
      style: this.analyzeWritingStyle(text),
      thesis: this.identifyThesis(text),
      conclusion: this.analyzeConclusion(text)
    };

    return {
      ...analysis,
      overallScore: this.calculateEssayScore(analysis),
      strengths: this.identifyEssayStrengths(analysis),
      improvements: this.identifyEssayImprovements(analysis)
    };
  }

  /**
   * Analyze worksheet assignments
   */
  async analyzeWorksheet(text) {
    const analysis = {
      type: 'worksheet',
      completeness: this.analyzeCompleteness(text),
      accuracy: this.analyzeWorksheetAccuracy(text),
      understanding: this.analyzeUnderstanding(text),
      effort: this.analyzeEffort(text),
      organization: this.analyzeWorksheetOrganization(text)
    };

    return {
      ...analysis,
      overallScore: this.calculateWorksheetScore(analysis),
      strengths: this.identifyWorksheetStrengths(analysis),
      improvements: this.identifyWorksheetImprovements(analysis)
    };
  }

  /**
   * Analyze report assignments
   */
  async analyzeReport(text) {
    const analysis = {
      type: 'report',
      structure: this.analyzeReportStructure(text),
      research: this.analyzeResearch(text),
      citations: this.analyzeCitations(text),
      objectivity: this.analyzeObjectivity(text),
      methodology: this.analyzeMethodology(text),
      findings: this.analyzeFindings(text)
    };

    return {
      ...analysis,
      overallScore: this.calculateReportScore(analysis),
      strengths: this.identifyReportStrengths(analysis),
      improvements: this.identifyReportImprovements(analysis)
    };
  }

  /**
   * Analyze creative writing assignments
   */
  async analyzeCreative(text) {
    const analysis = {
      type: 'creative',
      creativity: this.analyzeCreativity(text),
      voice: this.analyzeVoice(text),
      imagery: this.analyzeImagery(text),
      dialogue: this.analyzeDialogue(text),
      plot: this.analyzePlot(text),
      character: this.analyzeCharacter(text)
    };

    return {
      ...analysis,
      overallScore: this.calculateCreativeScore(analysis),
      strengths: this.identifyCreativeStrengths(analysis),
      improvements: this.identifyCreativeImprovements(analysis)
    };
  }

  /**
   * Analyze critical analysis assignments
   */
  async analyzeAnalysis(text) {
    const analysis = {
      type: 'analysis',
      criticalThinking: this.analyzeCriticalThinking(text),
      evidence: this.analyzeEvidence(text),
      interpretation: this.analyzeInterpretation(text),
      evaluation: this.analyzeEvaluation(text),
      synthesis: this.analyzeSynthesis(text),
      argumentation: this.analyzeArgumentation(text)
    };

    return {
      ...analysis,
      overallScore: this.calculateAnalysisScore(analysis),
      strengths: this.identifyAnalysisStrengths(analysis),
      improvements: this.identifyAnalysisImprovements(analysis)
    };
  }

  /**
   * General analysis for unknown assignment types
   */
  async analyzeGeneral(text) {
    return {
      type: 'general',
      content: this.analyzeContent(text),
      organization: this.analyzeGeneralOrganization(text),
      clarity: this.analyzeClarity(text),
      depth: this.analyzeDepth(text),
      overallScore: 0.7,
      strengths: ['Good effort'],
      improvements: ['Continue developing your ideas']
    };
  }

  // Essay-specific analysis methods
  analyzeEssayStructure(text) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const hasIntroduction = this.hasIntroduction(paragraphs[0]);
    const hasBody = paragraphs.length >= 3;
    const hasConclusion = this.hasConclusion(paragraphs[paragraphs.length - 1]);
    
    return {
      score: (hasIntroduction ? 0.4 : 0) + (hasBody ? 0.4 : 0) + (hasConclusion ? 0.2 : 0),
      hasIntroduction,
      hasBody,
      hasConclusion,
      paragraphCount: paragraphs.length
    };
  }

  analyzeArgumentation(text) {
    const argumentWords = ['argue', 'claim', 'assert', 'maintain', 'contend', 'propose'];
    const evidenceWords = ['evidence', 'proof', 'data', 'research', 'study', 'findings'];
    const counterWords = ['however', 'although', 'despite', 'nevertheless'];
    
    const lowerText = text.toLowerCase();
    const argumentCount = argumentWords.filter(word => lowerText.includes(word)).length;
    const evidenceCount = evidenceWords.filter(word => lowerText.includes(word)).length;
    const counterCount = counterWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, (argumentCount + evidenceCount + counterCount) / 5),
      argumentCount,
      evidenceCount,
      counterCount
    };
  }

  analyzeEvidence(text) {
    const evidencePatterns = [
      /according to/gi,
      /research shows/gi,
      /studies indicate/gi,
      /data suggests/gi,
      /findings show/gi
    ];
    
    let evidenceCount = 0;
    evidencePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) evidenceCount += matches.length;
    });
    
    return {
      score: Math.min(1, evidenceCount / 3),
      count: evidenceCount
    };
  }

  analyzeWritingStyle(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
    const vocabulary = this.analyzeVocabulary(text);
    
    return {
      score: this.calculateStyleScore(avgWordsPerSentence, vocabulary),
      avgWordsPerSentence,
      vocabulary
    };
  }

  identifyThesis(text) {
    const firstParagraph = text.split(/\n\s*\n/)[0];
    const thesisKeywords = ['thesis', 'main point', 'argument', 'claim', 'position'];
    const hasThesis = thesisKeywords.some(keyword => 
      firstParagraph.toLowerCase().includes(keyword)
    );
    
    return {
      score: hasThesis ? 0.8 : 0.3,
      hasThesis,
      location: 'introduction'
    };
  }

  analyzeConclusion(text) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const conclusion = paragraphs[paragraphs.length - 1];
    const conclusionKeywords = ['conclusion', 'summary', 'finally', 'overall', 'in conclusion'];
    const hasConclusion = conclusionKeywords.some(keyword => 
      conclusion.toLowerCase().includes(keyword)
    );
    
    return {
      score: hasConclusion ? 0.8 : 0.4,
      hasConclusion,
      length: conclusion.length
    };
  }

  calculateEssayScore(analysis) {
    const weights = {
      structure: 0.25,
      argumentation: 0.25,
      evidence: 0.20,
      style: 0.15,
      thesis: 0.10,
      conclusion: 0.05
    };
    
    let score = 0;
    Object.keys(weights).forEach(key => {
      score += analysis[key].score * weights[key];
    });
    
    return Math.round(score * 100) / 100;
  }

  identifyEssayStrengths(analysis) {
    const strengths = [];
    if (analysis.structure.score > 0.7) strengths.push('Well-structured essay');
    if (analysis.argumentation.score > 0.6) strengths.push('Strong argumentation');
    if (analysis.evidence.score > 0.6) strengths.push('Good use of evidence');
    if (analysis.style.score > 0.7) strengths.push('Clear writing style');
    if (analysis.thesis.score > 0.7) strengths.push('Clear thesis statement');
    return strengths;
  }

  identifyEssayImprovements(analysis) {
    const improvements = [];
    if (analysis.structure.score < 0.6) improvements.push('Improve essay structure');
    if (analysis.argumentation.score < 0.5) improvements.push('Strengthen argumentation');
    if (analysis.evidence.score < 0.5) improvements.push('Add more evidence');
    if (analysis.style.score < 0.6) improvements.push('Improve writing style');
    if (analysis.thesis.score < 0.6) improvements.push('Clarify thesis statement');
    return improvements;
  }

  // Worksheet-specific analysis methods
  analyzeCompleteness(text) {
    const questions = text.split(/\d+\./).filter(q => q.trim().length > 0);
    const answeredQuestions = questions.filter(q => q.trim().length > 10);
    
    return {
      score: answeredQuestions.length / Math.max(1, questions.length),
      totalQuestions: questions.length,
      answeredQuestions: answeredQuestions.length
    };
  }

  analyzeWorksheetAccuracy(text) {
    // This would need domain-specific knowledge
    return {
      score: 0.8, // Placeholder
      feedback: 'Accuracy assessment requires subject-specific knowledge'
    };
  }

  analyzeUnderstanding(text) {
    const understandingWords = ['because', 'therefore', 'since', 'due to', 'as a result'];
    const lowerText = text.toLowerCase();
    const understandingCount = understandingWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, understandingCount / 3),
      count: understandingCount
    };
  }

  analyzeEffort(text) {
    const wordCount = text.split(/\s+/).length;
    const avgWordsPerAnswer = wordCount / this.countQuestions(text);
    
    return {
      score: Math.min(1, avgWordsPerAnswer / 20),
      wordCount,
      avgWordsPerAnswer
    };
  }

  analyzeWorksheetOrganization(text) {
    const hasNumbering = /\d+\./.test(text);
    const hasClearAnswers = text.split(/\d+\./).length > 1;
    
    return {
      score: (hasNumbering ? 0.5 : 0) + (hasClearAnswers ? 0.5 : 0),
      hasNumbering,
      hasClearAnswers
    };
  }

  calculateWorksheetScore(analysis) {
    const weights = {
      completeness: 0.30,
      accuracy: 0.25,
      understanding: 0.20,
      effort: 0.15,
      organization: 0.10
    };
    
    let score = 0;
    Object.keys(weights).forEach(key => {
      score += analysis[key].score * weights[key];
    });
    
    return Math.round(score * 100) / 100;
  }

  identifyWorksheetStrengths(analysis) {
    const strengths = [];
    if (analysis.completeness.score > 0.8) strengths.push('Complete responses');
    if (analysis.understanding.score > 0.6) strengths.push('Good understanding');
    if (analysis.effort.score > 0.7) strengths.push('Good effort');
    if (analysis.organization.score > 0.7) strengths.push('Well organized');
    return strengths;
  }

  identifyWorksheetImprovements(analysis) {
    const improvements = [];
    if (analysis.completeness.score < 0.6) improvements.push('Answer all questions completely');
    if (analysis.understanding.score < 0.5) improvements.push('Show more understanding');
    if (analysis.effort.score < 0.6) improvements.push('Provide more detailed answers');
    if (analysis.organization.score < 0.6) improvements.push('Improve organization');
    return improvements;
  }

  // Report-specific analysis methods
  analyzeReportStructure(text) {
    const sections = ['introduction', 'methodology', 'results', 'discussion', 'conclusion'];
    const lowerText = text.toLowerCase();
    const foundSections = sections.filter(section => lowerText.includes(section));
    
    return {
      score: foundSections.length / sections.length,
      foundSections,
      totalSections: sections.length
    };
  }

  analyzeResearch(text) {
    const researchWords = ['research', 'study', 'investigation', 'analysis', 'examination'];
    const lowerText = text.toLowerCase();
    const researchCount = researchWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, researchCount / 3),
      count: researchCount
    };
  }

  analyzeCitations(text) {
    const citationPatterns = /\[[\d]+\]|\(\w+\s+\d{4}\)|et al\./gi;
    const matches = text.match(citationPatterns);
    
    return {
      score: Math.min(1, (matches ? matches.length : 0) / 5),
      count: matches ? matches.length : 0
    };
  }

  analyzeObjectivity(text) {
    const subjectiveWords = ['i think', 'i believe', 'i feel', 'in my opinion'];
    const objectiveWords = ['data shows', 'research indicates', 'studies suggest'];
    
    const lowerText = text.toLowerCase();
    const subjectiveCount = subjectiveWords.filter(phrase => lowerText.includes(phrase)).length;
    const objectiveCount = objectiveWords.filter(phrase => lowerText.includes(phrase)).length;
    
    return {
      score: Math.min(1, objectiveCount / (subjectiveCount + objectiveCount + 1)),
      subjectiveCount,
      objectiveCount
    };
  }

  analyzeMethodology(text) {
    const methodWords = ['method', 'procedure', 'process', 'approach', 'technique'];
    const lowerText = text.toLowerCase();
    const methodCount = methodWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, methodCount / 2),
      count: methodCount
    };
  }

  analyzeFindings(text) {
    const findingWords = ['found', 'discovered', 'revealed', 'showed', 'indicated'];
    const lowerText = text.toLowerCase();
    const findingCount = findingWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, findingCount / 2),
      count: findingCount
    };
  }

  calculateReportScore(analysis) {
    const weights = {
      structure: 0.20,
      research: 0.20,
      citations: 0.15,
      objectivity: 0.15,
      methodology: 0.15,
      findings: 0.15
    };
    
    let score = 0;
    Object.keys(weights).forEach(key => {
      score += analysis[key].score * weights[key];
    });
    
    return Math.round(score * 100) / 100;
  }

  identifyReportStrengths(analysis) {
    const strengths = [];
    if (analysis.structure.score > 0.7) strengths.push('Well-structured report');
    if (analysis.research.score > 0.6) strengths.push('Good research foundation');
    if (analysis.citations.score > 0.6) strengths.push('Proper citations');
    if (analysis.objectivity.score > 0.7) strengths.push('Objective presentation');
    return strengths;
  }

  identifyReportImprovements(analysis) {
    const improvements = [];
    if (analysis.structure.score < 0.6) improvements.push('Improve report structure');
    if (analysis.research.score < 0.5) improvements.push('Strengthen research');
    if (analysis.citations.score < 0.5) improvements.push('Add more citations');
    if (analysis.objectivity.score < 0.6) improvements.push('Maintain objectivity');
    return improvements;
  }

  // Creative writing analysis methods
  analyzeCreativity(text) {
    const creativeWords = ['imagine', 'creative', 'unique', 'original', 'innovative'];
    const lowerText = text.toLowerCase();
    const creativeCount = creativeWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, creativeCount / 3),
      count: creativeCount
    };
  }

  analyzeVoice(text) {
    const personalWords = ['i', 'my', 'me', 'we', 'our'];
    const words = text.split(/\s+/);
    const personalCount = words.filter(word => 
      personalWords.includes(word.toLowerCase())
    ).length;
    
    return {
      score: Math.min(1, personalCount / words.length * 10),
      personalCount,
      totalWords: words.length
    };
  }

  analyzeImagery(text) {
    const sensoryWords = ['saw', 'heard', 'felt', 'smelled', 'tasted', 'bright', 'loud', 'soft', 'sweet'];
    const lowerText = text.toLowerCase();
    const sensoryCount = sensoryWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, sensoryCount / 5),
      count: sensoryCount
    };
  }

  analyzeDialogue(text) {
    const dialoguePattern = /"[^"]*"/g;
    const matches = text.match(dialoguePattern);
    
    return {
      score: Math.min(1, (matches ? matches.length : 0) / 3),
      count: matches ? matches.length : 0
    };
  }

  analyzePlot(text) {
    const plotWords = ['beginning', 'middle', 'end', 'conflict', 'resolution', 'climax'];
    const lowerText = text.toLowerCase();
    const plotCount = plotWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, plotCount / 3),
      count: plotCount
    };
  }

  analyzeCharacter(text) {
    const characterWords = ['character', 'protagonist', 'hero', 'villain', 'personality'];
    const lowerText = text.toLowerCase();
    const characterCount = characterWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, characterCount / 2),
      count: characterCount
    };
  }

  calculateCreativeScore(analysis) {
    const weights = {
      creativity: 0.25,
      voice: 0.20,
      imagery: 0.20,
      dialogue: 0.15,
      plot: 0.10,
      character: 0.10
    };
    
    let score = 0;
    Object.keys(weights).forEach(key => {
      score += analysis[key].score * weights[key];
    });
    
    return Math.round(score * 100) / 100;
  }

  identifyCreativeStrengths(analysis) {
    const strengths = [];
    if (analysis.creativity.score > 0.6) strengths.push('Creative expression');
    if (analysis.voice.score > 0.6) strengths.push('Strong personal voice');
    if (analysis.imagery.score > 0.6) strengths.push('Good use of imagery');
    if (analysis.dialogue.score > 0.6) strengths.push('Effective dialogue');
    return strengths;
  }

  identifyCreativeImprovements(analysis) {
    const improvements = [];
    if (analysis.creativity.score < 0.5) improvements.push('Develop more creativity');
    if (analysis.voice.score < 0.5) improvements.push('Strengthen personal voice');
    if (analysis.imagery.score < 0.5) improvements.push('Add more sensory details');
    if (analysis.dialogue.score < 0.5) improvements.push('Include more dialogue');
    return improvements;
  }

  // Analysis-specific methods
  analyzeCriticalThinking(text) {
    const criticalWords = ['analyze', 'evaluate', 'critique', 'examine', 'assess', 'compare'];
    const lowerText = text.toLowerCase();
    const criticalCount = criticalWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, criticalCount / 3),
      count: criticalCount
    };
  }

  analyzeInterpretation(text) {
    const interpretWords = ['interpret', 'understand', 'meaning', 'significance', 'imply'];
    const lowerText = text.toLowerCase();
    const interpretCount = interpretWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, interpretCount / 2),
      count: interpretCount
    };
  }

  analyzeEvaluation(text) {
    const evalWords = ['evaluate', 'judge', 'assess', 'rate', 'value', 'worth'];
    const lowerText = text.toLowerCase();
    const evalCount = evalWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, evalCount / 2),
      count: evalCount
    };
  }

  analyzeSynthesis(text) {
    const synthesisWords = ['synthesize', 'combine', 'integrate', 'merge', 'unify'];
    const lowerText = text.toLowerCase();
    const synthesisCount = synthesisWords.filter(word => lowerText.includes(word)).length;
    
    return {
      score: Math.min(1, synthesisCount / 2),
      count: synthesisCount
    };
  }

  calculateAnalysisScore(analysis) {
    const weights = {
      criticalThinking: 0.25,
      evidence: 0.20,
      interpretation: 0.20,
      evaluation: 0.15,
      synthesis: 0.10,
      argumentation: 0.10
    };
    
    let score = 0;
    Object.keys(weights).forEach(key => {
      score += analysis[key].score * weights[key];
    });
    
    return Math.round(score * 100) / 100;
  }

  identifyAnalysisStrengths(analysis) {
    const strengths = [];
    if (analysis.criticalThinking.score > 0.6) strengths.push('Strong critical thinking');
    if (analysis.evidence.score > 0.6) strengths.push('Good use of evidence');
    if (analysis.interpretation.score > 0.6) strengths.push('Good interpretation');
    if (analysis.evaluation.score > 0.6) strengths.push('Effective evaluation');
    return strengths;
  }

  identifyAnalysisImprovements(analysis) {
    const improvements = [];
    if (analysis.criticalThinking.score < 0.5) improvements.push('Develop critical thinking');
    if (analysis.evidence.score < 0.5) improvements.push('Use more evidence');
    if (analysis.interpretation.score < 0.5) improvements.push('Improve interpretation');
    if (analysis.evaluation.score < 0.5) improvements.push('Strengthen evaluation');
    return improvements;
  }

  // Helper methods
  hasIntroduction(paragraph) {
    if (!paragraph) return false;
    const introKeywords = ['introduction', 'overview', 'purpose', 'aim', 'goal'];
    return introKeywords.some(keyword => 
      paragraph.toLowerCase().includes(keyword)
    ) || paragraph.length > 50;
  }

  hasConclusion(paragraph) {
    if (!paragraph) return false;
    const conclusionKeywords = ['conclusion', 'summary', 'finally', 'overall', 'in conclusion'];
    return conclusionKeywords.some(keyword => 
      paragraph.toLowerCase().includes(keyword)
    ) || paragraph.length > 30;
  }

  analyzeVocabulary(text) {
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    return {
      diversity: uniqueWords.size / words.length,
      uniqueWords: uniqueWords.size,
      totalWords: words.length
    };
  }

  calculateStyleScore(avgWordsPerSentence, vocabulary) {
    // Optimal range for sentence length is 15-25 words
    const lengthScore = Math.max(0, 1 - Math.abs(avgWordsPerSentence - 20) / 20);
    const vocabScore = Math.min(1, vocabulary.diversity * 2);
    
    return (lengthScore + vocabScore) / 2;
  }

  countQuestions(text) {
    return (text.match(/\d+\./g) || []).length;
  }

  analyzeContent(text) {
    return {
      wordCount: text.split(/\s+/).length,
      sentenceCount: text.split(/[.!?]+/).length,
      paragraphCount: text.split(/\n\s*\n/).length
    };
  }

  analyzeGeneralOrganization(text) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return {
      score: Math.min(1, paragraphs.length / 3),
      paragraphCount: paragraphs.length
    };
  }

  analyzeClarity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
    
    // Shorter sentences are generally clearer
    return Math.max(0, 1 - (avgWordsPerSentence - 15) / 20);
  }

  analyzeDepth(text) {
    const depthWords = ['specifically', 'in detail', 'thoroughly', 'comprehensive'];
    const lowerText = text.toLowerCase();
    const depthCount = depthWords.filter(word => lowerText.includes(word)).length;
    
    return Math.min(1, depthCount / 2);
  }
}

