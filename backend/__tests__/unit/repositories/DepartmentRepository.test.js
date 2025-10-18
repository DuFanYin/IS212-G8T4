const DepartmentRepository = require('../../../src/repositories/DepartmentRepository');
const DepartmentModel = require('../../../src/db/models/Department');

jest.mock('../../../src/db/models/Department');

describe('DepartmentRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new DepartmentRepository();
    jest.clearAllMocks();
  });

  // 3 tests instead of 6 - covering all methods
  it('should handle find operations', async () => {
    const mockDept = { _id: '507f1f77bcf86cd799439011', name: 'Engineering' };
    const mockDepts = [mockDept];
    
    DepartmentModel.findById.mockResolvedValue(mockDept);
    DepartmentModel.find.mockResolvedValue(mockDepts);

    expect(await repository.findById('id')).toBe(mockDept);
    expect(await repository.findAll()).toBe(mockDepts);
    expect(await repository.findByDirector('directorId')).toBe(mockDepts);
    
    expect(DepartmentModel.findById).toHaveBeenCalledWith('id');
    expect(DepartmentModel.find).toHaveBeenCalledWith({});
    expect(DepartmentModel.find).toHaveBeenCalledWith({ directorId: 'directorId' });
  });

  it('should handle create and update operations', async () => {
    const mockDept = { _id: '507f1f77bcf86cd799439011', name: 'Engineering' };
    const deptData = { name: 'Engineering' };
    const updates = { name: 'Software Engineering' };
    
    DepartmentModel.create.mockResolvedValue(mockDept);
    DepartmentModel.findByIdAndUpdate.mockResolvedValue(mockDept);

    expect(await repository.create(deptData)).toBe(mockDept);
    expect(await repository.updateById('id', updates)).toBe(mockDept);
    
    expect(DepartmentModel.create).toHaveBeenCalledWith(deptData);
    expect(DepartmentModel.findByIdAndUpdate).toHaveBeenCalledWith('id', updates, { new: true });
  });

  it('should handle delete operation', async () => {
    const mockDept = { _id: '507f1f77bcf86cd799439011', name: 'Engineering' };
    DepartmentModel.findByIdAndDelete.mockResolvedValue(mockDept);

    expect(await repository.deleteById('id')).toBe(mockDept);
    expect(DepartmentModel.findByIdAndDelete).toHaveBeenCalledWith('id');
  });
});
