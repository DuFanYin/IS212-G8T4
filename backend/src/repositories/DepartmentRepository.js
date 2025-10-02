const DepartmentModel = require('../db/models/Department');

class DepartmentRepository {
  async findById(id) {
    return DepartmentModel.findById(id);
  }

  async findAll() {
    return DepartmentModel.find({});
  }

  async findByDirector(directorId) {
    return DepartmentModel.find({ directorId });
  }

  async create(departmentData) {
    return DepartmentModel.create(departmentData);
  }

  async updateById(id, updates) {
    return DepartmentModel.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteById(id) {
    return DepartmentModel.findByIdAndDelete(id);
  }
}

module.exports = DepartmentRepository;
