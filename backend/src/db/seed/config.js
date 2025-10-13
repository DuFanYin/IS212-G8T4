const toInt = (v, d) => {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : d;
};

const SEED_COUNTS = {
  departments: toInt(process.env.SEED_DEPARTMENTS, 2),
  teams: toInt(process.env.SEED_TEAMS, 4),
  users: toInt(process.env.SEED_USERS, 14),
  projects: toInt(process.env.SEED_PROJECTS, 5),
  tasks: toInt(process.env.SEED_TASKS, 15),
  subtasks: toInt(process.env.SEED_SUBTASKS, 20),
  comments: toInt(process.env.SEED_COMMENTS, 40),
  activityLogs: toInt(process.env.SEED_ACTIVITY_LOGS, 60),
};

module.exports = { SEED_COUNTS };


