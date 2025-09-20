// Mock PDF parser to avoid test file issues
class MockPDFParser {
  static async parse(buffer, options = {}) {
    // Return a mock response with basic structure
    return {
      text: 'Mock PDF content. This is a placeholder since the actual PDF parser is having issues.',
      metadata: {},
      version: '1.0.0',
      info: {},
      numpages: 1
    };
  }
}

export default MockPDFParser;
