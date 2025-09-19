const TaskModel = require('../db/models/Task');

class TaskRepository {
  async findById(id) {
    return TaskModel.findById(id);
  }

  async findActiveTasks() {
    return TaskModel.find({ isDeleted: false });
  }

  async findTasksByAssignee(assigneeId) {
    return TaskModel.find({ assigneeId, isDeleted: false });
  }

  async findTasksByCreator(creatorId) {
    return TaskModel.find({ createdBy: creatorId, isDeleted: false });
  }

  async findTasksByProject(projectId) {
    return TaskModel.find({ projectId, isDeleted: false });
  }

  async findTasksByCollaborator(userId) {
    return TaskModel.find({ 
      collaborators: userId, 
      isDeleted: false 
    });
  }

  async create(taskData) {
    return TaskModel.create(taskData);
  }

  async updateById(id, updates) {
    return TaskModel.findByIdAndUpdate(id, updates, { new: true });
  }

  async assignTask(id, assigneeId) {
    return TaskModel.findByIdAndUpdate(id, { 
      assigneeId, 
      status: 'ongoing' 
    }, { new: true });
  }

  async updateStatus(id, status, updatedBy) {
    return TaskModel.findByIdAndUpdate(id, { 
      status,
      lastStatusUpdate: {
        status,
        updatedBy,
        updatedAt: new Date()
      }
    }, { new: true });
  }

  async addCollaborator(id, userId) {
    return TaskModel.findByIdAndUpdate(id, { 
      $addToSet: { collaborators: userId } 
    }, { new: true });
  }

  async softDelete(id) {
    return TaskModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }
}

module.exports = TaskRepository;