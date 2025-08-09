module.exports = {
  displayName: 'Business System API Tests',
  testEnvironment: 'node',
  testMatch: ['**/simple-api.test.js', '**/business-system.test.js'],
  verbose: true,
  testTimeout: 30000,
  collectCoverage: true,
  collectCoverageFrom: [
    'test-server.js',
    'business-test-server.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html'],
  setupFiles: ['<rootDir>/api-test-setup.js'],
};