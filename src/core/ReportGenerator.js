import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ReportGenerator {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.outputDir = path.join(__dirname, '../../output');
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.templatesDir, this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate feedback report
   */
  async generateReport(analysisResults, options = {}) {
    const {
      format = 'html',
      includeSuggestions = true,
      includeStrengths = true,
      includeImprovements = true,
      includeDetailedAnalysis = true,
      template = 'default'
    } = options;

    try {
      switch (format.toLowerCase()) {
        case 'html':
          return await this.generateHTMLReport(analysisResults, options);
        case 'json':
          return await this.generateJSONReport(analysisResults, options);
        case 'pdf':
          return await this.generatePDFReport(analysisResults, options);
        case 'csv':
          return await this.generateCSVReport(analysisResults, options);
        default:
          throw new Error(`Unsupported report format: ${format}`);
      }
    } catch (error) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport(analysisResults, options) {
    const reportData = this.prepareReportData(analysisResults, options);
    const template = await this.loadTemplate('html', 'report');
    
    const html = ejs.render(template, {
      ...reportData,
      options: options,
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    });

    // Save to file
    const fileName = `feedback-report-${Date.now()}.html`;
    const filePath = path.join(this.outputDir, fileName);
    await fs.writeFile(filePath, html, 'utf8');

    return {
      format: 'html',
      content: html,
      filePath: filePath,
      fileName: fileName,
      downloadUrl: `/download/${fileName}`
    };
  }

  /**
   * Generate JSON report
   */
  async generateJSONReport(analysisResults, options) {
    const reportData = this.prepareReportData(analysisResults, options);
    
    const jsonReport = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        totalStudents: analysisResults.length,
        options: options
      },
      students: reportData.students,
      summary: reportData.summary,
      statistics: reportData.statistics
    };

    const fileName = `feedback-report-${Date.now()}.json`;
    const filePath = path.join(this.outputDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(jsonReport, null, 2), 'utf8');

    return {
      format: 'json',
      content: jsonReport,
      filePath: filePath,
      fileName: fileName,
      downloadUrl: `/download/${fileName}`
    };
  }

  /**
   * Generate PDF report (placeholder - would need additional library)
   */
  async generatePDFReport(analysisResults, options) {
    // This would require a library like puppeteer or jsPDF
    // For now, return HTML that can be printed to PDF
    const htmlReport = await this.generateHTMLReport(analysisResults, options);
    
    return {
      format: 'pdf',
      content: htmlReport.content,
      filePath: htmlReport.filePath,
      fileName: htmlReport.fileName.replace('.html', '.pdf'),
      downloadUrl: htmlReport.downloadUrl.replace('.html', '.pdf'),
      note: 'HTML version generated. Use browser print to PDF for PDF format.'
    };
  }

  /**
   * Generate CSV report
   */
  async generateCSVReport(analysisResults, options) {
    const csvData = this.prepareCSVData(analysisResults);
    const csvContent = this.convertToCSV(csvData);

    const fileName = `feedback-report-${Date.now()}.csv`;
    const filePath = path.join(this.outputDir, fileName);
    await fs.writeFile(filePath, csvContent, 'utf8');

    return {
      format: 'csv',
      content: csvContent,
      filePath: filePath,
      fileName: fileName,
      downloadUrl: `/download/${fileName}`
    };
  }

  /**
   * Prepare report data
   */
  prepareReportData(analysisResults, options) {
    const students = analysisResults.map(result => this.prepareStudentData(result));
    const summary = this.generateSummary(students);
    const statistics = this.generateStatistics(students);

    return {
      students,
      summary,
      statistics,
      options
    };
  }

  /**
   * Prepare individual student data
   */
  prepareStudentData(result) {
    if (result.error) {
      return {
        name: result.studentName,
        fileName: result.fileName,
        error: result.error,
        hasError: true
      };
    }

    const analysis = result.analysis;
    return {
      name: result.studentName,
      fileName: result.fileName,
      hasError: false,
      overallScore: analysis.overallQuality,
      wordCount: analysis.wordCount,
      readabilityScore: analysis.readabilityScore,
      dimensions: analysis.dimensionScores,
      strengths: analysis.strengths,
      improvements: analysis.improvementAreas,
      suggestions: analysis.feedbackSuggestions,
      textAnalysis: analysis.textAnalysis,
      assignmentAnalysis: analysis.assignmentAnalysis
    };
  }

  /**
   * Generate summary
   */
  generateSummary(students) {
    const validStudents = students.filter(s => !s.hasError);
    const totalStudents = students.length;
    const processedStudents = validStudents.length;
    const errorCount = totalStudents - processedStudents;

    if (validStudents.length === 0) {
      return {
        totalStudents,
        processedStudents: 0,
        errorCount,
        averageScore: 0,
        scoreDistribution: { high: 0, medium: 0, low: 0 },
        commonStrengths: [],
        commonImprovements: []
      };
    }

    const scores = validStudents.map(s => s.overallScore);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const scoreDistribution = {
      high: scores.filter(s => s >= 0.8).length,
      medium: scores.filter(s => s >= 0.6 && s < 0.8).length,
      low: scores.filter(s => s < 0.6).length
    };

    const allStrengths = validStudents.flatMap(s => s.strengths || []);
    const allImprovements = validStudents.flatMap(s => s.improvements || []);

    const commonStrengths = this.getMostCommon(allStrengths, 5);
    const commonImprovements = this.getMostCommon(allImprovements, 5);

    return {
      totalStudents,
      processedStudents,
      errorCount,
      averageScore: Math.round(averageScore * 100) / 100,
      scoreDistribution,
      commonStrengths,
      commonImprovements
    };
  }

  /**
   * Generate statistics
   */
  generateStatistics(students) {
    const validStudents = students.filter(s => !s.hasError);
    
    if (validStudents.length === 0) {
      return {};
    }

    const wordCounts = validStudents.map(s => s.wordCount || 0);
    const readabilityScores = validStudents.map(s => s.readabilityScore || 0);
    const overallScores = validStudents.map(s => s.overallScore || 0);

    return {
      wordCount: {
        average: Math.round(wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length),
        min: Math.min(...wordCounts),
        max: Math.max(...wordCounts)
      },
      readability: {
        average: Math.round(readabilityScores.reduce((sum, score) => sum + score, 0) / readabilityScores.length * 100) / 100,
        min: Math.min(...readabilityScores),
        max: Math.max(...readabilityScores)
      },
      overallScore: {
        average: Math.round(overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length * 100) / 100,
        min: Math.min(...overallScores),
        max: Math.max(...overallScores)
      }
    };
  }

  /**
   * Prepare CSV data
   */
  prepareCSVData(analysisResults) {
    const headers = [
      'Student Name',
      'File Name',
      'Overall Score',
      'Word Count',
      'Readability Score',
      'Structure Score',
      'Creativity Score',
      'Accuracy Score',
      'Presentation Score',
      'Strengths',
      'Improvements',
      'Error'
    ];

    const rows = analysisResults.map(result => {
      if (result.error) {
        return [
          result.studentName,
          result.fileName,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          result.error
        ];
      }

      const analysis = result.analysis;
      const dimensions = analysis.dimensionScores || {};
      
      return [
        result.studentName,
        result.fileName,
        analysis.overallQuality || '',
        analysis.wordCount || '',
        analysis.readabilityScore || '',
        dimensions.structure?.score || '',
        dimensions.creativity?.score || '',
        dimensions.accuracy?.score || '',
        dimensions.presentation?.score || '',
        (analysis.strengths || []).join('; '),
        (analysis.improvementAreas || []).map(area => area.dimension).join('; '),
        ''
      ];
    });

    return [headers, ...rows];
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    return data.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
  }

  /**
   * Load template
   */
  async loadTemplate(format, templateName) {
    const templatePath = path.join(this.templatesDir, format, `${templateName}.ejs`);
    
    if (!await fs.pathExists(templatePath)) {
      // Return default template if custom template doesn't exist
      return this.getDefaultTemplate(format);
    }
    
    return await fs.readFile(templatePath, 'utf8');
  }

  /**
   * Get default template
   */
  getDefaultTemplate(format) {
    if (format === 'html') {
      return this.getDefaultHTMLTemplate();
    }
    return '';
  }

  /**
   * Get default HTML template
   */
  getDefaultHTMLTemplate() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bulk Feedback Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .student { border: 1px solid #ddd; margin: 20px 0; padding: 15px; border-radius: 5px; }
        .error { background: #ffebee; border-color: #f44336; }
        .score { font-weight: bold; color: #2196f3; }
        .strengths { background: #e8f5e8; padding: 10px; margin: 10px 0; border-radius: 3px; }
        .improvements { background: #fff3e0; padding: 10px; margin: 10px 0; border-radius: 3px; }
        .dimensions { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
        .dimension { background: #f9f9f9; padding: 10px; border-radius: 3px; }
        .summary { background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .statistics { background: #f3e5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
        h1, h2, h3 { color: #333; }
        .score-high { color: #4caf50; }
        .score-medium { color: #ff9800; }
        .score-low { color: #f44336; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📝 Bulk Feedback Report</h1>
        <p>Generated on: <%= generatedAt %></p>
        <p>Total Students: <%= summary.totalStudents %></p>
        <p>Successfully Processed: <%= summary.processedStudents %></p>
        <% if (summary.errorCount > 0) { %>
        <p style="color: #f44336;">Errors: <%= summary.errorCount %></p>
        <% } %>
    </div>

    <% if (summary.processedStudents > 0) { %>
    <div class="summary">
        <h2>📊 Summary</h2>
        <p><strong>Average Score:</strong> <span class="score"><%= summary.averageScore %></span></p>
        <p><strong>Score Distribution:</strong></p>
        <ul>
            <li>High (≥0.8): <%= summary.scoreDistribution.high %> students</li>
            <li>Medium (0.6-0.8): <%= summary.scoreDistribution.medium %> students</li>
            <li>Low (<0.6): <%= summary.scoreDistribution.low %> students</li>
        </ul>
        
        <% if (summary.commonStrengths.length > 0) { %>
        <p><strong>Common Strengths:</strong></p>
        <ul>
            <% summary.commonStrengths.forEach(strength => { %>
            <li><%= strength %></li>
            <% }); %>
        </ul>
        <% } %>
        
        <% if (summary.commonImprovements.length > 0) { %>
        <p><strong>Common Areas for Improvement:</strong></p>
        <ul>
            <% summary.commonImprovements.forEach(improvement => { %>
            <li><%= improvement %></li>
            <% }); %>
        </ul>
        <% } %>
    </div>

    <div class="statistics">
        <h2>📈 Statistics</h2>
        <p><strong>Word Count:</strong> Avg <%= statistics.wordCount?.average || 0 %>, Range: <%= statistics.wordCount?.min || 0 %>-<%= statistics.wordCount?.max || 0 %></p>
        <p><strong>Readability:</strong> Avg <%= statistics.readability?.average || 0 %>, Range: <%= statistics.readability?.min || 0 %>-<%= statistics.readability?.max || 0 %></p>
        <p><strong>Overall Score:</strong> Avg <%= statistics.overallScore?.average || 0 %>, Range: <%= statistics.overallScore?.min || 0 %>-<%= statistics.overallScore?.max || 0 %></p>
    </div>
    <% } %>

    <h2>👥 Individual Student Reports</h2>
    <% students.forEach(student => { %>
    <div class="student <%= student.hasError ? 'error' : '' %>">
        <h3><%= student.name %></h3>
        <p><strong>File:</strong> <%= student.fileName %></p>
        
        <% if (student.hasError) { %>
        <p style="color: #f44336;"><strong>Error:</strong> <%= student.error %></p>
        <% } else { %>
        <p><strong>Overall Score:</strong> 
            <span class="score score-<%= student.overallScore >= 0.8 ? 'high' : student.overallScore >= 0.6 ? 'medium' : 'low' %>">
                <%= student.overallScore %>
            </span>
        </p>
        <p><strong>Word Count:</strong> <%= student.wordCount %></p>
        <p><strong>Readability Score:</strong> <%= student.readabilityScore %></p>
        
        <% if (student.dimensions && Object.keys(student.dimensions).length > 0) { %>
        <div class="dimensions">
            <% Object.entries(student.dimensions).forEach(([dimension, data]) => { %>
            <div class="dimension">
                <strong><%= dimension.charAt(0).toUpperCase() + dimension.slice(1) %>:</strong>
                <span class="score score-<%= data.score >= 0.8 ? 'high' : data.score >= 0.6 ? 'medium' : 'low' %>">
                    <%= data.score %>
                </span>
                <p><%= data.feedback %></p>
            </div>
            <% }); %>
        </div>
        <% } %>
        
        <% if (student.strengths && student.strengths.length > 0) { %>
        <div class="strengths">
            <h4>✅ Strengths</h4>
            <ul>
                <% student.strengths.forEach(strength => { %>
                <li><%= strength.description || strength %></li>
                <% }); %>
            </ul>
        </div>
        <% } %>
        
        <% if (student.improvements && student.improvements.length > 0) { %>
        <div class="improvements">
            <h4>🔧 Areas for Improvement</h4>
            <ul>
                <% student.improvements.forEach(improvement => { %>
                <li><strong><%= improvement.dimension %>:</strong> <%= improvement.description %></li>
                <% }); %>
            </ul>
        </div>
        <% } %>
        
        <% if (student.suggestions && student.suggestions.length > 0) { %>
        <div class="suggestions">
            <h4>💡 Suggestions</h4>
            <ul>
                <% student.suggestions.forEach(suggestion => { %>
                <li><strong><%= suggestion.category %>:</strong> <%= suggestion.suggestion %></li>
                <% }); %>
            </ul>
        </div>
        <% } %>
        <% } %>
    </div>
    <% }); %>
</body>
</html>`;
  }

  /**
   * Get most common items
   */
  getMostCommon(items, limit = 5) {
    const counts = {};
    items.forEach(item => {
      const key = typeof item === 'string' ? item : item.dimension || item.description || item;
      counts[key] = (counts[key] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }

  /**
   * Generate individual student report
   */
  async generateIndividualReport(studentData, options = {}) {
    const reportData = {
      student: studentData,
      generatedAt: new Date().toISOString(),
      options
    };

    const template = await this.loadTemplate('html', 'individual');
    const html = ejs.render(template, reportData);

    const fileName = `student-${studentData.name.replace(/\s+/g, '-')}-${Date.now()}.html`;
    const filePath = path.join(this.outputDir, fileName);
    await fs.writeFile(filePath, html, 'utf8');

    return {
      format: 'html',
      content: html,
      filePath: filePath,
      fileName: fileName,
      downloadUrl: `/download/${fileName}`
    };
  }

  /**
   * Generate comparison report
   */
  async generateComparisonReport(analysisResults, options = {}) {
    const students = analysisResults.map(result => this.prepareStudentData(result));
    const validStudents = students.filter(s => !s.hasError);
    
    if (validStudents.length < 2) {
      throw new Error('At least 2 students required for comparison report');
    }

    const comparisonData = {
      students: validStudents,
      comparison: this.generateComparisonData(validStudents),
      generatedAt: new Date().toISOString(),
      options
    };

    const template = await this.loadTemplate('html', 'comparison');
    const html = ejs.render(template, comparisonData);

    const fileName = `comparison-report-${Date.now()}.html`;
    const filePath = path.join(this.outputDir, fileName);
    await fs.writeFile(filePath, html, 'utf8');

    return {
      format: 'html',
      content: html,
      filePath: filePath,
      fileName: fileName,
      downloadUrl: `/download/${fileName}`
    };
  }

  /**
   * Generate comparison data
   */
  generateComparisonData(students) {
    const dimensions = ['structure', 'creativity', 'accuracy', 'presentation'];
    const comparison = {};

    dimensions.forEach(dimension => {
      const scores = students.map(s => s.dimensions?.[dimension]?.score || 0);
      comparison[dimension] = {
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        highest: Math.max(...scores),
        lowest: Math.min(...scores),
        range: Math.max(...scores) - Math.min(...scores)
      };
    });

    return comparison;
  }
}

