const Project = require('../../models/Project');

module.exports = async function seedProjects(_count, { users, teams, departments }) {
  await Project.deleteMany({});
  const manager = users.find(u => u.role === 'manager') || users[0];
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
      isDeleted: false,
    },
    {
      name: 'Platform Reliability',
      description: 'Stability and performance improvements',
      departmentId: engDept._id,
      teamId: platformTeam._id,
      ownerId: manager._id,
      isDeleted: false,
    },
  ];
  const inserted = await Project.insertMany(docs, { ordered: true });
  return inserted.map((p) => p.toObject());
};


