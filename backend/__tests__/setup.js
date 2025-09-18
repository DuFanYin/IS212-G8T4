// Load environment variables from main .env file
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';  // This will make connect.js use is212_test database
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { connectDB, disconnectDB } = require('../src/db/connect');
let connection;

// Connect to test database before all tests
beforeAll(async () => {
  connection = await connectDB();
}, 30000); // Increase timeout to 30s for Atlas connection

// Clear database and reset mocks after each test
afterEach(async () => {
  if (connection) {
    // Clear all collections instead of dropping database
    const collections = await connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
  jest.clearAllMocks();
}, 30000); // Increase timeout to 30s for database operations

// Disconnect from database after all tests
afterAll(async () => {
  await disconnectDB();
}, 30000); // Increase timeout to 30s for cleanup
