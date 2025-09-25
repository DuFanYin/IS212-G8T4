const Project = require('../../../src/domain/Project');
const User = require('../../../src/domain/User');

describe('Domain: Project', () => {
  const ownerId = 'u1';
  const base = {
    id: 'p1',
    name: 'Proj',
    description: 'Desc',
    ownerId,
    departmentId: 'd1',
    collaborators: [],
    isArchived: false,
  };

  const makeUser = (overrides = {}) => new User({ id: 'ux', role: 'staff', departmentId: 'd1', ...overrides });

  it('adds owner to collaborators on construct', () => {
    const p = new Project({ ...base });
    expect(p.collaborators).toContain(ownerId);
  });

  it('access rules: owner, collaborator, HR/SM, director of same dept', () => {
    const p = new Project({ ...base, collaborators: [ownerId] });
    const owner = makeUser({ id: ownerId });
    const collab = makeUser({ id: 'u2' });
    p.addCollaborator('u2');
    const hr = makeUser({ role: 'hr' });
    const sm = makeUser({ role: 'sm' });
    const directorSame = makeUser({ role: 'director', departmentId: 'd1' });
    const directorOther = makeUser({ role: 'director', departmentId: 'd2' });

    expect(p.canBeAccessedBy(owner)).toBe(true);
    expect(p.canBeAccessedBy(collab)).toBe(true);
    expect(p.canBeAccessedBy(hr)).toBe(true);
    expect(p.canBeAccessedBy(sm)).toBe(true);
    expect(p.canBeAccessedBy(directorSame)).toBe(true);
    expect(p.canBeAccessedBy(directorOther)).toBe(false);
  });

  it('modification rules: owner or manager', () => {
    const p = new Project({ ...base });
    const owner = makeUser({ id: ownerId });
    const manager = makeUser({ role: 'manager' });
    const staff = makeUser({ role: 'staff' });
    expect(p.canBeModifiedBy(owner)).toBe(true);
    expect(p.canBeModifiedBy(manager)).toBe(true);
    expect(p.canBeModifiedBy(staff)).toBe(false);
  });
});


