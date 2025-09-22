const Department = require('../../models/Department');
const { faker } = require('../utils/faker');

module.exports = async function seedDepartments(count) {
  await Department.deleteMany({});
  const docs = Array.from({ length: count }).map(() => ({
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
  }));
  const inserted = await Department.insertMany(docs, { ordered: false });
  return inserted.map((d) => d.toObject());
};


