const Team = require('../../models/Team');
const { faker } = require('../utils/faker');

module.exports = async function seedTeams(count, { departments }) {
  await Team.deleteMany({});
  const docs = Array.from({ length: count }).map(() => ({
    name: `${faker.commerce.department()} Team`,
    departmentId: faker.helpers.arrayElement(departments)._id,
  }));
  const inserted = await Team.insertMany(docs, { ordered: false });
  return inserted.map((t) => t.toObject());
};


