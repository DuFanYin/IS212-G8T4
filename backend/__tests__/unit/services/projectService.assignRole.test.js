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
    const mockUser = { id: mockOwnerId };

    ProjectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);
    UserRepository.prototype.findById = jest.fn()
      .mockResolvedValueOnce(mockUser) // acting user
      .mockResolvedValueOnce({ id: mockCollaboratorId }); // collaborator
    ProjectRepository.prototype.assignRole = jest.fn().mockResolvedValue({ collaborators: [{ user: mockCollaboratorId, role: 'editor' }] });
    ActivityLogService.logActivity.mockResolvedValue(true);

    const result = await ProjectService.assignRoleToCollaborator(
      mockProjectId,
      mockCollaboratorId,
      'editor',
      mockOwnerId
    );

    expect(ProjectRepository.prototype.assignRole).toHaveBeenCalledWith(mockProjectId, mockCollaboratorId, 'editor', mockOwnerId);
    expect(ActivityLogService.logActivity).toHaveBeenCalled();
    expect(result.collaborators[0].role).toBe('editor');
  });

  it('should throw error if non-owner tries to assign role', async () => {
    const mockProject = { id: mockProjectId, isOwner: jest.fn().mockReturnValue(false) };
    ProjectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);
    UserRepository.prototype.findById = jest.fn().mockResolvedValue({ id: mockOwnerId });

    await expect(
      ProjectService.assignRoleToCollaborator(mockProjectId, mockCollaboratorId, 'viewer', mockOwnerId)
    ).rejects.toThrow('Only the project owner can assign or change roles');
  });
});
