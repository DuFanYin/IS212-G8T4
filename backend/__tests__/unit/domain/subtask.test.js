const Subtask = require('../../../src/domain/Subtask');
const User = require('../../../src/domain/User');

describe('Domain: Subtask', () => {
  const base = {
    id: 's1',
    parentTaskId: 't1',
    title: 'Sub',
    description: 'Desc',
    dueDate: new Date(Date.now() + 1000).toISOString(),
    status: 'unassigned',
    collaborators: [],
    isDeleted: false,
  };

  const makeUser = (overrides = {}) => new User({ id: 'u1', role: 'staff', ...overrides });

  it('isOverdue respects due date and completion', () => {
    const s1 = new Subtask({ ...base, dueDate: new Date(Date.now() - 1000).toISOString(), status: 'ongoing' });
    expect(s1.isOverdue()).toBe(true);
    const s2 = new Subtask({ ...base, dueDate: new Date(Date.now() - 1000).toISOString(), status: 'completed' });
    expect(s2.isOverdue()).toBe(false);
  });

  it('assignTo sets assignee and adds collaborator', () => {
    const s = new Subtask({ ...base });
    s.assignTo('u9');
    expect(s.assigneeId).toBe('u9');
    expect(s.collaborators).toContain('u9');
  });

  it('permissions: assignee or collaborator can edit/complete', () => {
    const assignee = makeUser({ id: 'u2' });
    const collab = makeUser({ id: 'u3' });
    const s1 = new Subtask({ ...base, assigneeId: 'u2' });
    const s2 = new Subtask({ ...base, collaborators: ['u3'] });
    expect(s1.canBeCompletedBy(assignee)).toBe(true);
    expect(s2.canBeCompletedBy(collab)).toBe(true);
    expect(s1.canBeEditedBy(assignee)).toBe(true);
    expect(s2.canBeEditedBy(collab)).toBe(true);
  });
});


