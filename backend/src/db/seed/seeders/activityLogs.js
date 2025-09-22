const ActivityLog = require('../../models/ActivityLog');

module.exports = async function seedActivityLogs(_count, { users, tasks }) {
  await ActivityLog.deleteMany({});
  const staff = users.find(u => u.role === 'staff') || users[0];
  const manager = users.find(u => u.role === 'manager') || users[1] || users[0];
  const homepage = tasks.find(t => t.title === 'Implement homepage') || tasks[0];

  const docs = [
    {
      userId: manager._id,
      taskId: homepage._id,
      action: 'created',
      details: { message: 'Task created' },
    },
    {
      userId: staff._id,
      taskId: homepage._id,
      action: 'status_changed',
      details: { from: 'unassigned', to: 'ongoing' },
    },
    {
      userId: manager._id,
      taskId: homepage._id,
      action: 'comment_added',
      details: { message: 'Please ensure accessibility compliance (WCAG AA).' },
    },
  ];
  await ActivityLog.insertMany(docs, { ordered: true });
  return docs;
};


