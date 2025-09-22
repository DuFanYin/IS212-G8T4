const Project = require('../../models/Project');
const { faker } = require('../utils/faker');

module.exports = async function seedProjects(count, { users, teams, departments }) {
  await Project.deleteMany({});
  const managers = users.filter((u) => u.role === 'manager');
  const docs = Array.from({ length: count }).map(() => ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    departmentId: faker.helpers.arrayElement(departments)._id,
    teamId: faker.helpers.arrayElement(teams)._id,
    ownerId: faker.helpers.arrayElement(managers.length ? managers : users)._id,
    isDeleted: false,
  }));
  const inserted = await Project.insertMany(docs, { ordered: false });
  return inserted.map((p) => p.toObject());
};


