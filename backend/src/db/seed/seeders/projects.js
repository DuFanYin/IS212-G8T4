const Project = require('../../models/Project');

module.exports = async function seedProjects(_count, { users, teams, departments }) {
  await Project.deleteMany({});
  const manager = users.find(u => u.role === 'manager') || users[0];
  const staff = users.find(u => u.role === 'staff') || users[1] || users[0];
  const engDept = departments.find(d => d.name === 'Engineering') || departments[0];
  const frontTeam = teams.find(t => t.name === 'Frontend Team') || teams[0];
  const platformTeam = teams.find(t => t.name === 'Platform Team') || teams[1] || teams[0];

  const docs = [
    {
      name: 'Website Revamp',
      description: 'Rebuild marketing website in Next.js',
      departmentId: engDept._id,
      teamId: frontTeam._id,
      ownerId: manager._id,
      // Add realistic deadline: ~30 days from now
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isDeleted: false,
    },
    {
      name: 'Platform Reliability',
      description: 'Stability and performance improvements',
      departmentId: engDept._id,
      teamId: platformTeam._id,
      ownerId: manager._id,
      // ~60 days from now
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isDeleted: false,
    },
    // Ensure there is at least one project owned by a staff user for tests that
    // require owner-level permissions from a non-manager role
    {
      name: 'Staff Sandbox Project',
      description: 'Seeded project owned by a staff user for tests',
      departmentId: engDept._id,
      teamId: frontTeam._id,
      ownerId: staff._id,
      // ~15 days from now
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isDeleted: false,
    },
    {
      name: 'Sales CRM Upgrade',
      description: 'Improve CRM workflows and data hygiene',
      departmentId: engDept._id,
      teamId: frontTeam._id,
      ownerId: manager._id,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isDeleted: false,
    },
    {
      name: 'Onboarding Revamp',
      description: 'Revamp onboarding materials and processes',
      departmentId: engDept._id,
      teamId: platformTeam._id,
      ownerId: staff._id,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isDeleted: false,
    },
  ];
  const inserted = await Project.insertMany(docs, { ordered: true });
  return inserted.map((p) => p.toObject());
};


