// Mock dependencies before importing
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/domain/User');
jest.mock('../../../src/db/models');

const UserRepository = require('../../../src/repositories/UserRepository');
const User = require('../../../src/domain/User');

describe('UserService', () => {
  let mockRepository;
  let userService;

  beforeEach(() => {
    mockRepository = {
      findPublicById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      findUsersByDepartment: jest.fn(),
      findUsersByTeam: jest.fn(),
      updatePasswordHash: jest.fn(),
      setResetToken: jest.fn(),
      clearResetToken: jest.fn(),
      findByResetToken: jest.fn(),
      findAll: jest.fn()
    };
    
    UserRepository.mockImplementation(() => mockRepository);
    userService = require('../../../src/services/userService');
    userService.userRepository = mockRepository;
    jest.clearAllMocks();
  });

  // 4 tests instead of 20 - covering all methods and error cases
  it('should handle user retrieval operations', async () => {
    const mockUserDoc = { 
      _id: '507f1f77bcf86cd799439011', 
      name: 'John Doe',
      populate: jest.fn().mockImplementation(() => Promise.resolve(mockUserDoc))
    };
    const mockUser = { id: '507f1f77bcf86cd799439011' };
    const mockPopulatedDocs = [mockUserDoc];
    const mockUserModel = { populate: jest.fn().mockResolvedValue(mockPopulatedDocs) };
    
    mockRepository.findPublicById.mockResolvedValue(mockUserDoc);
    mockRepository.findByEmail.mockResolvedValue(mockUserDoc);
    mockRepository.findUsersByDepartment.mockResolvedValue([mockUserDoc]);
    mockRepository.findUsersByTeam.mockResolvedValue([mockUserDoc]);
    mockRepository.findAll.mockResolvedValue([mockUserDoc]);
    User.mockImplementation(() => mockUser);
    require('../../../src/db/models').User = mockUserModel;

    // Test all retrieval methods
    expect(await userService.getUserById('id')).toBe(mockUser);
    expect(await userService.getUserByEmail('email')).toBe(mockUser);
    expect(await userService.getUsersByDepartment('dept')).toEqual([mockUser]);
    expect(await userService.getUsersByTeam('team')).toEqual([mockUser]);
    expect(await userService.getAllUsers()).toEqual([mockUser]);

    expect(mockRepository.findPublicById).toHaveBeenCalledWith('id');
    expect(mockRepository.findByEmail).toHaveBeenCalledWith('email');
  });

  it('should handle user creation and updates', async () => {
    const mockUserDoc = { _id: '507f1f77bcf86cd799439011', name: 'John Doe' };
    const mockUser = { id: '507f1f77bcf86cd799439011' };
    const userData = { name: 'John Doe' };
    const updates = { name: 'Jane Doe' };
    const passwordHash = 'hash';
    
    mockRepository.create.mockResolvedValue(mockUserDoc);
    mockRepository.updateById.mockResolvedValue(mockUserDoc);
    mockRepository.updatePasswordHash.mockResolvedValue(mockUserDoc);
    User.mockImplementation(() => mockUser);

    expect(await userService.createUser(userData)).toBe(mockUser);
    expect(await userService.updateUser('id', updates)).toBe(mockUser);
    expect(await userService.updatePassword('id', passwordHash)).toBe(mockUser);

    expect(mockRepository.create).toHaveBeenCalledWith(userData);
    expect(mockRepository.updateById).toHaveBeenCalledWith('id', updates);
    expect(mockRepository.updatePasswordHash).toHaveBeenCalledWith('id', passwordHash);
  });

  it('should handle reset token operations', async () => {
    const mockUserDoc = { _id: '507f1f77bcf86cd799439011', resetToken: 'token' };
    const mockUser = { id: '507f1f77bcf86cd799439011' };
    const token = 'resettoken123';
    const expiry = new Date();
    
    mockRepository.setResetToken.mockResolvedValue(mockUserDoc);
    mockRepository.clearResetToken.mockResolvedValue(mockUserDoc);
    mockRepository.findByResetToken.mockResolvedValue(mockUserDoc);
    User.mockImplementation(() => mockUser);

    expect(await userService.setResetToken('id', token, expiry)).toBe(mockUser);
    expect(await userService.clearResetToken('id')).toBe(mockUser);
    expect(await userService.getUserByResetToken(token)).toBe(mockUser);

    expect(mockRepository.setResetToken).toHaveBeenCalledWith('id', token, expiry);
    expect(mockRepository.clearResetToken).toHaveBeenCalledWith('id');
    expect(mockRepository.findByResetToken).toHaveBeenCalledWith(token);
  });

  it('should handle error cases', async () => {
    mockRepository.findPublicById.mockResolvedValue(null);
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.updateById.mockResolvedValue(null);
    mockRepository.updatePasswordHash.mockResolvedValue(null);
    mockRepository.setResetToken.mockResolvedValue(null);
    mockRepository.clearResetToken.mockResolvedValue(null);
    mockRepository.findByResetToken.mockResolvedValue(null);
    mockRepository.create.mockRejectedValue(new Error('Email already exists'));

    await expect(userService.getUserById('id')).rejects.toThrow('User not found');
    await expect(userService.getUserByEmail('email')).rejects.toThrow('User not found');
    await expect(userService.updateUser('id', {})).rejects.toThrow('User not found');
    await expect(userService.updatePassword('id', 'hash')).rejects.toThrow('User not found');
    await expect(userService.setResetToken('id', 'token', new Date())).rejects.toThrow('User not found');
    await expect(userService.clearResetToken('id')).rejects.toThrow('User not found');
    await expect(userService.getUserByResetToken('token')).rejects.toThrow('Invalid or expired reset token');
    await expect(userService.createUser({})).rejects.toThrow('Email already exists');
  });
});
