const Subtask = require('../../models/Subtask');
const { pick, dateBetween, safeDateBetween } = require('../utils/random');
const { faker } = require('../utils/faker');

// Simple seeded random number generator for consistent results
class SeededRandom {
  constructor(seed = 67890) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  randomInRange(min, max) {
    return min + (max - min) * this.next();
  }
}

function boundedDates(parentTask, rng) {
  const start = new Date(parentTask.createdAt).getTime();
  const end = new Date(parentTask.dueDate).getTime();
  const minStart = start;
  const maxStart = start + (end - start) * 0.7;
  const st = safeDateBetween(new Date(minStart), new Date(maxStart));
  const due = safeDateBetween(new Date(st.getTime() + 24 * 60 * 60 * 1000), new Date(end - 24 * 60 * 60 * 1000));
  return { createdAt: st, dueDate: due };
}

module.exports = async function seedSubtasks(_count, { tasks }) {
  await Subtask.deleteMany({});

  const rng = new SeededRandom(67890);
  const docs = [];

  // Create exactly 2 subtasks per task (targets 30 total for 15 tasks)
  (tasks || []).forEach((t, i) => {
    const num = 2;
    for (let s = 0; s < num; s++) {
      const idx = String(s + 1).padStart(2, '0');
      const collabs = Array.isArray(t.collaborators) ? t.collaborators.filter(Boolean) : [];
      const assignee = t.assigneeId || collabs[0] || t.createdBy;
      const dates = boundedDates(t, rng);
      const status = assignee ? pick(['ongoing', 'under_review', 'completed']) : 'unassigned';
      docs.push({
        parentTaskId: t._id,
        title: `Subtask-${idx}`,
        description: `Seeded Subtask ${idx}`,
        ...dates,
        status,
        assigneeId: assignee || null,
        collaborators: collabs.slice(0, 3),
      });
    }
  });

  const inserted = await Subtask.insertMany(docs, { ordered: true });
  return inserted.map((s) => s.toObject());
};