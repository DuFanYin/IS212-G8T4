const Subtask = require('../../models/Subtask');

module.exports = async function seedSubtasks(_count, { tasks }) {
  await Subtask.deleteMany({});
  const homepage = tasks.find(t => t.title === 'Implement homepage') || tasks[0];
  const apiLatency = tasks.find(t => t.title === 'Improve API latency') || tasks[1] || tasks[0];
  const onboarding = tasks.find(t => t.title === 'Onboarding checklist draft') || homepage;

  const docs = [
    {
      parentTaskId: homepage._id,
      title: 'Build hero section',
      description: 'Responsive hero with CTA',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'ongoing',
      assigneeId: homepage.assigneeId,
      collaborators: [],
    },
    {
      parentTaskId: apiLatency._id,
      title: 'Add Redis cache',
      description: 'Cache common GET responses',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'unassigned',
      assigneeId: undefined,
      collaborators: [],
    },
    // Ensure at least one predictable subtask for tests
    {
      parentTaskId: homepage._id,
      title: 'Seeded Subtask For Tests',
      description: 'Auto-generated for subtask tests',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'unassigned',
      assigneeId: homepage.assigneeId,
      collaborators: homepage.assigneeId ? [homepage.assigneeId] : [],
    },
    {
      parentTaskId: onboarding._id,
      title: 'Collect sample materials',
      description: 'Gather current onboarding docs',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'unassigned',
      assigneeId: onboarding.assigneeId,
      collaborators: onboarding.assigneeId ? [onboarding.assigneeId] : [],
    },
  ];
  const inserted = await Subtask.insertMany(docs, { ordered: true });
  return inserted.map((s) => s.toObject());
};


