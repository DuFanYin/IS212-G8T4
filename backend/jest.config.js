module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/db/connect.js',
    '!src/db/seed/**/*.js',
    '!src/db/seedData.js',
    '!src/scripts/**/*.js'
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  testTimeout: 60000, // Increase timeout for CI
  maxWorkers: 1,
  // Avoid forcing process exit; fix lingering handles instead in setup/teardown
  // forceExit: true
};
