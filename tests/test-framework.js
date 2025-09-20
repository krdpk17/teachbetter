// Simple test framework
export class TestFramework {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🧪 Running Tests...\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        this.results.push({ name: test.name, status: 'PASS', error: null });
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.failed++;
        this.results.push({ name: test.name, status: 'FAIL', error: error.message });
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }

    console.log(`\n📊 Test Results:`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📋 Total: ${this.tests.length}`);
    
    if (this.failed > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    return this.failed === 0;
  }
}

// Assertion helpers
export const assert = {
  equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  },
  
  notEqual(actual, expected, message) {
    if (actual === expected) {
      throw new Error(message || `Expected not ${expected}, got ${actual}`);
    }
  },
  
  true(actual, message) {
    if (actual !== true) {
      throw new Error(message || `Expected true, got ${actual}`);
    }
  },
  
  false(actual, message) {
    if (actual !== false) {
      throw new Error(message || `Expected false, got ${actual}`);
    }
  },
  
  throws(fn, message) {
    try {
      fn();
      throw new Error(message || 'Expected function to throw');
    } catch (error) {
      // Expected behavior
    }
  },
  
  async throwsAsync(fn, message) {
    try {
      await fn();
      throw new Error(message || 'Expected async function to throw');
    } catch (error) {
      // Expected behavior
    }
  },
  
  hasProperty(obj, prop, message) {
    if (!(prop in obj)) {
      throw new Error(message || `Expected object to have property '${prop}'`);
    }
  },
  
  isArray(actual, message) {
    if (!Array.isArray(actual)) {
      throw new Error(message || `Expected array, got ${typeof actual}`);
    }
  },
  
  greaterThan(actual, expected, message) {
    if (actual <= expected) {
      throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
    }
  },
  
  lessThan(actual, expected, message) {
    if (actual >= expected) {
      throw new Error(message || `Expected ${actual} to be less than ${expected}`);
    }
  },
  
  closeTo(actual, expected, precision = 2, message) {
    const diff = Math.abs(actual - expected);
    if (diff > Math.pow(10, -precision)) {
      throw new Error(message || `Expected ${actual} to be close to ${expected} (within ${precision} decimal places)`);
    }
  },
  
  include(actual, expected, message) {
    if (!actual.includes(expected)) {
      throw new Error(message || `Expected '${actual}' to include '${expected}'`);
    }
  },
  
  notInclude(actual, expected, message) {
    if (actual.includes(expected)) {
      throw new Error(message || `Expected '${actual}' to not include '${expected}'`);
    }
  },
  
  deepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`);
    }
  },
  
  approximately(actual, expected, delta, message) {
    const difference = Math.abs(actual - expected);
    if (difference > delta) {
      throw new Error(message || `Expected ${actual} to be within ${delta} of ${expected}`);
    }
  }
};

// Mock utilities
export const mock = {
  fn(implementation) {
    const mockFn = function(...args) {
      mockFn.calls.push(args);
      return implementation(...args);
    };
    
    mockFn.calls = [];
    mockFn.mockImplementation = (newImplementation) => {
      implementation = newImplementation;
    };
    
    return mockFn;
  },
  
  spyOn(object, method) {
    const original = object[method];
    const spy = {
      calls: [],
      restore() {
        object[method] = original;
      }
    };
    
    object[method] = function(...args) {
      spy.calls.push(args);
      return original.apply(this, args);
    };
    
    return spy;
  }
};
