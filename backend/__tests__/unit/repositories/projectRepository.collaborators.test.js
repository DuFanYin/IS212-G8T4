const ProjectRepository = require('../../../src/repositories/ProjectRepository');
const ProjectModel = require('../../../src/db/models/Project');

jest.mock('../../../src/db/models/Project');

describe('ProjectRepository - Collaborator Operations', () => {
  let projectRepository;

  beforeEach(() => {
    projectRepository = new ProjectRepository();
    jest.clearAllMocks();
  });

  describe('assignRole', () => {
    it('should assign role to collaborator successfully', async () => {
      const mockProject = {
        _id: 'project123',
        collaborators: [],
        save: jest.fn().mockResolvedValue(true)
      };

      ProjectModel.findById = jest.fn().mockResolvedValue(mockProject);

      const result = await projectRepository.assignRole('project123', 'user123', 'editor', 'owner123');

      expect(result).toBe(mockProject);
      expect(mockProject.save).toHaveBeenCalled();
    });

    it('should handle project not found', async () => {
      ProjectModel.findById = jest.fn().mockResolvedValue(null);

      await expect(projectRepository.assignRole('project123', 'user123', 'editor', 'owner123')).rejects.toThrow('Project not found');
    });

    it('should convert legacy collaborators to new format', async () => {
      const mockProject = {
        _id: 'project123',
        collaborators: ['user1', 'user2'], // legacy format
        save: jest.fn().mockResolvedValue(true)
      };

      ProjectModel.findById = jest.fn().mockResolvedValue(mockProject);

      await projectRepository.assignRole('project123', 'user1', 'editor', 'owner123');

      expect(mockProject.collaborators[0]).toHaveProperty('user');
      expect(mockProject.collaborators[0]).toHaveProperty('role');
    });
  });

  describe('setHasTasks', () => {
    it('should update hasTasks flag successfully', async () => {
      const mockProject = { _id: 'project123', hasContainedTasks: false };
      
      ProjectModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockProject);

      const result = await projectRepository.setHasTasks('project123', true);

      expect(ProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'project123',
        { hasContainedTasks: true },
        { new: true }
      );
    });
  });
});

