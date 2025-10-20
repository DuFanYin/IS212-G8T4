const ProjectService = require('../../../src/services/projectService');
const ProjectRepository = require('../../../src/repositories/ProjectRepository');
const UserRepository = require('../../../src/repositories/UserRepository');
const ActivityLogService = require('../../../src/services/activityLogService');
const Project = require('../../../src/domain/Project');
const User = require('../../../src/domain/User');

jest.mock('../../../src/repositories/ProjectRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/services/activityLogService');

describe('ProjectService.assignRoleToCollaborator', () => {
  const mockProjectId = '507f1f77bcf86cd799439011';
  const mockOwnerId = '507f1f77bcf86cd799439012';
  const mockCollaboratorId = '507f1f77bcf86cd799439013';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should assign a role when acting user is the owner', async () => {
    const mockProject = { id: mockProjectId, isOwner: jest.fn().mockReturnValue(true) };
    const mockUser = { _id: mockOwnerId, id: mockOwnerId };
    const mockCollaborator = { _id: mockCollaboratorId, id: mockCollaboratorId };

    ProjectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);
    ProjectService.userRepository.findById = jest.fn()
      .mockResolvedValueOnce(mockUser) // acting user
      .mockResolvedValueOnce(mockCollaborator); // collaborator
    ProjectService.projectRepository.assignRole = jest.fn().mockResolvedValue({ collaborators: [{ user: mockCollaboratorId, role: 'editor' }] });
    ActivityLogService.logActivity.mockResolvedValue(true);

    const result = await ProjectService.assignRoleToCollaborator(
      mockProjectId,
      mockCollaboratorId,
      'editor',
      mockOwnerId
    );

    expect(ProjectService.projectRepository.assignRole).toHaveBeenCalledWith(mockProjectId, mockCollaboratorId, 'editor', mockOwnerId);
    expect(ActivityLogService.logActivity).toHaveBeenCalled();
    expect(result.collaborators[0].role).toBe('editor');
  });

  it('should throw error if non-owner tries to assign role', async () => {
    const mockProject = { id: mockProjectId, isOwner: jest.fn().mockReturnValue(false) };
    const mockUser = { _id: mockOwnerId, id: mockOwnerId };
    
    ProjectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);
    ProjectService.userRepository.findById = jest.fn().mockResolvedValue(mockUser);

    await expect(
      ProjectService.assignRoleToCollaborator(mockProjectId, mockCollaboratorId, 'viewer', mockOwnerId)
    ).rejects.toThrow('Only the project owner can assign or change roles');
  });
});
