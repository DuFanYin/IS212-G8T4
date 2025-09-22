const ActivityLog = require('../../models/ActivityLog');
const { faker } = require('../utils/faker');

module.exports = async function seedActivityLogs(count, { users, tasks }) {
  await ActivityLog.deleteMany({});
  const ACTIONS = [
    'created',
    'updated',
    'status_changed',
    'assigned',
    'comment_added',
    'attachment_added',
    'attachment_removed',
    'subtask_added',
    'subtask_completed',
    'subtask_removed'
  ];
  const docs = Array.from({ length: count }).map(() => ({
    userId: faker.helpers.arrayElement(users)._id,
    taskId: faker.helpers.arrayElement(tasks)._id,
    action: faker.helpers.arrayElement(ACTIONS),
    details: { message: faker.lorem.sentence() },
  }));
  await ActivityLog.insertMany(docs, { ordered: false });
  return docs;
};


