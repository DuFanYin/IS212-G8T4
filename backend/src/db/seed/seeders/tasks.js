const Task = require('../../models/Task');
const { faker } = require('../utils/faker');

const STATUSES = ['unassigned', 'ongoing', 'under_review', 'completed'];

module.exports = async function seedTasks(count, { users, projects }) {
  await Task.deleteMany({});
  const docs = Array.from({ length: count }).map(() => {
    const project = faker.helpers.arrayElement(projects);
    const assignee = faker.helpers.arrayElement(users);
    return {
      title: faker.hacker.verb() + ' ' + faker.hacker.noun(),
      description: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(STATUSES),
      dueDate: faker.date.future(),
      createdBy: faker.helpers.arrayElement(users)._id,
      assigneeId: assignee._id,
      projectId: project._id,
      collaborators: faker.helpers.arrayElements(users, { min: 0, max: 3 }).map(u => u._id),
      attachments: [],
      isDeleted: false,
    };
  });
  const inserted = await Task.insertMany(docs, { ordered: false });
  return inserted.map((t) => t.toObject());
};


