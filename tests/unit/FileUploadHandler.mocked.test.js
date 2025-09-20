import { TestFramework, assert } from '../test-framework.js';

// Mock the dependencies
const mockFs = {
  ensureDir: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('test content'),
  readdir: jest.fn().mockResolvedValue(['file1.txt', 'file2.pdf']),
  unlink: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockResolvedValue({ size: 1024 })
};

const mockMulter = {
  diskStorage: jest.fn().mockImplementation(() => ({
    _handleFile: (req, file, cb) => {
      cb(null, { path: '/temp/path', filename: 'test.txt' });
    },
    _removeFile: (req, file, cb) => {
      cb(null);
    }
  })),
  memoryStorage: jest.fn().mockImplementation(() => ({
    _handleFile: (req, file, cb) => {
      cb(null, { buffer: Buffer.from('test content') });
    },
    _removeFile: (req, file, cb) => {
      cb(null);
    }
  }))
};

const mockMammoth = {
  extractRawText: jest.fn().mockResolvedValue({ value: 'Test document content' })
};

const mockPdfParse = jest.fn().mockResolvedValue({ text: 'PDF content' });

// Mock the modules
jest.mock('fs-extra', () => mockFs);
jest.mock('multer', () => () => mockMulter);
jest.mock('mammoth', () => mockMammoth);
jest.mock('pdf-parse', () => mockPdfParse);

// Import the class after setting up mocks
import { FileUploadHandler } from '../../src/core/FileUploadHandler.js';

const test = new TestFramework();

test.test('FileUploadHandler - Constructor', () => {
  const uploadHandler = new FileUploadHandler();
  
  // Test that the constructor sets up the expected properties
  assert.true(uploadHandler.uploadDir.endsWith('/uploads'));
  assert.true(uploadHandler.tempDir.endsWith('/temp'));
  
  // Test that ensureDirectories was called
  assert.true(mockFs.ensureDir.called);
  
  // Test that multer was configured correctly
  assert.true(mockMulter.diskStorage.called);
});

test.test('FileUploadHandler - processUpload', async () => {
  const uploadHandler = new FileUploadHandler();
  
  // Mock the request and response objects
  const req = {
    file: {
      path: '/temp/path',
      originalname: 'test.txt',
      mimetype: 'text/plain'
    }
  };
  
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  
  // Call the method
  await uploadHandler.processUpload(req, res);
  
  // Verify the response
  assert.true(res.status.calledWith(200));
  assert.true(res.json.called);
  
  const responseData = res.json.mock.calls[0][0];
  assert.equal(responseData.filename, 'test.txt');
  assert.true(responseData.path.includes('/uploads/test'));
});

test.test('FileUploadHandler - processUpload - Unsupported File Type', async () => {
  const uploadHandler = new FileUploadHandler();
  
  // Mock the request with an unsupported file type
  const req = {
    file: {
      path: '/temp/path',
      originalname: 'test.unsupported',
      mimetype: 'application/unsupported'
    }
  };
  
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  
  // Call the method and expect it to throw
  await uploadHandler.processUpload(req, res);
  
  // Verify the error response
  assert.true(res.status.calledWith(400));
  assert.true(res.json.calls[0][0].error.includes('Unsupported file type'));
});

// Export the test function
export default async function runTests() {
  return test.run();
}

// Run the tests if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  test.run();
}
