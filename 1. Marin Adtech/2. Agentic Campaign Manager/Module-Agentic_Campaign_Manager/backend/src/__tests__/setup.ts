/**
 * Jest Setup File
 * Sets up environment variables and configuration for tests
 */

// Set required environment variables for tests
process.env.DISPATCHER_URL = process.env.DISPATCHER_URL || 'http://localhost:8000';
process.env.NODE_ENV = 'test';

// Suppress console logs in tests (optional)
global.console = {
  ...console,
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
};
