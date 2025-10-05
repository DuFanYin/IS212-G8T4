const TaskModel = require('../db/models/Task');
const { User, Project } = require('../db/models');


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
    return TaskModel.find({ projectId, isDeleted: false }).sort({ priority: -1 });
  }

  async findTasksByCollaborator(userId) {
    return TaskModel.find({ 
      collaborators: userId, 
      isDeleted: false 
    });
  }

  async findTasksByTeam(teamId) {
    // Find tasks created by users in the team
    if (!teamId) return [];
    const { User } = require('../db/models');
    const teamUsers = await User.find({ teamId }).select('_id');
    const userIds = (teamUsers || []).map(user => user?._id).filter(Boolean);
    
    return TaskModel.find({ 
      $or: [
        { createdBy: { $in: userIds } },
        { assigneeId: { $in: userIds } },
        { collaborators: { $in: userIds } }
      ],
      isDeleted: false 
    });
  }

  async findTasksByDepartment(departmentId) {
    // Find tasks by: (1) involved users in department OR (2) project department matches
    if (!departmentId) return [];
    
    const [deptUsers, deptProjects] = await Promise.all([
      User.find({ departmentId }).select('_id'),
      Project.find({ departmentId }).select('_id')
    ]);

    const userIds = (deptUsers || []).map(user => user?._id).filter(Boolean);
    const projectIds = (deptProjects || []).map(p => p?._id).filter(Boolean);

    return TaskModel.find({
      $or: [
        { createdBy: { $in: userIds } },
        { assigneeId: { $in: userIds } },
        { collaborators: { $in: userIds } },
        { projectId: { $in: projectIds } }
      ],
      isDeleted: false
    });
  }

    async findUnassignedTasks() {
    // find tasks that are unassigned -> with no project id
    return TaskModel.find({
      $or: [
        { projectId: { $exists: false } },
        { projectId: null }
      ],
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