const TeamModel = require('../db/models/Team');

class TeamRepository {
  async findById(id) {
    return TeamModel.findById(id);
  }

  async findAll() {
    return TeamModel.find({});
  }

  async findByDepartment(departmentId) {
    return TeamModel.find({ departmentId });
  }

  async findByManager(managerId) {
    return TeamModel.find({ managerId });
  }

  async create(teamData) {
    return TeamModel.create(teamData);
  }

  async updateById(id, updates) {
    return TeamModel.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteById(id) {
    return TeamModel.findByIdAndDelete(id);
  }
}

module.exports = TeamRepository;
