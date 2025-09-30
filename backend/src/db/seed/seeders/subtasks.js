const Subtask = require('../../models/Subtask');

function pickAssigneeForTask(task) {
  // Prefer existing task assignee; else fall back to a task collaborator; else creator
  if (task.assigneeId) return task.assigneeId;
  if (Array.isArray(task.collaborators) && task.collaborators.length > 0) return task.collaborators[0];
  return task.createdBy;
}

function buildCollaborators(task) {
  // Must be a subset of the parent task collaborators per requirements
  // If task has no collaborators, return empty array
  const collabs = Array.isArray(task.collaborators) ? task.collaborators.filter(Boolean) : [];
  return collabs;
}

module.exports = async function seedSubtasks(_count, { tasks }) {
  await Subtask.deleteMany({});

  // Select a few parent tasks by intent/name, with safe fallbacks
  const homepage = tasks.find(t => t.title === 'Implement homepage') || tasks[0];
  const apiLatency = tasks.find(t => t.title === 'Improve API latency') || tasks[1] || tasks[0];
  const onboarding = tasks.find(t => t.title === 'Onboarding checklist draft') || tasks.find(t => t.title?.toLowerCase?.().includes('onboarding')) || homepage;
  const backlog = tasks.find(t => t.title === 'Reduce ticket backlog') || apiLatency;

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const docs = [
    // Homepage subtasks
    {
      parentTaskId: homepage._id,
      title: 'Build hero section',
      description: 'Responsive hero with CTA and background illustration',
      dueDate: new Date(now + 7 * day),
      status: 'ongoing',
      assigneeId: pickAssigneeForTask(homepage),
      collaborators: buildCollaborators(homepage),
    },
    {
      parentTaskId: homepage._id,
      title: 'Implement navigation & footer',
      description: 'Accessible header with dropdowns; sticky footer links',
      dueDate: new Date(now + 9 * day),
      status: 'unassigned',
      assigneeId: pickAssigneeForTask(homepage),
      collaborators: buildCollaborators(homepage),
    },

    // API latency subtasks
    {
      parentTaskId: apiLatency._id,
      title: 'Add Redis cache',
      description: 'Cache common GET responses with sane TTLs',
      dueDate: new Date(now + 10 * day),
      status: 'ongoing',
      assigneeId: pickAssigneeForTask(apiLatency),
      collaborators: buildCollaborators(apiLatency),
    },
    {
      parentTaskId: apiLatency._id,
      title: 'Add request-level metrics',
      description: 'Instrument p50/p95 latency via middleware',
      dueDate: new Date(now + 12 * day),
      status: 'unassigned',
      assigneeId: pickAssigneeForTask(apiLatency),
      collaborators: buildCollaborators(apiLatency),
    },

    // Onboarding subtasks
    {
      parentTaskId: onboarding._id,
      title: 'Collect sample materials',
      description: 'Gather latest onboarding docs and templates',
      dueDate: new Date(now + 5 * day),
      status: 'unassigned',
      assigneeId: pickAssigneeForTask(onboarding),
      collaborators: buildCollaborators(onboarding),
    },
    {
      parentTaskId: onboarding._id,
      title: 'Draft checklists',
      description: 'Draft role-specific onboarding checklists',
      dueDate: new Date(now + 8 * day),
      status: 'ongoing',
      assigneeId: pickAssigneeForTask(onboarding),
      collaborators: buildCollaborators(onboarding),
    },

    // Backlog subtasks
    {
      parentTaskId: backlog._id,
      title: 'Update response macros',
      description: 'Standardize support canned responses by category',
      dueDate: new Date(now + 6 * day),
      status: 'ongoing',
      assigneeId: pickAssigneeForTask(backlog),
      collaborators: buildCollaborators(backlog),
    },
    {
      parentTaskId: backlog._id,
      title: 'Group backlog by root cause',
      description: 'Analyze tickets and group by top 5 root causes',
      dueDate: new Date(now + 7 * day),
      status: 'unassigned',
      assigneeId: pickAssigneeForTask(backlog),
      collaborators: buildCollaborators(backlog),
    },

    // Predictable subtask for tests
    {
      parentTaskId: homepage._id,
      title: 'Seeded Subtask For Tests',
      description: 'Auto-generated stable subtask for tests',
      dueDate: new Date(now + 4 * day),
      status: 'unassigned',
      assigneeId: pickAssigneeForTask(homepage),
      // Keep collaborators subset of parent task collaborators
      collaborators: buildCollaborators(homepage),
    },
  ];

  const inserted = await Subtask.insertMany(docs, { ordered: true });
  return inserted.map((s) => s.toObject());
};


