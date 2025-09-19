const SubtaskRepository = require('../repositories/SubtaskRepository');
const Subtask = require('../domain/Subtask');
const UserRepository = require('../repositories/UserRepository');
const TaskRepository = require('../repositories/TaskRepository');
const User = require('../domain/User');

class SubtaskService {
  constructor(subtaskRepository) {
    this.subtaskRepository = subtaskRepository;
  }

  /**
   * Create a new subtask
   * @param {string} parentTaskId - Parent task ID
   * @param {Object} subtaskData - Subtask data
   * @param {string} userId - ID of user creating the subtask
   */
  async createSubtask(parentTaskId, subtaskData, userId) {
    try {
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);
      if (!user) {
        throw new Error('User not found');
      }

      const taskRepository = new TaskRepository();
      const parentTaskDoc = await taskRepository.findById(parentTaskId);
      if (!parentTaskDoc) {
        throw new Error('Parent task not found');
      }

      // Validate subtask collaborators are subset of task collaborators
      const invalidCollaborators = (subtaskData.collaborators || []).filter(
        c => !parentTaskDoc.collaborators.includes(c)
      );
      if (invalidCollaborators.length > 0) {
        throw new Error('Subtask collaborators must be a subset of task collaborators');
      }

      // Set creator as collaborator
      if (!subtaskData.collaborators) subtaskData.collaborators = [];
      if (!subtaskData.collaborators.includes(userId)) {
        subtaskData.collaborators.push(userId);
      }

      const subtaskDoc = await this.subtaskRepository.create({
        ...subtaskData,
        parentTaskId
      });

      return new Subtask(subtaskDoc);
    } catch (error) {
      throw new Error('Error creating subtask');
    }
  }

  /**
   * Update a subtask
   * @param {string} subtaskId - Subtask ID
   * @param {Object} updates - Updates to apply
   * @param {string} userId - ID of user updating the subtask
   */
  async updateSubtask(subtaskId, updates, userId) {
    try {
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);
      const subtask = await this.getSubtaskById(subtaskId);

      // Check if user can edit this subtask
      if (!subtask.canBeEditedBy(user)) {
        throw new Error('User not authorized to edit this subtask');
      }

      const subtaskDoc = await this.subtaskRepository.updateById(subtaskId, updates);
      if (!subtaskDoc) throw new Error('Subtask not found');

      return new Subtask(subtaskDoc);
    } catch (error) {
      throw new Error('Error updating subtask');
    }
  }

  /**
   * Update subtask status
   * @param {string} subtaskId - Subtask ID
   * @param {string} status - New status
   * @param {string} userId - ID of user updating status
   */
  async updateSubtaskStatus(subtaskId, status, userId) {
    try {
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);
      const subtask = await this.getSubtaskById(subtaskId);

      // Check if user can update status
      if (!subtask.canBeCompletedBy(user)) {
        throw new Error('User not authorized to update subtask status');
      }

      const subtaskDoc = await this.subtaskRepository.updateStatus(subtaskId, status, userId);
      if (!subtaskDoc) throw new Error('Subtask not found');

      return new Subtask(subtaskDoc);
    } catch (error) {
      throw new Error('Error updating subtask status');
    }
  }

  /**
   * Get subtask by ID
   * @param {string} subtaskId - Subtask ID
   */
  async getSubtaskById(subtaskId) {
    try {
      const subtaskDoc = await this.subtaskRepository.findById(subtaskId);
      if (!subtaskDoc) throw new Error('Subtask not found');
      
      return new Subtask(subtaskDoc);
    } catch (error) {
      throw new Error('Error fetching subtask');
    }
  }

  /**
   * Get subtasks by parent task
   * @param {string} parentTaskId - Parent task ID
   */
  async getSubtasksByParentTask(parentTaskId) {
    try {
      const subtaskDocs = await this.subtaskRepository.findByParentTask(parentTaskId);
      return subtaskDocs.map(doc => new Subtask(doc));
    } catch (error) {
      throw new Error('Error fetching subtasks');
    }
  }

  /**
   * Soft delete a subtask
   * @param {string} subtaskId - Subtask ID
   * @param {string} userId - ID of user deleting the subtask
   */
  async softDeleteSubtask(subtaskId, userId) {
    try {
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);
      const subtask = await this.getSubtaskById(subtaskId);

      // Check if user can delete this subtask
      if (!subtask.canBeEditedBy(user)) {
        throw new Error('User not authorized to delete this subtask');
      }

      const subtaskDoc = await this.subtaskRepository.softDelete(subtaskId);
      if (!subtaskDoc) throw new Error('Subtask not found');

      return new Subtask(subtaskDoc);
    } catch (error) {
      throw new Error('Error deleting subtask');
    }
  }
}

// Create singleton instance
const subtaskRepository = new SubtaskRepository();
const subtaskService = new SubtaskService(subtaskRepository);

module.exports = subtaskService;
