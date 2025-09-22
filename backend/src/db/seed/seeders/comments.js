const Comment = require('../../models/Comment');
const { faker } = require('../utils/faker');

module.exports = async function seedComments(count, { users, tasks }) {
  await Comment.deleteMany({});
  const docs = Array.from({ length: count }).map(() => ({
    taskId: faker.helpers.arrayElement(tasks)._id,
    userId: faker.helpers.arrayElement(users)._id,
    content: faker.lorem.sentences({ min: 1, max: 3 }),
  }));
  const inserted = await Comment.insertMany(docs, { ordered: false });
  return inserted.map((c) => c.toObject());
};


