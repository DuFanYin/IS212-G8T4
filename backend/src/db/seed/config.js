const toInt = (v, d) => {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : d;
};

const SEED_COUNTS = {
  departments: toInt(process.env.SEED_DEPARTMENTS, 4),
  teams: toInt(process.env.SEED_TEAMS, 8),
  users: toInt(process.env.SEED_USERS, 40),
  projects: toInt(process.env.SEED_PROJECTS, 10),
  tasks: toInt(process.env.SEED_TASKS, 80),
  subtasks: toInt(process.env.SEED_SUBTASKS, 160),
  comments: toInt(process.env.SEED_COMMENTS, 200),
  activityLogs: toInt(process.env.SEED_ACTIVITY_LOGS, 300),
};

module.exports = { SEED_COUNTS };


