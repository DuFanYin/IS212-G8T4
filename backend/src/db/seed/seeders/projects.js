const Project = require('../../models/Project');

module.exports = async function seedProjects(_count, { users, teams, departments }) {
  await Project.deleteMany({});
  const managers = users.filter(u => u.role === 'manager');
  const staffers = users.filter(u => u.role === 'staff');
  const pickManager = (i = 0) => managers[i % (managers.length || 1)] || users[0];
  const pickStaff = (i = 0) => staffers[i % (staffers.length || 1)] || users[0];
  const engDept = departments.find(d => d.name === 'Engineering') || departments[0];
  const opsDept = departments.find(d => d.name === 'Operations') || departments[1] || departments[0];
  const salesDept = departments.find(d => d.name === 'Sales') || departments[2] || departments[0];

  const docs = [
    {
      name: 'Website Revamp',
      description: 'Rebuild marketing website in Next.js',
      departmentId: engDept._id,
      ownerId: pickManager(0)._id,
      // Add realistic deadline: ~30 days from now
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      collaborators: [pickManager(0)._id, pickStaff(0)._id],
    },
    {
      name: 'Platform Reliability',
      description: 'Stability and performance improvements',
      departmentId: engDept._id,
      ownerId: pickManager(1)._id,
      // ~60 days from now
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      collaborators: [pickManager(1)._id, pickStaff(1)._id],
    },
    // Ensure there is at least one project owned by a staff user for tests that
    // require owner-level permissions from a non-manager role
    {
      name: 'Staff Sandbox Project',
      description: 'Seeded project owned by a staff user for tests',
      departmentId: engDept._id,
      ownerId: pickStaff(2)._id,
      // ~15 days from now
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      collaborators: [pickStaff(2)._id, pickManager(2)._id],
    },
    {
      name: 'Support Triage Improvements',
      description: 'Improve response SLAs and ticket routing',
      departmentId: opsDept._id,
      ownerId: pickManager(3)._id,
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      collaborators: [pickManager(3)._id, pickStaff(3)._id],
    },
    {
      name: 'Sales CRM Upgrade',
      description: 'Improve CRM workflows and data hygiene',
      departmentId: salesDept._id,
      ownerId: pickManager(4)._id,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      collaborators: [pickManager(4)._id, pickStaff(4)._id],
    },
  ];
  const inserted = await Project.insertMany(docs, { ordered: true });
  return inserted.map((p) => p.toObject());
};


