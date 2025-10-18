const TeamRepository = require('../../../src/repositories/TeamRepository');
const TeamModel = require('../../../src/db/models/Team');

jest.mock('../../../src/db/models/Team');

describe('TeamRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new TeamRepository();
    jest.clearAllMocks();
  });

  // 3 tests instead of 7 - covering all methods
  it('should handle find operations', async () => {
    const mockTeam = { _id: '507f1f77bcf86cd799439011', name: 'Frontend' };
    const mockTeams = [mockTeam];
    
    TeamModel.findById.mockResolvedValue(mockTeam);
    TeamModel.find.mockResolvedValue(mockTeams);

    expect(await repository.findById('id')).toBe(mockTeam);
    expect(await repository.findAll()).toBe(mockTeams);
    expect(await repository.findByDepartment('deptId')).toBe(mockTeams);
    expect(await repository.findByManager('managerId')).toBe(mockTeams);
    
    expect(TeamModel.findById).toHaveBeenCalledWith('id');
    expect(TeamModel.find).toHaveBeenCalledWith({});
    expect(TeamModel.find).toHaveBeenCalledWith({ departmentId: 'deptId' });
    expect(TeamModel.find).toHaveBeenCalledWith({ managerId: 'managerId' });
  });

  it('should handle create and update operations', async () => {
    const mockTeam = { _id: '507f1f77bcf86cd799439011', name: 'Frontend' };
    const teamData = { name: 'Frontend' };
    const updates = { name: 'Frontend Team' };
    
    TeamModel.create.mockResolvedValue(mockTeam);
    TeamModel.findByIdAndUpdate.mockResolvedValue(mockTeam);

    expect(await repository.create(teamData)).toBe(mockTeam);
    expect(await repository.updateById('id', updates)).toBe(mockTeam);
    
    expect(TeamModel.create).toHaveBeenCalledWith(teamData);
    expect(TeamModel.findByIdAndUpdate).toHaveBeenCalledWith('id', updates, { new: true });
  });

  it('should handle delete operation', async () => {
    const mockTeam = { _id: '507f1f77bcf86cd799439011', name: 'Frontend' };
    TeamModel.findByIdAndDelete.mockResolvedValue(mockTeam);

    expect(await repository.deleteById('id')).toBe(mockTeam);
    expect(TeamModel.findByIdAndDelete).toHaveBeenCalledWith('id');
  });
});