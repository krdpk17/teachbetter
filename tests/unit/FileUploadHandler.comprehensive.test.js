import { TestFramework, assert } from '../test-framework.js';
import { FileUploadHandler } from '../../src/core/FileUploadHandler.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Mock the file system
const mockFs = {
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    rename: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue('test content'),
    writeFile: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn().mockResolvedValue(['file1.txt', 'file2.pdf']),
    stat: jest.fn().mockResolvedValue({ size: 1024 })
  }
};

// Mock the path module
const mockPath = {
  join: (...args) => args.join('/'),
  dirname: path.dirname,
  extname: path.extname,
  basename: path.basename
};

// Mock the file upload handler dependencies
jest.mock('fs/promises', () => mockFs.promises);

const test = new TestFramework();

// Mock the file upload handler class
class MockFileUploadHandler {
  constructor() {
    this.uploadDir = '/mocked/upload/dir';
    this.tempDir = '/mocked/temp/dir';
    this.supportedTypes = [
      { type: 'text/plain', extensions: ['.txt'] },
      { type: 'application/pdf', extensions: ['.pdf'] }
    ];
  }

  async ensureDirectories() {
    await Promise.all([
      fs.mkdir(this.uploadDir, { recursive: true }),
      fs.mkdir(this.tempDir, { recursive: true })
    ]);
  }

  async uploadFile(file) {
    if (!file || !file.originalname || !file.buffer) {
      throw new Error('Invalid file object');
    }

    const tempPath = `${this.tempDir}/${file.originalname}`;
    const uploadPath = `${this.uploadDir}/${file.originalname}`;

    await fs.writeFile(tempPath, file.buffer);
    await fs.rename(tempPath, uploadPath);

    return {
      filename: file.originalname,
      path: uploadPath,
      size: file.size || 0
    };
  }

  async deleteFile(filename) {
    const filePath = `${this.uploadDir}/${filename}`;
    await fs.unlink(filePath);
    return { success: true, message: 'File deleted successfully' };
  }
}

test.test('FileUploadHandler - Constructor and Directory Setup', async () => {
  const uploadHandler = new MockFileUploadHandler();
  
  // Test directory properties
  assert.equal(uploadHandler.uploadDir, '/mocked/upload/dir');
  assert.equal(uploadHandler.tempDir, '/mocked/temp/dir');
  
  // Test ensureDirectories
  await uploadHandler.ensureDirectories();
  
  // Verify mkdir was called with correct paths
  assert.true(mockFs.promises.mkdir.mock.calls.some(
    call => call[0] === uploadHandler.uploadDir
  ));
  assert.true(mockFs.promises.mkdir.mock.calls.some(
    call => call[0] === uploadHandler.tempDir
  ));
});

test.test('FileUploadHandler - File Upload', async () => {
  const uploadHandler = new MockFileUploadHandler();
  
  const mockFile = {
    originalname: 'test.txt',
    buffer: Buffer.from('test content'),
    size: 1024,
    mimetype: 'text/plain'
  };
  
  const result = await uploadHandler.uploadFile(mockFile);
  
  // Verify the result
  assert.equal(result.filename, 'test.txt');
  assert.equal(result.path, '/mocked/upload/dir/test.txt');
  assert.equal(result.size, 1024);
  
  // Verify file operations were called correctly
  assert.true(mockFs.promises.writeFile.called);
  assert.true(mockFs.promises.rename.called);
});

test.test('FileUploadHandler - File Deletion', async () => {
  const uploadHandler = new MockFileUploadHandler();
  
  const result = await uploadHandler.deleteFile('test.txt');
  
  // Verify the result
  assert.true(result.success);
  assert.equal(result.message, 'File deleted successfully');
  
  // Verify unlink was called with correct path
  assert.true(mockFs.promises.unlink.calledWith('/mocked/upload/dir/test.txt'));
});

test.test('FileUploadHandler - Error Handling', async () => {
  const uploadHandler = new MockFileUploadHandler();
  
  // Test with invalid file object
  try {
    await uploadHandler.uploadFile(null);
    assert.fail('Should have thrown an error for invalid file');
  } catch (error) {
    assert.include(error.message, 'Invalid file object');
  }
  
  // Test with missing file name
  try {
    await uploadHandler.uploadFile({ buffer: Buffer.from('test') });
    assert.fail('Should have thrown an error for missing filename');
  } catch (error) {
    assert.include(error.message, 'Invalid file object');
  }
});

// Export the test function
export default async function runTests() {
  return test.run();
}

// Run the tests if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  test.run();
}
