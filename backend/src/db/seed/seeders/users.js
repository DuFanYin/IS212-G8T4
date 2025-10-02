const bcrypt = require('bcryptjs');
const User = require('../../models/User');

// Seed multiple users for each role with fixed credentials
// Password for all users: 123456
module.exports = async function seedUsers(_count, { departments, teams }) {
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash('123456', 10);

  // Choose references that satisfy schema constraints
  const anyDepartment = departments[0]?._id;
  const anyTeam = teams[0];
  const teamDeptId = anyTeam?.departmentId || anyDepartment;
  // Sample picks across depts/teams
  const engineering = departments.find(d => d.name === 'Engineering') || departments[0];
  const operations = departments.find(d => d.name === 'Operations') || departments[1] || departments[0];
  const sales = departments.find(d => d.name === 'Sales') || departments[2] || departments[0];
  // Only 3 departments now
  const hrDept = departments[0];

  const frontTeam = teams.find(t => t.name === 'Frontend Team') || teams[0];
  const platformTeam = teams.find(t => t.name === 'Platform Team') || teams[1] || teams[0];
  const supportTeamA = teams.find(t => t.name === 'Support Team') || teams[2] || teams[0];
  const aEs = teams.find(t => t.name === 'Account Executives') || teams[5] || teams[0];
  const qaTeam = teams.find(t => t.name === 'QA Team') || teams[2] || teams[0];
  const itOps = teams.find(t => t.name === 'IT Ops') || teams[4] || teams[0];

  const docs = [];

  // Pick a team that belongs to a given department (falls back safely)
  const teamForDepartment = (dept) => {
    const deptId = dept?._id?.toString?.();
    const byDept = [frontTeam, platformTeam, qaTeam, supportTeamA, itOps, aEs].filter(t => t && t.departmentId?.toString?.() === deptId);
    return byDept[0] || frontTeam || platformTeam || qaTeam || supportTeamA || itOps || aEs || anyTeam;
  };

  // Helper to push a user
  const pushUser = (role, index) => {
    const name = `${role.toUpperCase()}-${index}`;
    const email = `${role}${index}@example.com`;
    const base = { name, email, passwordHash, role };
    if (role === 'staff') {
      // Distribute staff across teams/departments
      const pool = [frontTeam, platformTeam, qaTeam, supportTeamA, itOps, aEs].filter(Boolean);
      const teamPick = pool[pool.length ? (index % pool.length) : 0];
      const deptId = teamPick?.departmentId || engineering._id;
      docs.push({ ...base, teamId: teamPick?._id, departmentId: deptId });
    } else if (role === 'manager') {
      const pool = [frontTeam, platformTeam, qaTeam, supportTeamA, itOps, aEs].filter(Boolean);
      const teamPick = pool[pool.length ? (index % pool.length) : 0];
      const deptId = teamPick?.departmentId || engineering._id;
      docs.push({ ...base, teamId: teamPick?._id, departmentId: deptId });
    } else if (role === 'director') {
      // Rotate directors across departments
      const deptPool = [engineering, operations, sales].filter(Boolean);
      const deptPick = deptPool[deptPool.length ? (index % deptPool.length) : 0];
      const teamPick = teamForDepartment(deptPick);
      docs.push({ ...base, teamId: teamPick?._id, departmentId: deptPick?._id });
    } else if (role === 'hr') {
      // Ensure HR has a valid department and team for visibility logic
      const deptPick = hrDept || engineering;
      const teamPick = teamForDepartment(deptPick);
      docs.push({ ...base, teamId: teamPick?._id, departmentId: deptPick?._id });
    } else if (role === 'sm') {
      // Ensure SM has a valid department and team association
      const deptPick = operations || engineering;
      const teamPick = teamForDepartment(deptPick);
      docs.push({ ...base, teamId: teamPick?._id, departmentId: deptPick?._id });
    }
  };

  // Create multiple users per role
  for (let i = 0; i < 10; i++) pushUser('staff', i);
  // One manager per team (6 teams total)
  for (let i = 0; i < 6; i++) pushUser('manager', i);
  for (let i = 0; i < 3; i++) pushUser('director', i);
  for (let i = 0; i < 2; i++) pushUser('hr', i);
  for (let i = 0; i < 1; i++) pushUser('sm', i);

  // Removed legacy non-indexed accounts to ensure all seeded users follow index-from-0 convention

  const inserted = await User.insertMany(docs, { ordered: true });
  return inserted.map((u) => u.toObject());
};


