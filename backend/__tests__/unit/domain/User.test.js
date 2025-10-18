const User = require('../../../src/domain/User');

describe('User Domain Class', () => {
  let userData;
  let user;

  beforeEach(() => {
    userData = {
      _id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'manager',
      teamId: '507f1f77bcf86cd799439012',
      departmentId: '507f1f77bcf86cd799439013',
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    };
    user = new User(userData);
  });

  describe('Constructor', () => {
    it('should initialize with provided data', () => {
      expect(user.id).toBe(userData._id);
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.teamId).toBe(userData.teamId);
      expect(user.departmentId).toBe(userData.departmentId);
      expect(user.resetToken).toBe(userData.resetToken);
      expect(user.resetTokenExpiry).toBe(userData.resetTokenExpiry);
      expect(user.createdAt).toBe(userData.createdAt);
      expect(user.updatedAt).toBe(userData.updatedAt);
    });

    it('should handle data with id instead of _id', () => {
      const dataWithId = { ...userData, id: 'test-id' };
      delete dataWithId._id;
      const userWithId = new User(dataWithId);
      expect(userWithId.id).toBe('test-id');
    });

    it('should handle populated team and department data', () => {
      const populatedData = {
        ...userData,
        teamId: { _id: '507f1f77bcf86cd799439012', name: 'Development Team' },
        departmentId: { _id: '507f1f77bcf86cd799439013', name: 'Engineering' }
      };
      const populatedUser = new User(populatedData);
      expect(populatedUser.teamId).toBe('507f1f77bcf86cd799439012');
      expect(populatedUser.departmentId).toBe('507f1f77bcf86cd799439013');
      expect(populatedUser.teamName).toBe('Development Team');
      expect(populatedUser.departmentName).toBe('Engineering');
    });
  });

  describe('Role checks', () => {
    it('should identify managers correctly', () => {
      expect(user.isManager()).toBe(true);
      
      const staffUser = new User({ ...userData, role: 'staff' });
      expect(staffUser.isManager()).toBe(false);
    });

    it('should identify staff correctly', () => {
      const staffUser = new User({ ...userData, role: 'staff' });
      expect(staffUser.isStaff()).toBe(true);
      expect(user.isStaff()).toBe(false);
    });

    it('should identify HR correctly', () => {
      const hrUser = new User({ ...userData, role: 'hr' });
      expect(hrUser.isHR()).toBe(true);
      expect(user.isHR()).toBe(false);
    });

    it('should identify senior management correctly', () => {
      const smUser = new User({ ...userData, role: 'sm' });
      expect(smUser.isSeniorManagement()).toBe(true);
      expect(user.isSeniorManagement()).toBe(false);
    });

    it('should identify directors correctly', () => {
      const directorUser = new User({ ...userData, role: 'director' });
      expect(directorUser.isDirector()).toBe(true);
      expect(user.isDirector()).toBe(false);
    });
  });

  describe('Permission checks', () => {
    it('should allow task assignment for managers, directors, and SM', () => {
      expect(user.canAssignTasks()).toBe(true);
      
      const directorUser = new User({ ...userData, role: 'director' });
      expect(directorUser.canAssignTasks()).toBe(true);
      
      const smUser = new User({ ...userData, role: 'sm' });
      expect(smUser.canAssignTasks()).toBe(true);
      
      const staffUser = new User({ ...userData, role: 'staff' });
      expect(staffUser.canAssignTasks()).toBe(false);
    });

    it('should allow seeing all tasks for HR and SM', () => {
      const hrUser = new User({ ...userData, role: 'hr' });
      expect(hrUser.canSeeAllTasks()).toBe(true);
      
      const smUser = new User({ ...userData, role: 'sm' });
      expect(smUser.canSeeAllTasks()).toBe(true);
      
      expect(user.canSeeAllTasks()).toBe(false);
    });

    it('should allow seeing department tasks for directors', () => {
      const directorUser = new User({ ...userData, role: 'director' });
      expect(directorUser.canSeeDepartmentTasks()).toBe(true);
      
      expect(user.canSeeDepartmentTasks()).toBe(false);
    });

    it('should allow seeing team tasks for managers', () => {
      expect(user.canSeeTeamTasks()).toBe(true);
      
      const directorUser = new User({ ...userData, role: 'director' });
      expect(directorUser.canSeeTeamTasks()).toBe(false);
    });

    it('should check department access correctly', () => {
      expect(user.canAccessDepartment('507f1f77bcf86cd799439013')).toBe(true);
      expect(user.canAccessDepartment('507f1f77bcf86cd799439999')).toBe(false);
      expect(user.canAccessDepartment(null)).toBe(false);
      
      const userWithoutDept = new User({ ...userData, departmentId: null });
      expect(userWithoutDept.canAccessDepartment('507f1f77bcf86cd799439013')).toBe(false);
    });
  });

  describe('DTOs', () => {
    it('should return complete profile DTO', () => {
      const profileDto = user.toProfileDTO();
      expect(profileDto).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        teamName: user.teamName,
        departmentId: user.departmentId,
        departmentName: user.departmentName
      });
    });

    it('should return safe DTO without sensitive data', () => {
      const safeDto = user.toSafeDTO();
      expect(safeDto).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
      expect(safeDto.teamId).toBeUndefined();
      expect(safeDto.departmentId).toBeUndefined();
      expect(safeDto.resetToken).toBeUndefined();
    });
  });
});
