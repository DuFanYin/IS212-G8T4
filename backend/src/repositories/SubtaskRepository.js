const SubtaskModel = require('../db/models/Subtask');

class SubtaskRepository {
  async findById(id) {
    return SubtaskModel.findById(id);
  }

  async findByParentTask(parentTaskId) {
    return SubtaskModel.find({ parentTaskId, isDeleted: { $ne: true } });
  }

  async create(subtaskData) {
    return SubtaskModel.create(subtaskData);
  }

  async updateById(id, updates) {
    return SubtaskModel.findByIdAndUpdate(id, updates, { new: true });
  }

  async updateStatus(id, status, userId) {
    return SubtaskModel.findByIdAndUpdate(id, { 
      status,
      lastStatusUpdate: {
        status,
        updatedBy: userId,
        updatedAt: new Date()
      }
    }, { new: true });
  }

  async softDelete(id) {
    return SubtaskModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }
}

module.exports = SubtaskRepository;
