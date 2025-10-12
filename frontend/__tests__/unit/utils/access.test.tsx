import { canViewDepartment, canViewTeam, getRoleRank } from '@/lib/utils/access';

describe('Access Utils', () => {
  const mockUser = {
    id: 'user1',
    role: 'manager',
    departmentId: 'dept1',
    teamId: 'team1'
  };

  it('allows manager to view department', () => {
    const canView = canViewDepartment(mockUser.role);
    expect(canView).toBe(false); // Manager rank is 2, department requires 3+
  });

  it('allows director to view department', () => {
    const directorUser = { ...mockUser, role: 'director' };
    const canView = canViewDepartment(directorUser.role);
    expect(canView).toBe(true);
  });

  it('allows manager to view team', () => {
    const canView = canViewTeam(mockUser.role);
    expect(canView).toBe(true);
  });

  it('denies staff from viewing team', () => {
    const staffUser = { ...mockUser, role: 'staff' };
    const canView = canViewTeam(staffUser.role);
    expect(canView).toBe(false);
  });

  it('returns correct role rank for manager', () => {
    const rank = getRoleRank(mockUser.role);
    expect(rank).toBe(2);
  });

  it('returns correct role rank for staff', () => {
    const staffUser = { ...mockUser, role: 'staff' };
    const rank = getRoleRank(staffUser.role);
    expect(rank).toBe(1);
  });
});
