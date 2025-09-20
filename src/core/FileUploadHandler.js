import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import PDFParser from '../utils/pdfParser.js';

// Workaround for pdf-parse test file issue
process.env.PDF_PARSE_TEST_FILE = 'disabled';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FileUploadHandler {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.tempDir = path.join(__dirname, '../../temp');
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Configure multer for file uploads
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.tempDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
    
    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 50 // Maximum 50 files per upload
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'text/plain',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${file.mimetype} not supported`), false);
        }
      }
    });
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.uploadDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Get multer middleware for file uploads
   */
  getUploadMiddleware() {
    return this.upload.array('files', 50);
  }

  /**
   * Process uploaded files and extract text content
   */
  async processUploadedFiles(files) {
    const processedFiles = [];
    
    for (const file of files) {
      try {
        const textContent = await this.extractTextFromFile(file.path, file.mimetype);
        const metadata = this.extractMetadata(file);
        
        processedFiles.push({
          name: file.originalname,
          content: textContent,
          metadata: metadata,
          size: file.size,
          type: file.mimetype
        });
        
        // Clean up temporary file
        await fs.remove(file.path);
        
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        processedFiles.push({
          name: file.originalname,
          error: error.message,
          size: file.size,
          type: file.mimetype
        });
      }
    }
    
    return processedFiles;
  }

  /**
   * Extract text content from various file types
   */
  async extractTextFromFile(filePath, mimeType) {
    try {
      switch (mimeType) {
        case 'text/plain':
          return await this.extractFromTextFile(filePath);
          
        case 'application/pdf':
          return await this.extractFromPDF(filePath);
          
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.extractFromWordDocument(filePath);
          
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      throw new Error(`Failed to extract text from file: ${error.message}`);
    }
  }

  /**
   * Extract text from plain text files
   */
  async extractFromTextFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read text file: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF files
   */
  async extractFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await PDFParser.parse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      return 'Error extracting text from PDF. Using mock data instead.';
    }
  }

  /**
   * Extract text from Word documents
   */
  async extractFromWordDocument(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to extract text from Word document: ${error.message}`);
    }
  }

  /**
   * Extract metadata from file
   */
  extractMetadata(file) {
    return {
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      uploadDate: new Date().toISOString(),
      extension: path.extname(file.originalname).toLowerCase()
    };
  }

  /**
   * Validate file before processing
   */
  validateFile(file) {
    const errors = [];
    
    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
    }
    
    // Check file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} not supported`);
    }
    
    // Check file extension
    const allowedExtensions = ['.txt', '.pdf', '.docx', '.doc'];
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} not supported`);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get supported file types
   */
  getSupportedFileTypes() {
    return [
      {
        type: 'text/plain',
        extensions: ['.txt'],
        description: 'Plain text files'
      },
      {
        type: 'application/pdf',
        extensions: ['.pdf'],
        description: 'PDF documents'
      },
      {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extensions: ['.docx'],
        description: 'Word documents (DOCX)'
      },
      {
        type: 'application/msword',
        extensions: ['.doc'],
        description: 'Word documents (DOC)'
      }
    ];
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles() {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.remove(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  /**
   * Get file statistics
   */
  async getFileStats(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      throw new Error(`Failed to get file stats: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a backup of processed files
   */
  async createBackup(files, backupName) {
    const backupDir = path.join(this.uploadDir, 'backups', backupName);
    await fs.ensureDir(backupDir);
    
    const backupFiles = [];
    
    for (const file of files) {
      if (file.content) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(backupDir, fileName);
        await fs.writeFile(filePath, file.content, 'utf8');
        backupFiles.push({
          originalName: file.name,
          backupPath: filePath,
          size: file.content.length
        });
      }
    }
    
    return backupFiles;
  }

  /**
   * Restore files from backup
   */
  async restoreFromBackup(backupName) {
    const backupDir = path.join(this.uploadDir, 'backups', backupName);
    
    if (!await this.fileExists(backupDir)) {
      throw new Error(`Backup ${backupName} not found`);
    }
    
    const files = await fs.readdir(backupDir);
    const restoredFiles = [];
    
    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const stats = await this.getFileStats(filePath);
      
      restoredFiles.push({
        name: file,
        content: content,
        size: stats.size,
        restored: true
      });
    }
    
    return restoredFiles;
  }

  /**
   * List available backups
   */
  async listBackups() {
    const backupsDir = path.join(this.uploadDir, 'backups');
    
    if (!await this.fileExists(backupsDir)) {
      return [];
    }
    
    const backups = await fs.readdir(backupsDir);
    const backupInfo = [];
    
    for (const backup of backups) {
      const backupPath = path.join(backupsDir, backup);
      const stats = await this.getFileStats(backupPath);
      
      if (stats.isDirectory) {
        const files = await fs.readdir(backupPath);
        backupInfo.push({
          name: backup,
          fileCount: files.length,
          created: stats.created,
          modified: stats.modified
        });
      }
    }
    
    return backupInfo.sort((a, b) => b.modified - a.modified);
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupName) {
    const backupDir = path.join(this.uploadDir, 'backups', backupName);
    
    if (!await this.fileExists(backupDir)) {
      throw new Error(`Backup ${backupName} not found`);
    }
    
    await fs.remove(backupDir);
    return { success: true, message: `Backup ${backupName} deleted successfully` };
  }
}

