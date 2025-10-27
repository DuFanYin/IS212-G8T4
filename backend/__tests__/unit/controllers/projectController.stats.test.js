const ProjectService = require('../../../src/services/projectService');

jest.mock('../../../src/utils/asyncHandler', () => {
  return (fn) => fn;
});

jest.mock('../../../src/utils/responseHelper', () => ({
  sendSuccess: jest.fn((res, data) => {
    return res.json({
      status: 'success',
      data
    });
  })
}));

jest.mock('../../../src/services/projectService');

const projectController = require('../../../src/controllers/projectController');

describe('ProjectController - getProjectStats', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'user123' },
      params: { projectId: 'project123' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  it('should return project stats successfully', async () => {
    const mockStats = {
      total: 10,
      completed: 5,
      inProgress: 3,
      overdue: 1,
      unassigned: 1
    };

    ProjectService.getProjectStats = jest.fn().mockResolvedValue(mockStats);

    await projectController.getProjectStats(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      data: mockStats
    });
  });

  it('should handle errors', async () => {
    ProjectService.getProjectStats = jest.fn().mockRejectedValue(new Error('Not authorized'));

    await projectController.getProjectStats(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalled();
  });
});

