const User = require('../../../src/domain/User');

describe('Domain: User', () => {
  it('role helpers return expected booleans', () => {
    expect(new User({ id: '1', role: 'manager' }).isManager()).toBe(true);
    expect(new User({ id: '1', role: 'director' }).isManager()).toBe(true);
    expect(new User({ id: '1', role: 'sm' }).isManager()).toBe(true);
    expect(new User({ id: '1', role: 'staff' }).isManager()).toBe(false);
    expect(new User({ id: '1', role: 'hr' }).isHR()).toBe(true);
    expect(new User({ id: '1', role: 'sm' }).isSeniorManagement()).toBe(true);
    expect(new User({ id: '1', role: 'director' }).isDirector()).toBe(true);
  });

  it('canAccessDepartment matches departmentId equality', () => {
    const user = new User({ id: '1', role: 'director', departmentId: 'd1' });
    expect(user.canAccessDepartment('d1')).toBe(true);
    expect(user.canAccessDepartment('d2')).toBe(false);
  });
});


