import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { FeedbackProcessor } from './core/FeedbackProcessor.js';
import { FileUploadHandler } from './core/FileUploadHandler.js';
import { ReportGenerator } from './core/ReportGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https: http:"],
      connectSrc: ["'self'"],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

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

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    files: 10 // Maximum number of files
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, DOCX, DOC, and TXT files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
}).array('files');

// Upload and process files
app.post('/api/upload', (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({ 
          error: 'File upload failed',
          details: err.message 
        });
      }

      const files = req.files;
      const { assignmentType, evaluationCriteria } = req.body;
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      // Parse evaluation criteria if it's a JSON string
      let criteria = ['structure', 'creativity', 'accuracy', 'presentation'];
      try {
        if (evaluationCriteria) {
          criteria = JSON.parse(evaluationCriteria);
        }
      } catch (e) {
        console.warn('Error parsing evaluation criteria, using default', e);
      }

      // Filter out includeSuggestions from criteria as it's not an evaluation dimension
      const filteredCriteria = Array.isArray(criteria) 
        ? criteria.filter(c => c !== 'includeSuggestions')
        : ['structure', 'creativity', 'accuracy', 'presentation'];

      // Read file contents and prepare for processing
      const filesWithContent = await Promise.all(files.map(async (file) => {
        const fs = await import('fs/promises');
        const buffer = await fs.readFile(file.path);
        return {
          path: file.path,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: buffer,
          content: buffer.toString('utf8')
        };
      }));

      const results = await feedbackProcessor.processBulkAssignments(
        filesWithContent,
        {
          assignmentType: assignmentType || 'general',
          evaluationCriteria: filteredCriteria,
          includeSuggestions: criteria.includes('includeSuggestions')
        }
      );

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
