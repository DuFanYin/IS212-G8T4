const ActivityLog = require('../../models/ActivityLog');

// Seed realistic activity logs tied to existing users and tasks
// Actions covered: created, updated, status_changed, assigned, collaborator_added/removed, comment_added
module.exports = async function seedActivityLogs(count, { users = [], tasks = [] }) {
  await ActivityLog.deleteMany({});

  if (!Array.isArray(users) || users.length === 0) return [];
  if (!Array.isArray(tasks) || tasks.length === 0) return [];

  const managers = users.filter(u => u.role === 'manager');
  const staffs = users.filter(u => u.role === 'staff');
  const anyUser = (users[0] || null);

  function pick(arr, fallback = null) {
    return Array.isArray(arr) && arr.length ? arr[Math.floor(Math.random() * arr.length)] : fallback;
  }

  const docs = [];

  // Create logs for up to N tasks (spread across tasks)
  const maxTasks = Math.min(tasks.length, Math.max(10, Math.floor((count || 100) / 5)));

  for (let i = 0; i < maxTasks; i++) {
    const t = tasks[i];
    if (!t?._id) continue;

    const creator = users.find(u => u._id?.toString() === t.createdBy?.toString()) || pick(managers, anyUser);
    const assignee = t.assigneeId ? users.find(u => u._id?.toString() === t.assigneeId?.toString()) : pick(staffs, anyUser);
    const manager = pick(managers, creator || anyUser);
    const staff = pick(staffs, assignee || anyUser);

    // 1) created
    if (creator) {
      docs.push({
        userId: creator._id,
        taskId: t._id,
        projectId: t.projectId, // Add projectId if available
        action: 'created',
        resourceType: 'task',
        details: {
          title: t.title,
          priority: t.priority,
          createdBy: creator._id,
        }
      });
    }

    // 2) assigned (manager assigns staff)
    if (manager && staff) {
      docs.push({
        userId: manager._id,
        taskId: t._id,
        projectId: t.projectId,
        action: 'assigned',
        resourceType: 'task',
        details: {
          from: t.assigneeId || null,
          to: staff._id,
        }
      });
    }

    // 3) status change (staff moves task forward)
    if (staff) {
      const fromStatus = t.status || 'unassigned';
      const toStatus = fromStatus === 'unassigned' ? 'ongoing' : (fromStatus === 'ongoing' ? 'under_review' : 'completed');
      docs.push({
        userId: staff._id,
        taskId: t._id,
        projectId: t.projectId,
        action: 'status_changed',
        resourceType: 'task',
        details: { from: fromStatus, to: toStatus }
      });
    }

    // 4) collaborator added
    if (manager && staff) {
      docs.push({
        userId: manager._id,
        taskId: t._id,
        projectId: t.projectId,
        action: 'collaborator_added',
        resourceType: 'task',
        details: { collaboratorId: staff._id }
      });
    }

    // 5) comment added
    docs.push({
      userId: (staff || manager || anyUser)?._id,
      taskId: t._id,
      projectId: t.projectId,
      action: 'comment_added',
      resourceType: 'task',
      details: { message: `Progress update for ${t.title}` }
    });
  }

  // Cap or extend to requested count
  const toInsert = (count && count > 0) ? docs.slice(0, count) : docs;
  if (toInsert.length === 0) return [];

  const inserted = await ActivityLog.insertMany(toInsert, { ordered: true });
  return inserted.map(d => (d.toObject ? d.toObject() : d));
};


