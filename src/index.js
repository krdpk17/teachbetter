import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { FeedbackProcessor } from './core/FeedbackProcessor.js';
import { FileUploadHandler } from './core/FileUploadHandler.js';
import { ReportGenerator } from './core/ReportGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Initialize core components
const feedbackProcessor = new FeedbackProcessor();
const fileUploadHandler = new FileUploadHandler();
const reportGenerator = new ReportGenerator();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Upload and process files
app.post('/api/upload', async (req, res) => {
  try {
    const { files, assignmentType, evaluationCriteria } = req.body;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const results = await feedbackProcessor.processBulkAssignments(files, {
      assignmentType: assignmentType || 'general',
      evaluationCriteria: evaluationCriteria || ['structure', 'creativity', 'accuracy', 'presentation']
    });

    res.json({
      success: true,
      processedCount: results.length,
      results: results
    });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ 
      error: 'Failed to process files', 
      details: error.message 
    });
  }
});

// Generate feedback report
app.post('/api/generate-report', async (req, res) => {
  try {
    const { analysisResults, reportFormat, includeSuggestions } = req.body;
    
    const report = await reportGenerator.generateReport(analysisResults, {
      format: reportFormat || 'html',
      includeSuggestions: includeSuggestions !== false
    });

    res.json({
      success: true,
      report: report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      error: 'Failed to generate report', 
      details: error.message 
    });
  }
});

// Get supported file types
app.get('/api/supported-types', (req, res) => {
  res.json({
    supportedTypes: [
      { type: 'essay', extensions: ['.txt', '.docx', '.pdf'], description: 'Written essays and compositions' },
      { type: 'worksheet', extensions: ['.txt', '.docx', '.pdf'], description: 'Worksheet responses and answers' },
      { type: 'report', extensions: ['.txt', '.docx', '.pdf'], description: 'Research reports and projects' },
      { type: 'creative', extensions: ['.txt', '.docx', '.pdf'], description: 'Creative writing and stories' },
      { type: 'analysis', extensions: ['.txt', '.docx', '.pdf'], description: 'Analysis and critical thinking responses' }
    ],
    evaluationDimensions: [
      'structure',
      'creativity', 
      'accuracy',
      'presentation',
      'critical_thinking',
      'originality',
      'clarity',
      'depth'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Bulk Feedback Generator running on port ${PORT}`);
  console.log(`📝 Visit http://localhost:${PORT} to start using the tool`);
});

export default app;
