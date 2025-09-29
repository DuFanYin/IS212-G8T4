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

  const docs = [];

  // Helper to push a user
  const pushUser = (role, index) => {
    const name = `${role.toUpperCase()}-${index}`;
    const email = `${role}${index}@example.com`;
    const base = { name, email, passwordHash, role };
    if (role === 'staff') {
      docs.push({ ...base, teamId: anyTeam?._id, departmentId: teamDeptId });
    } else if (role === 'manager') {
      docs.push({ ...base, teamId: anyTeam?._id, departmentId: teamDeptId });
    } else if (role === 'director') {
      docs.push({ ...base, teamId: undefined, departmentId: anyDepartment });
    } else if (role === 'hr') {
      docs.push({ ...base, teamId: undefined, departmentId: undefined });
    } else if (role === 'sm') {
      docs.push({ ...base, teamId: undefined, departmentId: undefined });
    }
  };

  // Create multiple users per role
  for (let i = 1; i <= 6; i++) pushUser('staff', i);
  for (let i = 1; i <= 3; i++) pushUser('manager', i);
  for (let i = 1; i <= 2; i++) pushUser('director', i);
  for (let i = 1; i <= 2; i++) pushUser('hr', i);
  for (let i = 1; i <= 2; i++) pushUser('sm', i);

  // Backwards-compatible single known accounts (for tests/docs)
  docs.push(
    { name: 'Staff Member', email: 'staff@example.com', passwordHash, role: 'staff', teamId: anyTeam?._id, departmentId: teamDeptId },
    { name: 'Manager User', email: 'manager@example.com', passwordHash, role: 'manager', teamId: anyTeam?._id, departmentId: teamDeptId },
    { name: 'Director User', email: 'director@example.com', passwordHash, role: 'director', teamId: undefined, departmentId: anyDepartment },
    { name: 'HR User', email: 'hr@example.com', passwordHash, role: 'hr', teamId: undefined, departmentId: undefined },
    { name: 'Senior Management User', email: 'sm@example.com', passwordHash, role: 'sm', teamId: undefined, departmentId: undefined }
  );

  const inserted = await User.insertMany(docs, { ordered: true });
  return inserted.map((u) => u.toObject());
};


