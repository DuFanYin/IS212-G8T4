module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/db/connect.js'
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  testTimeout: 30000,
  maxWorkers: 1
};
