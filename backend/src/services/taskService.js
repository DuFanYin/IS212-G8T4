const { Task, User, Project, Subtask, ActivityLog } = require('../db/models');

class TaskService {
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {string} userId - ID of user creating the task
   */
  static async createTask(taskData, userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Validate project collaborators if task belongs to project
    if (taskData.projectId) {
      const project = await Project.findById(taskData.projectId);
      if (!project) throw new Error('Project not found');

      // Validate collaborators are subset of project collaborators
      const invalidCollaborators = (taskData.collaborators || []).filter(
        c => !project.collaborators.includes(c)
      );
      if (invalidCollaborators.length > 0) {
        throw new Error('Task collaborators must be a subset of project collaborators');
      }

      // Add task creator to project collaborators if not already included
      if (!project.collaborators.includes(userId)) {
        project.collaborators.push(userId);
        await project.save();
      }
    }

    // Set creator as collaborator
    if (!taskData.collaborators) taskData.collaborators = [];
    if (!taskData.collaborators.includes(userId)) {
      taskData.collaborators.push(userId);
    }

    const task = await Task.create({
      ...taskData,
      createdBy: userId
    });

    // Log task creation
    await ActivityLog.create({
      taskId: task._id,
      userId,
      action: 'created',
      details: {
        title: task.title,
        description: task.description
      }
    });

    return task;
  }

  /**
   * Update a task
   * @param {string} taskId - Task ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - ID of user making the update
   */
  static async updateTask(taskId, updateData, userId) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Check edit permissions
    if (!task.collaborators.includes(userId)) {
      throw new Error('Must be a collaborator to edit task');
    }

    // Staff can only edit tasks they created, except for status updates
    if (user.role === 'staff') {
      const isStatusUpdate = Object.keys(updateData).length === 1 && updateData.hasOwnProperty('status');
      if (!isStatusUpdate) {
        if (!task.createdBy.equals(userId)) {
          throw new Error('Staff can only edit tasks they created');
        }
        // Staff can only update specific fields
        const allowedFields = ['title', 'dueDate', 'collaborators'];
        const attemptedFields = Object.keys(updateData);
        const invalidFields = attemptedFields.filter(f => !allowedFields.includes(f));
        if (invalidFields.length > 0) {
          throw new Error(`Staff cannot modify these fields: ${invalidFields.join(', ')}`);
        }
      }
    }

    // Handle status changes
    if (updateData.status) {
      if (!await this.canUpdateStatus(task, userId)) {
        throw new Error('Not authorized to update task status');
      }

      if (updateData.status === 'completed') {
        const subtasks = await Subtask.find({ parentTaskId: taskId });
        if (subtasks.length > 0 && !subtasks.every(st => st.status === 'completed')) {
          throw new Error('All subtasks must be completed before marking task as completed');
        }
      }

      task.lastStatusUpdate = {
        status: updateData.status,
        updatedBy: userId,
        updatedAt: new Date()
      };
    }

    // Handle assignment changes
    if (updateData.assigneeId) {
      const assignee = await User.findById(updateData.assigneeId);
      if (!assignee) throw new Error('Assignee not found');

      const roleHierarchy = { 'sm': 4, 'director': 3, 'manager': 2, 'staff': 1 };
      if (roleHierarchy[user.role] <= roleHierarchy[assignee.role]) {
        throw new Error('Can only assign tasks to lower-ranked roles');
      }
    }

    Object.assign(task, updateData);
    await task.save();

    // Log the update
    await ActivityLog.create({
      taskId: task._id,
      userId,
      action: updateData.status ? 'status_changed' : 'updated',
      details: updateData
    });

    return task;
  }

  /**
   * Check if user can update task status
   * @param {Object} task - Task object
   * @param {string} userId - User ID
   */
  static async canUpdateStatus(task, userId) {
    const user = await User.findById(userId);
    if (!user) return false;

    // Must be a collaborator
    if (!task.collaborators.includes(userId)) return false;

    // Staff can only update their own tasks
    if (user.role === 'staff' && !task.assigneeId.equals(userId)) return false;

    return true;
  }

  /**
   * Check task visibility for a user
   * @param {Object} task - Task object
   * @param {string} userId - User ID
   */
  static async isVisibleToUser(task, userId) {
    const user = await User.findById(userId);
    if (!user) return false;

    // HR and SM can see all tasks
    if (['hr', 'sm'].includes(user.role)) return true;

    // Director can see all department tasks
    if (user.role === 'director') {
      if (task.projectId) {
        const project = await Project.findById(task.projectId);
        if (project && project.departmentId.equals(user.departmentId)) return true;
      }
      const assignee = await User.findById(task.assigneeId);
      if (assignee && assignee.departmentId.equals(user.departmentId)) return true;
    }

    // Manager can see team tasks
    if (user.role === 'manager') {
      const assignee = await User.findById(task.assigneeId);
      if (assignee && assignee.teamId.equals(user.teamId)) return true;
    }

    // Staff visibility
    if (user.role === 'staff') {
      // Own tasks
      if (task.assigneeId.equals(userId)) return true;
      // Team members' tasks
      const assignee = await User.findById(task.assigneeId);
      if (assignee && assignee.teamId.equals(user.teamId)) return true;
      // Project tasks they're collaborating on
      if (task.collaborators.includes(userId)) return true;
    }

    return false;
  }

  /**
   * Archive a task (soft delete)
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID performing the action
   */
  static async archiveTask(taskId, userId) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    task.isDeleted = true;
    await task.save();

    await ActivityLog.create({
      taskId: task._id,
      userId,
      action: 'archived',
      details: { archivedAt: new Date() }
    });

    return task;
  }
}

module.exports = TaskService;
