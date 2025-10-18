const ProjectRepository = require('../../../src/repositories/ProjectRepository');
const ProjectModel = require('../../../src/db/models/Project');
const Project = require('../../../src/domain/Project');

// Mock dependencies
jest.mock('../../../src/db/models/Project');
jest.mock('../../../src/domain/Project');

describe('ProjectRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new ProjectRepository();
    jest.clearAllMocks();
  });

  // Test uncovered lines: 11-15 (findAllProjects, findActiveProjects)
  it('should find all projects', async () => {
    const mockProjects = [{ _id: '507f1f77bcf86cd799439011', name: 'Project 1' }];
    ProjectModel.find.mockResolvedValue(mockProjects);
    const result = await repository.findAllProjects();
    expect(ProjectModel.find).toHaveBeenCalledWith();
    expect(result).toBe(mockProjects);
  });

  it('should find active projects', async () => {
    const mockProjects = [{ _id: '507f1f77bcf86cd799439011', name: 'Active Project', isArchived: false }];
    ProjectModel.find.mockResolvedValue(mockProjects);
    const result = await repository.findActiveProjects();
    expect(ProjectModel.find).toHaveBeenCalledWith({ isArchived: false });
    expect(result).toBe(mockProjects);
  });

  // Test uncovered line: 32 (error case in create method)
  it('should throw error when creating with non-Project instance', async () => {
    const invalidData = { name: 'Test Project' };
    await expect(repository.create(invalidData)).rejects.toThrow('Expected a Project instance');
  });

  // Test uncovered line: 64 (setHasTasks method)
  it('should set has tasks flag', async () => {
    const mockProject = { _id: '507f1f77bcf86cd799439011', hasContainedTasks: true };
    ProjectModel.findByIdAndUpdate.mockResolvedValue(mockProject);
    const result = await repository.setHasTasks('507f1f77bcf86cd799439011', true);
    expect(ProjectModel.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { hasContainedTasks: true }, { new: true });
    expect(result).toBe(mockProject);
  });
});
