const UserRepository = require('../../../src/repositories/UserRepository');
const UserModel = require('../../../src/db/models/User');

jest.mock('../../../src/db/models/User');

describe('UserRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new UserRepository();
    jest.clearAllMocks();
  });

  // Core CRUD operations - 4 tests instead of 12
  it('should handle find operations', async () => {
    const mockUser = { _id: '507f1f77bcf86cd799439011', name: 'John Doe' };
    const mockQuery = { select: jest.fn().mockResolvedValue(mockUser) };
    
    // Mock different calls for different methods
    UserModel.findById
      .mockResolvedValueOnce(mockUser)  // for findById
      .mockReturnValueOnce(mockQuery);   // for findPublicById
    UserModel.findOne.mockResolvedValue(mockUser);
    UserModel.find.mockReturnValue(mockQuery);

    // Test findById, findPublicById, findByEmail, findAll
    expect(await repository.findById('id')).toBe(mockUser);
    expect(await repository.findPublicById('id')).toBe(mockUser);
    expect(await repository.findByEmail('email')).toBe(mockUser);
    expect(await repository.findAll()).toBe(mockUser);
    
    expect(UserModel.findById).toHaveBeenCalledTimes(2);
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'email' });
    expect(UserModel.find).toHaveBeenCalledWith({});
    expect(mockQuery.select).toHaveBeenCalledWith('-passwordHash');
  });

  it('should handle find by department and team', async () => {
    const mockUsers = [{ _id: '507f1f77bcf86cd799439011' }];
    const mockQuery = { select: jest.fn().mockResolvedValue(mockUsers) };
    UserModel.find.mockReturnValue(mockQuery);

    expect(await repository.findUsersByDepartment('dept')).toBe(mockUsers);
    expect(await repository.findUsersByTeam('team')).toBe(mockUsers);
    
    expect(UserModel.find).toHaveBeenCalledWith({ departmentId: 'dept' });
    expect(UserModel.find).toHaveBeenCalledWith({ teamId: 'team' });
  });

  it('should handle create and update operations', async () => {
    const mockUser = { _id: '507f1f77bcf86cd799439011', name: 'John Doe' };
    const userData = { name: 'John Doe' };
    const updates = { name: 'Jane Doe' };
    
    UserModel.create.mockResolvedValue(mockUser);
    UserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

    expect(await repository.create(userData)).toBe(mockUser);
    expect(await repository.updateById('id', updates)).toBe(mockUser);
    expect(await repository.updatePasswordHash('id', 'hash')).toBe(mockUser);
    
    expect(UserModel.create).toHaveBeenCalledWith(userData);
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
  });

  it('should handle reset token operations', async () => {
    const mockUser = { _id: '507f1f77bcf86cd799439011', resetToken: 'token' };
    const token = 'resettoken123';
    const expiry = new Date();
    
    UserModel.findByIdAndUpdate.mockResolvedValue(mockUser);
    UserModel.findOne.mockResolvedValue(mockUser);

    expect(await repository.setResetToken('id', token, expiry)).toBe(mockUser);
    expect(await repository.clearResetToken('id')).toBe(mockUser);
    expect(await repository.findByResetToken(token)).toBe(mockUser);
    
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
    expect(UserModel.findOne).toHaveBeenCalledWith({ 
      resetToken: token, 
      resetTokenExpiry: { $gt: expect.any(Date) } 
    });
  });
});
