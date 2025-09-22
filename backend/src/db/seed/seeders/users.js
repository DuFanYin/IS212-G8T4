const bcrypt = require('bcryptjs');
const User = require('../../models/User');

// Seed exactly one user for each role with fixed credentials
// Password for all users: 123456
module.exports = async function seedUsers(_count, { departments, teams }) {
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash('123456', 10);

  // Choose references that satisfy schema constraints
  const anyDepartment = departments[0]?._id;
  const anyTeam = teams[0];
  const teamDeptId = anyTeam?.departmentId || anyDepartment;

  const docs = [
    {
      name: 'Staff Member',
      email: 'staff@example.com',
      passwordHash,
      role: 'staff',
      teamId: anyTeam?._id,
      departmentId: teamDeptId,
    },
    {
      name: 'Manager User',
      email: 'manager@example.com',
      passwordHash,
      role: 'manager',
      teamId: anyTeam?._id,
      departmentId: teamDeptId,
    },
    {
      name: 'Director User',
      email: 'director@example.com',
      passwordHash,
      role: 'director',
      teamId: undefined,
      departmentId: anyDepartment,
    },
    {
      name: 'HR User',
      email: 'hr@example.com',
      passwordHash,
      role: 'hr',
      teamId: undefined,
      departmentId: undefined,
    },
    {
      name: 'Senior Management User',
      email: 'sm@example.com',
      passwordHash,
      role: 'sm',
      teamId: undefined,
      departmentId: undefined,
    },
  ];

  const inserted = await User.insertMany(docs, { ordered: true });
  return inserted.map((u) => u.toObject());
};


