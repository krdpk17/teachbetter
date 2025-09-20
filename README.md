# 📝 Bulk Feedback Report Generator

A powerful tool designed to help teachers provide high-quality, personalized, and constructive feedback on student assignments at scale—without assigning marks. This tool automatically analyzes written or worksheet-based student responses in bulk, identifies key evaluation dimensions, highlights errors, and suggests clear areas for improvement.

## ✨ Features

### 🎯 Core Functionality
- **Bulk Processing**: Analyze multiple student assignments simultaneously
- **Multiple File Formats**: Support for TXT, PDF, DOCX, and DOC files
- **Assignment Types**: Specialized analysis for essays, worksheets, reports, creative writing, and critical analysis
- **No Marks**: Focus on constructive feedback without numerical grading

### 📊 Evaluation Dimensions
- **Structure**: Organization, logical flow, and clear presentation
- **Creativity**: Original thinking, unique perspectives, and creative expression
- **Accuracy**: Factual correctness, consistency, and proper citations
- **Presentation**: Grammar, formatting, and overall clarity
- **Critical Thinking**: Analysis depth, evidence use, and argumentation
- **Originality**: Unique ideas and personal voice
- **Clarity**: Sentence structure, word choice, and coherence
- **Depth**: Detailed explanations and comprehensive coverage

### 📄 Report Formats
- **HTML**: Beautiful, interactive reports with visual indicators
- **JSON**: Structured data for integration with other tools
- **CSV**: Spreadsheet-compatible format for further analysis
- **PDF**: Print-ready reports (via HTML to PDF conversion)

### 🔧 Advanced Features
- **Intelligent Analysis**: Natural language processing for content analysis
- **Personalized Feedback**: Tailored suggestions based on assignment type
- **Error Detection**: Grammar and style issue identification
- **Readability Assessment**: Flesch Reading Ease scoring
- **Sentiment Analysis**: Understanding of tone and approach
- **Vocabulary Analysis**: Word diversity and complexity assessment

## 📖 User Guide

For detailed instructions on using the Bulk Feedback Generator, please refer to our comprehensive [User Guide](USER_GUIDE.md). The guide covers:

- How to upload and process assignments
- Understanding the feedback report
- Interpreting scores and improvement areas
- Making the most of grammar and style feedback
- Tips for using feedback effectively

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bulk-feedback-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## 🧪 Testing

The project includes a comprehensive test suite to ensure code quality and reliability.

### Running Tests

Run all tests:
```bash
npm test
```

Run unit tests only:
```bash
npm run test:unit
```

Run integration tests only:
```bash
npm run test:integration
```

### Test Coverage

Generate a test coverage report:
```bash
npm run test:coverage
```

This will generate both a text summary in the console and a detailed HTML report in the `coverage` directory. Open `coverage/index.html` in your browser to view the interactive coverage report.

Current test coverage:
- **Statements**: 51.29%
- **Branches**: 83.65%
- **Functions**: 59.23%
- **Lines**: 51.29%

For CI/CD integration, use:
```bash
npm run test:coverage:ci
```

## 📚 Usage

1. **Start the application**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Mode
```bash
npm run dev
```

## 📖 Usage Guide

### 1. Upload Assignments
- Drag and drop files or click "Choose Files"
- Supported formats: TXT, PDF, DOCX, DOC
- Maximum file size: 10MB per file
- Maximum files: 50 per batch

### 2. Configure Analysis
- **Assignment Type**: Select the type of assignment (essay, worksheet, report, etc.)
- **Evaluation Criteria**: Choose which dimensions to evaluate
- **Report Format**: Select output format (HTML, JSON, CSV)

### 3. Generate Reports
- Click "Generate Feedback Reports"
- Wait for processing to complete
- Download or view the generated report

### 4. Review Results
- Individual student feedback with scores and suggestions
- Summary statistics and common patterns
- Detailed analysis of each evaluation dimension

## 🏗️ Architecture

### Core Components

```
src/
├── core/
│   ├── FeedbackProcessor.js      # Main processing engine
│   ├── FileUploadHandler.js      # File upload and extraction
│   ├── ReportGenerator.js        # Report generation
│   └── analyzers/
│       ├── AssignmentAnalyzer.js # Assignment-specific analysis
│       └── EvaluationDimensions.js # Dimension evaluation
├── templates/
│   └── html/
│       └── report.ejs           # HTML report template
└── index.js                     # Main server file
```

### API Endpoints

- `POST /api/upload` - Upload and process files
- `POST /api/generate-report` - Generate feedback reports
- `GET /api/supported-types` - Get supported file types
- `GET /api/health` - Health check

## 🔧 Configuration

### Environment Variables
```bash
PORT=3000                    # Server port
NODE_ENV=production          # Environment mode
```

### Customization

#### Adding New Assignment Types
1. Extend `AssignmentAnalyzer.js`
2. Add new analysis methods
3. Update the frontend options

#### Adding New Evaluation Dimensions
1. Extend `EvaluationDimensions.js`
2. Add dimension analysis methods
3. Update the evaluation criteria options

#### Customizing Report Templates
1. Modify templates in `src/templates/`
2. Use EJS templating syntax
3. Add custom styling and layout

## 📊 Sample Output

### Individual Student Report
```html
Student: John Doe
Overall Score: 0.75 (Good)

Evaluation Dimensions:
- Structure: 0.8 - Well-organized with clear introduction and conclusion
- Creativity: 0.6 - Shows some original thinking
- Accuracy: 0.9 - Factually correct with proper citations
- Presentation: 0.7 - Good grammar with minor formatting issues

Strengths:
- Clear thesis statement
- Good use of evidence
- Well-structured paragraphs

Areas for Improvement:
- Structure: Add more transition sentences
- Creativity: Include more unique examples
- Presentation: Fix minor grammar issues
```

### Summary Statistics
```json
{
  "totalStudents": 25,
  "processedStudents": 24,
  "averageScore": 0.72,
  "scoreDistribution": {
    "high": 8,
    "medium": 12,
    "low": 4
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

## 🔮 Roadmap

### Planned Features
- [ ] Integration with Learning Management Systems
- [ ] Machine learning-based feedback improvement
- [ ] Multi-language support
- [ ] Batch processing with progress tracking
- [ ] Custom feedback templates
- [ ] Student self-assessment tools
- [ ] Analytics dashboard for teachers

### Version History
- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added CSV export and improved UI
- **v1.2.0** - Enhanced analysis algorithms and new assignment types

## 🙏 Acknowledgments

- Built with Node.js and Express
- Natural language processing with Natural.js
- File processing with Mammoth and PDF-Parse
- Beautiful UI with modern CSS and JavaScript

---

**Made with ❤️ for educators who want to provide meaningful feedback at scale.**

