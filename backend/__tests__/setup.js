// Load environment variables from main .env file
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';  // This will make connect.js use is212_test database
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { connectDB, disconnectDB } = require('../src/db/connect');
// Lazy-load seeders to avoid impacting production code
const seedDepartments = require('../src/db/seed/seeders/departments');
const seedTeams = require('../src/db/seed/seeders/teams');
const seedUsers = require('../src/db/seed/seeders/users');
const seedProjects = require('../src/db/seed/seeders/projects');
const seedTasks = require('../src/db/seed/seeders/tasks');
const seedSubtasks = require('../src/db/seed/seeders/subtasks');
const seedComments = require('../src/db/seed/seeders/comments');
const seedActivityLogs = require('../src/db/seed/seeders/activityLogs');
const { SEED_COUNTS } = require('../src/db/seed/config');
const { User } = require('../src/db/models');
let connection;

// Connect to test database before all tests
beforeAll(async () => {
  connection = await connectDB();
  // Ensure seed data exists for tests (only if empty)
  const userCount = await User.countDocuments();
  if (!Number.isFinite(userCount) || userCount === 0) {
    const departments = await seedDepartments(SEED_COUNTS.departments);
    const teams = await seedTeams(SEED_COUNTS.teams, { departments });
    const users = await seedUsers(SEED_COUNTS.users, { departments, teams });
    const projects = await seedProjects(SEED_COUNTS.projects, { users, teams, departments });
    const tasks = await seedTasks(SEED_COUNTS.tasks, { users, projects });
    await seedSubtasks(SEED_COUNTS.subtasks, { tasks });
    await seedComments(SEED_COUNTS.comments, { users, tasks });
    await seedActivityLogs(SEED_COUNTS.activityLogs, { users, tasks, projects });
  }
}, 30000);

// Clear mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Disconnect from database after all tests
afterAll(async () => {
  await disconnectDB();
}, 30000); // Increase timeout to 30s for cleanup