const Project = require('../../models/Project');
const { pick } = require('../utils/random');
const { faker } = require('../utils/faker');

module.exports = async function seedProjects(_count, { users, teams, departments }) {
  await Project.deleteMany({});

  const nonHrUsers = users.filter(u => u.role !== 'hr');
  const managers = nonHrUsers.filter(u => u.role === 'manager');
  const ownersPool = managers.length > 0 ? managers : nonHrUsers;

  const deptPool = departments && departments.length ? departments : [];
  const numProjects = 5; // reduced to 5 projects

  const docs = [];
  for (let i = 0; i < numProjects; i++) {
    const idx = String(i + 1).padStart(2, '0');
    const owner = ownersPool[faker.number.int({ min: 0, max: ownersPool.length - 1 })];
    const dept = deptPool.length ? deptPool[faker.number.int({ min: 0, max: deptPool.length - 1 })] : undefined;
    // 4-5 collaborators chosen randomly, exclude owner, ensure unique
    const desired = pick([4, 5]);
    const collPool = nonHrUsers.filter(u => u._id.toString() !== owner._id.toString());
    const seen = new Set();
    const collaborators = [];
    for (let c = 0; c < desired && collPool.length > 0; c++) {
      let candidate;
      let guard = 0;
      do {
        candidate = collPool[faker.number.int({ min: 0, max: collPool.length - 1 })];
        guard += 1;
      } while (candidate && seen.has(candidate._id.toString()) && guard < 20);
      if (candidate && !seen.has(candidate._id.toString())) {
        seen.add(candidate._id.toString());
        collaborators.push(candidate._id);
      }
    }

    // Convert collaborators to new schema format
    const collaboratorObjects = collaborators.map(collabId => ({
      user: collabId,
      role: 'viewer', // default role
      assignedBy: owner._id,
      assignedAt: new Date()
    }));

    docs.push({
      name: `Project-${idx}`,
      description: `Seeded Project ${idx}`,
      ownerId: owner._id,
      departmentId: dept ? dept._id : undefined,
      deadline: new Date(Date.now() + (15 + i * 3) * 24 * 60 * 60 * 1000),
      collaborators: collaboratorObjects,
      hasContainedTasks: true,
    });
  }

  const inserted = await Project.insertMany(docs, { ordered: true });
  return inserted.map((p) => p.toObject());
};


