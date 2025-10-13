/* Orchestrated modular seeding */
require('dotenv').config();

const { connectDB, disconnectDB } = require('../connect');
const seedUsers = require('./seeders/users');
const seedDepartments = require('./seeders/departments');
const seedTeams = require('./seeders/teams');
const seedProjects = require('./seeders/projects');
const seedTasks = require('./seeders/tasks');
const seedSubtasks = require('./seeders/subtasks');
const seedComments = require('./seeders/comments');
const seedActivityLogs = require('./seeders/activityLogs');
const { SEED_COUNTS } = require('./config');

(async () => {
  const start = Date.now();
  const force = process.argv.includes('--force');
  if (process.env.NODE_ENV === 'production' && !force) {
    console.error('❌ Refusing to seed in production without --force');
    process.exit(1);
  }

  await connectDB();

  try {
    const departments = await seedDepartments(SEED_COUNTS.departments);
    const teams = await seedTeams(SEED_COUNTS.teams, { departments });
    const users = await seedUsers(SEED_COUNTS.users, { departments, teams });
    const projects = await seedProjects(SEED_COUNTS.projects, { users, teams, departments });
    const tasks = await seedTasks(SEED_COUNTS.tasks, { users, projects });
    const subtasks = await seedSubtasks(SEED_COUNTS.subtasks, { tasks });
    const comments = await seedComments(SEED_COUNTS.comments, { users, tasks });
    await seedActivityLogs(SEED_COUNTS.activityLogs, { users, tasks, projects });

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});
    console.log('✅ Seed complete', {
      counts: {
        departments: departments.length,
        teams: teams.length,
        users: users.length,
        projects: projects.length,
        tasks: tasks.length,
        subtasks: subtasks.length,
        comments: comments.length,
        activityLogs: SEED_COUNTS.activityLogs,
        roles: roleCounts
      },
      elapsedSec: elapsed,
    });
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();


