const Task = require('../../../src/domain/Task');
const User = require('../../../src/domain/User');

describe('Domain: Task', () => {
  const base = {
    id: 't1',
    title: 'Title',
    description: 'Desc',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'unassigned',
    createdBy: 'u1',
    collaborators: [],
    attachments: [],
    isDeleted: false,
  };

  const makeUser = (overrides = {}) => new User({ id: 'uX', role: 'staff', ...overrides });

  it('computes isOverdue based on dueDate and status', () => {
    const pastDue = new Task({ ...base, dueDate: new Date(Date.now() - 1000).toISOString(), status: 'ongoing' });
    expect(pastDue.isOverdue()).toBe(true);
    const completed = new Task({ ...base, dueDate: new Date(Date.now() - 1000).toISOString(), status: 'completed' });
    expect(completed.isOverdue()).toBe(false);
  });

  it('can be completed by creator, assignee or collaborator', () => {
    const creator = makeUser({ id: 'u1' });
    const assignee = makeUser({ id: 'u2' });
    const collaborator = makeUser({ id: 'u3' });
    const t1 = new Task({ ...base });
    expect(t1.canBeCompletedBy(creator)).toBe(true);
    const t2 = new Task({ ...base, assigneeId: 'u2' });
    expect(t2.canBeCompletedBy(assignee)).toBe(true);
    const t3 = new Task({ ...base, collaborators: ['u3'] });
    expect(t3.canBeCompletedBy(collaborator)).toBe(true);
  });

  it('assignTo sets assignee and status=ongoing', () => {
    const task = new Task({ ...base });
    task.assignTo('u9');
    expect(task.assigneeId).toBe('u9');
    expect(task.isOngoing()).toBe(true);
  });

  it('updateStatus records lastStatusUpdate', () => {
    const task = new Task({ ...base });
    const updater = makeUser({ id: 'u7' });
    task.updateStatus('under_review', updater);
    expect(task.status).toBe('under_review');
    expect(task.lastStatusUpdate).toEqual(expect.objectContaining({ status: 'under_review', updatedBy: 'u7' }));
  });

  it('addCollaborator avoids duplicates', () => {
    const task = new Task({ ...base, collaborators: ['u1'] });
    task.addCollaborator('u1');
    task.addCollaborator('u2');
    expect(task.collaborators).toEqual(['u1', 'u2']);
  });
});


