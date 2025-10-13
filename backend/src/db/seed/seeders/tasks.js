const Task = require('../../models/Task');
const { pick, dateBetween, safeDateBetween } = require('../utils/random');
const { faker } = require('../utils/faker');

module.exports = async function seedTasks(_count, { users, projects }) {
  await Task.deleteMany({});

  const nonHrUsers = (users || []).filter(u => u.role !== 'hr');
  if (nonHrUsers.length === 0) return [];

  const managers = nonHrUsers.filter(u => u.role === 'manager');
  const creatorPool = managers.length > 0 ? managers : nonHrUsers;
  const projectPool = (projects || []).slice();
  const dayMs = 24 * 60 * 60 * 1000;

  function clampDatesToProject(project, proposedCreatedAt, proposedDueDate) {
    if (!project || !project.deadline) {
      return { createdAt: proposedCreatedAt, dueDate: proposedDueDate };
    }
    const projStart = new Date(project.createdAt || Date.now()).getTime();
    const projEnd = new Date(project.deadline).getTime();
    // Ensure createdAt is within [projStart, projEnd - 2d]
    const maxCreated = projEnd - 2 * dayMs;
    const createdMs = Math.min(Math.max(proposedCreatedAt.getTime(), projStart), maxCreated);
    // Ensure dueDate is within [createdAt + 1d, projEnd - 1d]
    const minDue = createdMs + 1 * dayMs;
    const maxDue = projEnd - 1 * dayMs;
    const dueMs = Math.min(Math.max(proposedDueDate.getTime(), minDue), maxDue);
    return { createdAt: new Date(createdMs), dueDate: new Date(dueMs) };
  }

  // Target fixed number of tasks with a known count of unassigned
  const TARGET = 15;
  const UNASSIGNED = 3;

  const docs = [];
  let creatorIdx = 0;
  let projectIdx = 0;
  let taskCounter = 0;

  const assignees = nonHrUsers.slice(0, Math.max(1, Math.min(nonHrUsers.length, TARGET)));
  outer: for (let userIdx = 0; userIdx < assignees.length; userIdx++) {
    const assigneeUser = assignees[userIdx];
    for (;;) {
      taskCounter += 1;
      const idx = String(taskCounter).padStart(2, '0');
      const creator = creatorPool[creatorIdx % creatorPool.length];
      creatorIdx += 1;
      const assignedProject = projectPool.length ? projectPool[projectIdx % projectPool.length] : null;
      projectIdx += 1;
      // Ensure exactly UNASSIGNED tasks without a project
      const project = (taskCounter <= UNASSIGNED) ? null : assignedProject;

      // Build collaborators: 4 or 5 total, exclude HR and the assignee if possible
      const collSize = pick([1, 2, 3, 4, 5]);
      const collPool = nonHrUsers.filter(u => u._id.toString() !== assigneeUser._id.toString());
      const collaborators = [];
      const seen = new Set([assigneeUser._id.toString()]);
      for (let c = 0; c < collSize && collPool.length > 0; c++) {
        const candidate = collPool[faker.number.int({ min: 0, max: collPool.length - 1 })];
        if (candidate && !seen.has(candidate._id.toString())) {
          seen.add(candidate._id.toString());
          collaborators.push(candidate._id);
        }
      }
      // Ensure creator present in collaborators
      if (creator && !collaborators.find(id => id.toString() === creator._id.toString())) {
        collaborators[0] = creator._id;
      }

      // Randomize dates
      let baseCreatedAt;
      let baseDueDate;
      const now = Date.now();
      if (project && project.deadline) {
        const projStart = new Date(project.createdAt || now).getTime();
        const projEnd = new Date(project.deadline).getTime();
        const created = safeDateBetween(new Date(projStart), new Date(Math.max(projStart + 1, projEnd - 2 * dayMs)));
        const due = safeDateBetween(new Date(created.getTime() + 1 * dayMs), new Date(projEnd - 1 * dayMs));
        baseCreatedAt = created;
        baseDueDate = due;
      } else {
        baseCreatedAt = safeDateBetween(new Date(now - 45 * dayMs), new Date(now - 1 * dayMs));
        baseDueDate = safeDateBetween(new Date(now + 7 * dayMs), new Date(now + 60 * dayMs));
      }
      const bounded = clampDatesToProject(project, baseCreatedAt, baseDueDate);

      const isStandalone = !project;
      const assignedStatus = pick(['ongoing', 'under_review', 'completed']);
      docs.push({
        title: `Task-${idx}`,
        description: `Seeded Task ${idx}`,
        status: isStandalone ? 'unassigned' : assignedStatus,
        dueDate: bounded.dueDate,
        createdAt: bounded.createdAt,
        createdBy: creator._id,
        assigneeId: isStandalone ? null : assigneeUser._id,
        projectId: project ? project._id : null,
        collaborators: collaborators.slice(0, collSize),
        attachments: [],
        priority: ((taskCounter - 1) % 10) + 1,
        isDeleted: false,
      });
      if (taskCounter >= TARGET) break outer;
    }
  }

  const inserted = await Task.insertMany(docs.slice(0, TARGET), { ordered: true });
  return inserted.map((t) => t.toObject());
};