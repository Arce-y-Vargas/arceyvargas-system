module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/api.test.js'],
  verbose: true,
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/test.setup.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'app.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/test/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  // Para tests de integración
  maxWorkers: 1, // Ejecutar tests secuencialmente para evitar conflictos de base de datos
};