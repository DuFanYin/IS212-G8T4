const Comment = require('../../models/Comment');

module.exports = async function seedComments(_count, { users, tasks }) {
  await Comment.deleteMany({});
  const staff = users.find(u => u.role === 'staff') || users[0];
  const manager = users.find(u => u.role === 'manager') || users[1] || users[0];
  const homepage = tasks.find(t => t.title === 'Implement homepage') || tasks[0];

  const docs = [
    {
      taskId: homepage._id,
      userId: staff._id,
      content: 'Started working on the hero section.',
    },
    {
      taskId: homepage._id,
      userId: manager._id,
      content: 'Please ensure accessibility compliance (WCAG AA).',
    },
  ];
  const inserted = await Comment.insertMany(docs, { ordered: true });
  return inserted.map((c) => c.toObject());
};


