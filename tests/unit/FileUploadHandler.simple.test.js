import { TestFramework, assert } from '../test-framework.js';
import { FileUploadHandler } from '../../src/core/FileUploadHandler.js';

const test = new TestFramework();

test.test('FileUploadHandler Constructor', () => {
  const handler = new FileUploadHandler();
  assert.hasProperty(handler, 'uploadDir');
  assert.hasProperty(handler, 'tempDir');
  assert.hasProperty(handler, 'storage');
  assert.hasProperty(handler, 'upload');
});

test.test('validateFile should validate file successfully', () => {
  const handler = new FileUploadHandler();
  const file = {
    size: 1024,
    mimetype: 'text/plain',
    originalname: 'test.txt'
  };
  
  const result = handler.validateFile(file);
  assert.true(result.isValid);
  assert.equal(result.errors.length, 0);
});

test.test('validateFile should reject file that is too large', () => {
  const handler = new FileUploadHandler();
  const file = {
    size: 11 * 1024 * 1024, // 11MB
    mimetype: 'text/plain',
    originalname: 'test.txt'
  };
  
  const result = handler.validateFile(file);
  assert.false(result.isValid);
  assert.true(result.errors.includes('File size exceeds 10MB limit'));
});

test.test('validateFile should reject unsupported file type', () => {
  const handler = new FileUploadHandler();
  const file = {
    size: 1024,
    mimetype: 'application/unknown',
    originalname: 'test.xyz'
  };
  
  const result = handler.validateFile(file);
  assert.false(result.isValid);
  assert.true(result.errors.includes('File type application/unknown not supported'));
});

test.test('getSupportedFileTypes should return supported types', () => {
  const handler = new FileUploadHandler();
  const types = handler.getSupportedFileTypes();
  
  assert.equal(types.length, 4);
  assert.equal(types[0].type, 'text/plain');
  assert.equal(types[0].extensions[0], '.txt');
});

test.test('extractMetadata should extract file metadata', () => {
  const handler = new FileUploadHandler();
  const file = {
    originalname: 'test.txt',
    size: 1024,
    mimetype: 'text/plain'
  };
  
  const result = handler.extractMetadata(file);
  
  assert.equal(result.originalName, 'test.txt');
  assert.equal(result.size, 1024);
  assert.equal(result.mimeType, 'text/plain');
  assert.hasProperty(result, 'uploadDate');
  assert.equal(result.extension, '.txt');
});

export default test;

