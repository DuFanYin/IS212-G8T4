const Subtask = require('../../models/Subtask');
const { faker } = require('../utils/faker');

module.exports = async function seedSubtasks(count, { tasks }) {
  await Subtask.deleteMany({});
  const docs = Array.from({ length: count }).map(() => ({
    parentTaskId: faker.helpers.arrayElement(tasks)._id,
    title: faker.hacker.ingverb() + ' ' + faker.hacker.noun(),
    description: faker.lorem.sentence(),
    dueDate: faker.date.future(),
    status: faker.helpers.arrayElement(['unassigned', 'ongoing', 'under_review', 'completed']),
    assigneeId: undefined,
    collaborators: [],
  }));
  const inserted = await Subtask.insertMany(docs, { ordered: false });
  return inserted.map((s) => s.toObject());
};


