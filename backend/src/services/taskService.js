const TaskRepository = require('../repositories/TaskRepository');
const Task = require('../domain/Task');
const UserRepository = require('../repositories/UserRepository');
const ProjectRepository = require('../repositories/ProjectRepository');
const projectService = require('./projectService');
const User = require('../domain/User');

class TaskService {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {string} userId - ID of user creating the task
   */
  async createTask(taskData, userId) {
    try {
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);

      // Validate project collaborators if task belongs to project
      if (taskData.projectId) {
        const projectRepository = new ProjectRepository();
        const project = await projectRepository.findById(taskData.projectId);

        // Validate collaborators are subset of project collaborators
        const invalidCollaborators = (taskData.collaborators || []).filter(
          c => !project.collaborators.includes(c)
        );
        if (invalidCollaborators.length > 0) {
          throw new Error('Task collaborators must be a subset of project collaborators');
        }

        // Add task creator to project collaborators if not already included
        if (!project.collaborators.includes(userId)) {
          const projectRepository = new ProjectRepository();
          await projectRepository.addCollaborator(taskData.projectId, userId);
        }
      }

      // Set creator as collaborator
      if (!taskData.collaborators) taskData.collaborators = [];
      if (!taskData.collaborators.includes(userId)) {
        taskData.collaborators.push(userId);
      }

      const taskDoc = await this.taskRepository.create({
        ...taskData,
        createdBy: userId
      });

      return new Task(taskDoc);
    } catch (error) {
      throw new Error('Error creating task');
    }
  }

  /**
   * Update a task
   * @param {string} taskId - Task ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - ID of user making the update
   */
  async updateTask(taskId, updateData, userId) {
    try {
      const taskDoc = await this.taskRepository.findById(taskId);
      if (!taskDoc) throw new Error('Task not found');

      const task = new Task(taskDoc);
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);

      // Check edit permissions
      if (!task.canBeEditedBy(user)) {
        throw new Error('Not authorized to edit this task');
      }

      // Staff can only update specific fields
      if (user.isStaff()) {
        const isStatusUpdate = Object.keys(updateData).length === 1 && updateData.hasOwnProperty('status');
        if (!isStatusUpdate) {
          const allowedFields = ['title', 'dueDate', 'collaborators'];
          const attemptedFields = Object.keys(updateData);
          const invalidFields = attemptedFields.filter(f => !allowedFields.includes(f));
          if (invalidFields.length > 0) {
            throw new Error(`Staff cannot modify these fields: ${invalidFields.join(', ')}`);
          }
        }
      }

      // Handle assignment changes
      if (updateData.assigneeId) {
        const userRepository = new UserRepository();
        const assigneeDoc = await userRepository.findById(updateData.assigneeId);
        const assignee = new User(assigneeDoc);
        if (!assignee) throw new Error('Assignee not found');

        // Managers/Directors can assign tasks to lower roles only
        if (!user.canAssignTasks()) {
          throw new Error('Only managers and above can assign tasks');
        }

        const roleHierarchy = { 'sm': 4, 'director': 3, 'manager': 2, 'staff': 1 };
        if (roleHierarchy[user.role] <= roleHierarchy[assignee.role]) {
          throw new Error('Can only assign tasks to lower-ranked roles');
        }
      }

      const updatedTaskDoc = await this.taskRepository.updateById(taskId, updateData);
      return new Task(updatedTaskDoc);
    } catch (error) {
      throw new Error('Error updating task');
    }
  }

  /**
   * Check task visibility for a user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   */
  async isVisibleToUser(taskId, userId) {
    try {
      const taskDoc = await this.taskRepository.findById(taskId);
      if (!taskDoc) return false;

      const task = new Task(taskDoc);
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);

      // HR/SM: see all tasks/projects
      if (user.canSeeAllTasks()) return true;

      // Director: see department tasks
      if (user.canSeeDepartmentTasks()) {
        if (task.projectId) {
          const project = await projectService.getProjectById(task.projectId);
          if (project && project.departmentId) {
            return user.canAccessDepartment(project.departmentId);
          }
        }
        if (task.assigneeId) {
          const userRepository = new UserRepository();
          const assigneeDoc = await userRepository.findById(task.assigneeId);
          const assignee = new User(assigneeDoc);
          if (assignee && assignee.departmentId) {
            return user.canAccessDepartment(assignee.departmentId);
          }
        }
      }

      // Manager: see team tasks
      if (user.canSeeTeamTasks()) {
        if (task.assigneeId) {
          const userRepository = new UserRepository();
          const assigneeDoc = await userRepository.findById(task.assigneeId);
          const assignee = new User(assigneeDoc);
          if (assignee && assignee.teamId) {
            return user.teamId?.toString() === assignee.teamId?.toString();
          }
        }
      }

      // Staff: see own tasks, teammates' tasks, project tasks they're in
      if (user.isStaff()) {
        // Own tasks
        if (task.assigneeId?.toString() === user.id) return true;
        
        // Team members' tasks
        if (task.assigneeId) {
          const userRepository = new UserRepository();
          const assigneeDoc = await userRepository.findById(task.assigneeId);
          const assignee = new User(assigneeDoc);
          if (assignee && assignee.teamId) {
            return user.teamId?.toString() === assignee.teamId?.toString();
          }
        }
        
        // Project tasks they're collaborating on
        if (task.isCollaborator(user.id)) return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async getTasksByAssignee(assigneeId) {
    try {
      const taskDocs = await this.taskRepository.findTasksByAssignee(assigneeId);
      return taskDocs.map(doc => new Task(doc));
    } catch (error) {
      throw new Error('Error fetching tasks by assignee');
    }
  }

  async getTasksByCreator(creatorId) {
    try {
      const taskDocs = await this.taskRepository.findTasksByCreator(creatorId);
      return taskDocs.map(doc => new Task(doc));
    } catch (error) {
      throw new Error('Error fetching tasks by creator');
    }
  }

  async getTasksByProject(projectId) {
    try {
      const taskDocs = await this.taskRepository.findTasksByProject(projectId);
      return taskDocs.map(doc => new Task(doc));
    } catch (error) {
      throw new Error('Error fetching tasks by project');
    }
  }

  async getTasksByCollaborator(userId) {
    try {
      const taskDocs = await this.taskRepository.findTasksByCollaborator(userId);
      return taskDocs.map(doc => new Task(doc));
    } catch (error) {
      throw new Error('Error fetching tasks by collaborator');
    }
  }

  async assignTask(taskId, assigneeId, userId) {
    try {
      const taskDoc = await this.taskRepository.findById(taskId);
      if (!taskDoc) throw new Error('Task not found');

      const task = new Task(taskDoc);
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);
      const assigneeDoc = await userRepository.findById(assigneeId);
      const assignee = new User(assigneeDoc);

      if (!task.canBeAssignedBy(user)) {
        throw new Error('Not authorized to assign this task');
      }

      const roleHierarchy = { 'sm': 4, 'director': 3, 'manager': 2, 'staff': 1 };
      if (roleHierarchy[user.role] <= roleHierarchy[assignee.role]) {
        throw new Error('Can only assign tasks to lower-ranked roles');
      }

      const updatedTaskDoc = await this.taskRepository.assignTask(taskId, assigneeId);
      return new Task(updatedTaskDoc);
    } catch (error) {
      throw new Error('Error assigning task');
    }
  }

  async updateTaskStatus(taskId, status, userId) {
    try {
      const taskDoc = await this.taskRepository.findById(taskId);
      if (!taskDoc) throw new Error('Task not found');

      const task = new Task(taskDoc);
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);

      if (!task.canBeCompletedBy(user)) {
        throw new Error('Not authorized to update task status');
      }

      const updatedTaskDoc = await this.taskRepository.updateStatus(taskId, status, userId);
      return new Task(updatedTaskDoc);
    } catch (error) {
      throw new Error('Error updating task status');
    }
  }

  async softDeleteTask(taskId, userId) {
    try {
      const taskDoc = await this.taskRepository.findById(taskId);
      if (!taskDoc) throw new Error('Task not found');

      const task = new Task(taskDoc);
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);

      if (!task.canBeEditedBy(user)) {
        throw new Error('Not authorized to delete this task');
      }

      const updatedTaskDoc = await this.taskRepository.softDelete(taskId);
      return new Task(updatedTaskDoc);
    } catch (error) {
      throw new Error('Error deleting task');
    }
  }
}

// Create singleton instance
const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);

module.exports = taskService;