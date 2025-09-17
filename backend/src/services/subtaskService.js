const { Subtask, Task, ActivityLog } = require('../db/models');

class SubtaskService {
  /**
   * Create a new subtask
   * @param {string} parentTaskId - Parent task ID
   * @param {Object} subtaskData - Subtask data
   * @param {string} userId - ID of user creating the subtask
   */
  static async createSubtask(parentTaskId, subtaskData, userId) {
    const parentTask = await Task.findById(parentTaskId);
    if (!parentTask) throw new Error('Parent task not found');

    // Validate collaborators are subset of parent task
    const invalidCollaborators = (subtaskData.collaborators || []).filter(
      c => !parentTask.collaborators.includes(c)
    );
    if (invalidCollaborators.length > 0) {
      throw new Error('Subtask collaborators must be a subset of parent task collaborators');
    }

    const subtask = await Subtask.create({
      ...subtaskData,
      parentTaskId
    });

    // Log subtask creation
    await ActivityLog.create({
      taskId: parentTaskId,
      userId,
      action: 'subtask_added',
      details: {
        subtaskId: subtask._id,
        title: subtask.title
      }
    });

    return subtask;
  }

  /**
   * Update a subtask
   * @param {string} subtaskId - Subtask ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - ID of user making the update
   */
  static async updateSubtask(subtaskId, updateData, userId) {
    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) throw new Error('Subtask not found');

    const parentTask = await Task.findById(subtask.parentTaskId);
    if (!parentTask) throw new Error('Parent task not found');

    // Validate collaborators if being updated
    if (updateData.collaborators) {
      const invalidCollaborators = updateData.collaborators.filter(
        c => !parentTask.collaborators.includes(c)
      );
      if (invalidCollaborators.length > 0) {
        throw new Error('Subtask collaborators must be a subset of parent task collaborators');
      }
    }

    // Handle status changes
    if (updateData.status) {
      if (!parentTask.collaborators.includes(userId)) {
        throw new Error('Must be a task collaborator to update subtask status');
      }

      // Log status change
      await ActivityLog.create({
        taskId: parentTask._id,
        userId,
        action: 'subtask_status_changed',
        details: {
          subtaskId: subtask._id,
          oldStatus: subtask.status,
          newStatus: updateData.status
        }
      });
    }

    Object.assign(subtask, updateData);
    return subtask.save();
  }

  /**
   * Check if all subtasks of a task are completed
   * @param {string} taskId - Task ID
   */
  static async areAllSubtasksCompleted(taskId) {
    const subtasks = await Subtask.find({ parentTaskId: taskId });
    return subtasks.length > 0 && subtasks.every(subtask => subtask.status === 'completed');
  }

  /**
   * Get all subtasks for a task
   * @param {string} taskId - Task ID
   */
  static async getTaskSubtasks(taskId) {
    return Subtask.find({ parentTaskId: taskId }).sort('dueDate');
  }
}

module.exports = SubtaskService;
