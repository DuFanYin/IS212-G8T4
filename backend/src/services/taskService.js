const TaskRepository = require('../repositories/TaskRepository');
const Task = require('../domain/Task');
const UserRepository = require('../repositories/UserRepository');
const ProjectRepository = require('../repositories/ProjectRepository');
const projectService = require('./projectService');
const activityLogService  = require('./activityLogService');
const User = require('../domain/User');
const TaskModel = require('../db/models/Task');
const SubtaskRepository = require('../repositories/SubtaskRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');

class TaskService {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  // Map a populated task document (with names) to the enriched DTO shape
  mapPopulatedTaskDocToDTO(taskDoc) {
    return {
      id: taskDoc._id?.toString?.() || taskDoc.id,
      title: taskDoc.title,
      description: taskDoc.description,
      dueDate: taskDoc.dueDate,
      status: taskDoc.status,
      priority: taskDoc.priority,
      createdBy: taskDoc.createdBy?._id || taskDoc.createdBy,
      createdByName: taskDoc.createdBy?.name,
      assigneeId: taskDoc.assigneeId?._id || taskDoc.assigneeId,
      assigneeName: taskDoc.assigneeId?.name,
      projectId: taskDoc.projectId?._id || taskDoc.projectId,
      projectName: taskDoc.projectId?.name,
      attachments: taskDoc.attachments || [],
      collaborators: Array.isArray(taskDoc.collaborators) ? taskDoc.collaborators.map(c => c._id || c) : [],
      collaboratorNames: Array.isArray(taskDoc.collaborators) ? taskDoc.collaborators.map(c => c.name).filter(Boolean) : [],
      lastStatusUpdate: taskDoc.lastStatusUpdate,
      isDeleted: taskDoc.isDeleted,
      createdAt: taskDoc.createdAt,
      updatedAt: taskDoc.updatedAt,
      recurringInterval: taskDoc.recurringInterval
    };
  }

  // Build enriched DTO with human-readable names when available
  async buildEnrichedTaskDTO(task, activityLog = null) {
    try {
      const dto = task.toDTO();

      // Resolve project name
      let projectName = undefined;
      if (dto.projectId) {
        try {
          const project = await projectService.getProjectById(dto.projectId);
          projectName = project?.name;
        } catch { }
      }

      // Resolve assignee name
      let assigneeName = undefined;
      if (dto.assigneeId) {
        try {
          const userRepository = new UserRepository();
          const assigneeDoc = await userRepository.findById(dto.assigneeId);
          assigneeName = assigneeDoc?.name;
        } catch { }
      }

      // Resolve creator name
      let createdByName = undefined;
      if (dto.createdBy) {
        try {
          const userRepository = new UserRepository();
          const creatorDoc = await userRepository.findById(dto.createdBy);
          createdByName = creatorDoc?.name;
        } catch { }
      }

      // Resolve collaborator names
      let collaboratorNames = undefined;
      if (Array.isArray(dto.collaborators) && dto.collaborators.length > 0) {
        try {
          const userRepository = new UserRepository();
          const names = [];
          for (const id of dto.collaborators) {
            try {
              const doc = await userRepository.findById(id);
              if (doc?.name) names.push(doc.name);
            } catch { }
          }
          collaboratorNames = names;
        } catch { }
      }

      // Resolve Activity Log ID
      let activityLogId = activityLog.id || null;

      return { ...dto, projectName, assigneeName, createdByName, collaboratorNames, activityLogId };
    } catch {
      // Fallback to plain DTO
      return task.toDTO();
    }
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
      if (!userDoc) {
        throw new Error('User not found');
      }
      const user = new User(userDoc);

      // Validate project collaborators if task belongs to project
      if (taskData.projectId) {
        const projectRepository = new ProjectRepository();
        const project = await projectRepository.findById(taskData.projectId);

        this.validatePriority(taskData.priority);

        // Validate collaborators are subset of project collaborators
        const invalidCollaborators = (taskData.collaborators || []).filter(
          c => !project.collaborators.includes(c)
        );
        if (invalidCollaborators.length > 0) {
          throw new Error('Task collaborators must be a subset of project collaborators');
        }

        // Add task creator to project collaborators if not already included
        if (!project.collaborators.includes(userId)) {
          await projectRepository.addCollaborators(taskData.projectId, [userId]);
        }
      }

      //Check if recurring task has interval set
      if(taskData.recurringInterval && taskData.recurringInterval <= 0){
        throw new Error('Recurring tasks must have a valid recurring interval in days');  
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
      
      //Activity Logging
      const activityLogDoc = await activityLogService.logActivity("created", taskDoc.id, null, taskDoc, userId);

      const task = new Task(taskDoc);
      return await this.buildEnrichedTaskDTO(task, activityLogDoc);
    } catch (error) {
      console.error('TaskService.createTask error:', error.message);
      throw new Error(`Error creating task: ${error.message}`);
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

        const isCollaborator = task.collaborators
          ?.map(c => c.toString())
          .includes(user.id?.toString());

        if (isCollaborator) {
          const allowedFields = ['title', 'dueDate', 'collaborators', 'attachments'];
          const attemptedFields = Object.keys(updateData);
          const invalidFields = attemptedFields.filter(f => !allowedFields.includes(f));
          if (invalidFields.length > 0 && !isStatusUpdate) {
            throw new Error(
              `Collaborator staff cannot modify these fields: ${invalidFields.join(', ')}`
            );
          }
        } else {
          const allowedFields = ['title', 'dueDate', 'collaborators'];
          const attemptedFields = Object.keys(updateData);
          const invalidFields = attemptedFields.filter(f => !allowedFields.includes(f));
          if (invalidFields.length > 0) {
            throw new Error(`Staff cannot modify these fields: ${invalidFields.join(', ')}`);
          }
        }
      }

      // Validate due date is not in the past
      if (updateData.dueDate) {
        const dueDate = new Date(updateData.dueDate);
        const now = new Date();
        if (dueDate < now) {
          throw new Error('Due date cannot be in the past');
        }
      }

      //Check if recurring task has interval set
      if(updateData.recurringInterval && updateData.recurringInterval <= 0){
        throw new Error('Recurring tasks must have a valid recurring interval in days');
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

      // If collaborators are being updated on a task that belongs to a project,
      // ensure all collaborators are part of the project's collaborators list
      if (Array.isArray(updateData.collaborators) && updateData.collaborators.length > 0 && task.projectId) {
        const projectRepository = new ProjectRepository();
        const project = await projectRepository.findById(task.projectId);
        if (!project) {
          throw new Error('Parent project not found');
        }
        const projectCollaboratorIds = (project.collaborators || []).map((id) => id?.toString?.() || id);
        const invalid = updateData.collaborators
          .map((c) => c?.toString?.() || c)
          .filter((c) => !projectCollaboratorIds.includes(c));
        if (invalid.length > 0) {
          throw new Error('Task collaborators must be a subset of project collaborators');
        }
      }

      if (updateData.projectId) {
        this.validatePriority(updateData.priority);

        const projectRepository = new ProjectRepository();
        const project = await projectRepository.findById(task.projectId);
        if (!project) throw new Error('Project not found');

        //No need to validate membership / department because addCollaborator function already does
        for (const collaboratorId of task.collaborators) {
          await projectService.addCollaborator(updateData.projectId, collaboratorId, userId);
        }
      }

      // Track old values for change logging
      const previousTaskDoc = task;

      const updatedTaskDoc = await this.taskRepository.updateById(taskId, updateData);
      const updatedTask = new Task(updatedTaskDoc);

      //Logging
      const activityLogDoc =  await activityLogService.logActivity("updated", taskId, previousTaskDoc, updatedTaskDoc, userId);

      return await this.buildEnrichedTaskDTO(updatedTask, activityLogDoc);
    } catch (error) {
      throw new Error(`Error updating task: ${error.message || 'unknown error'}`);
    }
  }

  //Check if priority is given and between 1-10
  validatePriority(priority) {
    if (priority === undefined || priority === null) {
      throw new Error('Task priority must be provided');
    }
    if (priority < 1 || priority > 10 || typeof priority !== 'number') {
      throw new Error('Task priority must be a number between 1 and 10 (inclusive)');
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
      if (!userDoc) return false;
      const user = new User(userDoc);

      // HR/SM: see all tasks/projects
      if (user.canSeeAllTasks()) return true;

      // Director: see department tasks (project dept OR any involved user dept)
      if (user.canSeeDepartmentTasks()) {
        // Project department
        if (task.projectId) {
          const project = await projectService.getProjectById(task.projectId);
          if (project && project.departmentId && user.canAccessDepartment(project.departmentId)) {
            return true;
          }
        }
        // Assignee department
        if (task.assigneeId) {
          const assigneeDoc = await userRepository.findById(task.assigneeId);
          const assignee = assigneeDoc ? new User(assigneeDoc) : null;
          if (assignee?.departmentId && user.canAccessDepartment(assignee.departmentId)) {
            return true;
          }
        }
        // Creator department
        if (task.createdBy) {
          const creatorDoc = await userRepository.findById(task.createdBy);
          const creator = creatorDoc ? new User(creatorDoc) : null;
          if (creator?.departmentId && user.canAccessDepartment(creator.departmentId)) {
            return true;
          }
        }
        // Any collaborator department
        if (Array.isArray(task.collaborators) && task.collaborators.length > 0) {
          for (const collabId of task.collaborators) {
            const collabDoc = await userRepository.findById(collabId);
            const collab = collabDoc ? new User(collabDoc) : null;
            if (collab?.departmentId && user.canAccessDepartment(collab.departmentId)) {
              return true;
            }
          }
        }
      }

      // Manager: see team tasks (any involved user team)
      if (user.canSeeTeamTasks()) {
        // Assignee team
        if (task.assigneeId) {
          const assigneeDoc = await userRepository.findById(task.assigneeId);
          const assignee = assigneeDoc ? new User(assigneeDoc) : null;
          if (assignee?.teamId && user.teamId?.toString() === assignee.teamId?.toString()) {
            return true;
          }
        }
        // Creator team
        if (task.createdBy) {
          const creatorDoc = await userRepository.findById(task.createdBy);
          const creator = creatorDoc ? new User(creatorDoc) : null;
          if (creator?.teamId && user.teamId?.toString() === creator.teamId?.toString()) {
            return true;
          }
        }
        // Any collaborator team
        if (Array.isArray(task.collaborators) && task.collaborators.length > 0) {
          for (const collabId of task.collaborators) {
            const collabDoc = await userRepository.findById(collabId);
            const collab = collabDoc ? new User(collabDoc) : null;
            if (collab?.teamId && user.teamId?.toString() === collab.teamId?.toString()) {
              return true;
            }
          }
        }
      }

      // Staff: see own tasks, teammates' tasks (createdBy/assignee/collab), and tasks they're collaborating on
      if (user.isStaff()) {
        // Own tasks
        if (task.assigneeId && task.assigneeId.toString?.() === user.id?.toString?.()) return true;
        if (task.createdBy && task.createdBy.toString?.() === user.id?.toString?.()) return true;

        // Team members' tasks via assignee
        if (task.assigneeId) {
          const assigneeDoc = await userRepository.findById(task.assigneeId);
          const assignee = assigneeDoc ? new User(assigneeDoc) : null;
          if (assignee?.teamId && user.teamId?.toString() === assignee.teamId?.toString()) {
            return true;
          }
        }
        // Team members' tasks via creator
        if (task.createdBy) {
          const creatorDoc = await userRepository.findById(task.createdBy);
          const creator = creatorDoc ? new User(creatorDoc) : null;
          if (creator?.teamId && user.teamId?.toString() === creator.teamId?.toString()) {
            return true;
          }
        }
        // Team members' tasks via collaborators
        if (Array.isArray(task.collaborators) && task.collaborators.length > 0) {
          for (const collabId of task.collaborators) {
            const collabDoc = await userRepository.findById(collabId);
            const collab = collabDoc ? new User(collabDoc) : null;
            if (collab?.teamId && user.teamId?.toString() === collab.teamId?.toString()) {
              return true;
            }
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

  async getTasksByProject(projectId, userId) {
    try {
      const docs = await this.taskRepository.findTasksByProject(projectId);
      const populated = await TaskModel.populate(docs, [
        { path: 'assigneeId', select: 'name' },
        { path: 'createdBy', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'projectId', select: 'name' },
      ]);
      const visible = [];
      for (const doc of populated) {
        if (await this.isVisibleToUser(doc._id, userId)) {
          visible.push(doc);
        }
      }
      return visible.map((d) => this.mapPopulatedTaskDocToDTO(d));
    } catch (error) {
      throw new Error('Error fetching tasks by project');
    }
  }

  async getTasksByTeam(teamId, requesterId) {
    try {
      const userRepository = new UserRepository();
      const requesterDoc = await userRepository.findById(requesterId);
      const requester = new User(requesterDoc);
      // Allow: managers (their own team), directors (dept visibility), HR/SM (all)
      const canByTeam = requester.canSeeTeamTasks();
      const canByDept = requester.canSeeDepartmentTasks();
      const canAll = requester.canSeeAllTasks();
      if (!(canByTeam || canByDept || canAll)) {
        throw new Error('Not authorized to view team tasks');
      }
      // If pure manager (not director/SM/HR), restrict to own team
      if (requester.role === 'manager') {
        if (!requester.teamId || requester.teamId.toString() !== String(teamId)) {
          throw new Error('Managers can only view their own team tasks');
        }
      }
      const docs = await this.taskRepository.findTasksByTeam(teamId);
      const populated = await TaskModel.populate(docs, [
        { path: 'assigneeId', select: 'name' },
        { path: 'createdBy', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'projectId', select: 'name' },
      ]);
      return populated.map((d) => this.mapPopulatedTaskDocToDTO(d));
    } catch (error) {
      throw new Error('Error fetching tasks by team');
    }
  }

  async getTasksByDepartment(departmentId, requesterId) {
    try {
      const userRepository = new UserRepository();
      const requesterDoc = await userRepository.findById(requesterId);
      const requester = new User(requesterDoc);
      if (!(requester.canSeeDepartmentTasks() || requester.canSeeAllTasks())) {
        throw new Error('Not authorized to view department tasks');
      }
      const docs = await this.taskRepository.findTasksByDepartment(departmentId);
      const populated = await TaskModel.populate(docs, [
        { path: 'assigneeId', select: 'name' },
        { path: 'createdBy', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'projectId', select: 'name' },
      ]);
      return populated.map((d) => this.mapPopulatedTaskDocToDTO(d));
    } catch (error) {
      throw new Error('Error fetching tasks by department');
    }
  }

  async getUnassignedTasks(userId) {
    try {
      // Retrieve the current user and verify access permissions
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);
      if (!user) throw new Error('User not found');

      // Fetch all unassigned tasks (tasks without a project)
      const docs = await this.taskRepository.findUnassignedTasks();

      // Populate related fields
      const populated = await TaskModel.populate(docs, [
        { path: 'assigneeId', select: 'name' },
        { path: 'createdBy', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'projectId', select: 'name' },
      ]);

      // Filter tasks based on user’s visibility permissions
      const visible = [];
      for (const doc of populated) {
        if (await this.isVisibleToUser(doc._id, userId)) {
          visible.push(doc);
        }
      }

      // Map results to standardized DTO format
      return visible.map((d) => this.mapPopulatedTaskDocToDTO(d));
    } catch (error) {
      console.error('TaskService.getUnassignedTasks error:', error.message);
      throw new Error(`Error fetching unassigned tasks: ${error.message}`);
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

  async getUserTasks(userId) {
    try {
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      if (!userDoc) {
        throw new Error('User not found');
      }
      const user = new User(userDoc);

      let taskDocs = [];

      if (user.isStaff()) {
        // Staff: own tasks + team tasks + project tasks they're in
        const ownTasks = await this.taskRepository.findTasksByAssignee(userId);
        const teamTasks = await this.taskRepository.findTasksByTeam(user.teamId);
        const projectTasks = await this.taskRepository.findTasksByCollaborator(userId);

        taskDocs = [...ownTasks, ...teamTasks, ...projectTasks];
      } else if (user.isManager()) {
        // Manager: team tasks
        taskDocs = await this.taskRepository.findTasksByTeam(user.teamId);
      } else if (user.isDirector()) {
        // Director: department tasks
        taskDocs = await this.taskRepository.findTasksByDepartment(user.departmentId);
      } else if (user.isHR() || user.isSeniorManagement()) {
        // HR/SM: all tasks
        taskDocs = await this.taskRepository.findActiveTasks();
      }

      // Normalize, remove nulls, and de-duplicate by id
      const safeDocs = (taskDocs || []).filter(Boolean);
      const unique = safeDocs.filter((task, index, self) => {
        const id = task?._id?.toString?.();
        if (!id) return false;
        return index === self.findIndex(t => t?._id?.toString?.() === id);
      });
      const populated = await TaskModel.populate(unique, [
        { path: 'assigneeId', select: 'name' },
        { path: 'createdBy', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'projectId', select: 'name' },
      ]);
      return populated.map((d) => this.mapPopulatedTaskDocToDTO(d));
    } catch (error) {
      console.error('TaskService.getUserTasks error:', error.message);
      throw new Error(`Error fetching user tasks: ${error.message}`);
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

      //Store for logging
      const previousAssignee = (await this.getById(taskId)).assigneeId;

      const updatedTaskDoc = await this.taskRepository.assignTask(taskId, assigneeId);
      const updatedTask = new Task(updatedTaskDoc);

      //Logging
      const activityLogDoc = await activityLogService.logActivity("assigned", taskId, previousAssignee, assigneeId, userId);

      return await this.buildEnrichedTaskDTO(updatedTask, activityLogDoc);
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

      // Business rule: A task can only be marked completed when all its subtasks are completed
      if (status === 'completed') {
        const subtaskRepository = new SubtaskRepository();
        const subtasks = await subtaskRepository.findByParentTask(taskId);
        const hasIncomplete = (subtasks || []).some((st) => st && st.status !== 'completed' && st.isDeleted !== true);
        if (hasIncomplete) {
          throw new Error('All subtasks must be completed before completing this task');
        }
        
        // If recurring, create next occurrence
        if(task.recurringInterval && task.recurringInterval > 0){
          const nextDueDate = new Date(new Date(task.dueDate).getTime() + task.recurringInterval * 24 * 60 * 60 * 1000);
          this.createTask({
              title: task.title,
              description: task.description,
              dueDate: nextDueDate,
              status: 'unassigned',
              priority: task.priority,
              createdBy: task.createdBy,
              assigneeId: null,
              projectId: task.projectId,
              collaborators: task.collaborators,
              recurringInterval: task.recurringInterval,
            }, userId);
        }
      }

      //Store for logging
      const previousStatus = (await this.getById(taskId)).status;

      const updatedTaskDoc = await this.taskRepository.updateStatus(taskId, status, userId);
      const updatedTask = new Task(updatedTaskDoc);

      //Logging
      const activityLogDoc = await activityLogService.logActivity("status_changed", taskId, previousStatus, status, userId);

      return await this.buildEnrichedTaskDTO(updatedTask, activityLogDoc);
    } catch (error) {
      throw new Error('Error updating task status');
    }
  }

  // (Due date updates are handled within updateTask now)

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
      
      //Store for logging
      const previousTaskDoc = await this.getById(taskId);

      const updatedTaskDoc = await this.taskRepository.softDelete(taskId);
      const updatedTask = new Task(updatedTaskDoc);

      //Logging
      const activityLogDoc =  await activityLogService.logActivity("status_changed", taskId, previousTaskDoc, null, userId);
      
      return await this.buildEnrichedTaskDTO(updatedTask, activityLogDoc);
    } catch (error) {
      throw new Error('Error deleting task');
    }
  }

  async removeAttachment(taskId, attachmentId, userId) {
    try {
      // 1. Fetch task
      const taskDoc = await this.taskRepository.findById(taskId);
      if (!taskDoc) throw new Error('Task not found');

      const task = new Task(taskDoc);

      // 2. Fetch user
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
      const user = new User(userDoc);

      // 3. Check permissions
      if (!task.canRemoveAttachment(user)) {
        throw new Error('Not authorized to remove this attachment');
      }

      // 4. Find and remove attachment
      const attachment = taskDoc.attachments.id(attachmentId);
      if (!attachment) throw new Error('Attachment not found');

      attachment.deleteOne();

      // 5. Save updated task
      await taskDoc.save();

      // 6. Return removed attachment for controller to handle file deletion
      return attachment.toObject ? attachment.toObject() : attachment;
    } catch (error) {
      throw new Error(error.message || 'Error removing attachment');
    }
  }

  async getById(taskId) {
    try {
      let taskDoc = await this.taskRepository.findById(taskId);
      if (!taskDoc) throw new Error('Task not found');
      const populated = await TaskModel.populate(taskDoc, [
        { path: 'assigneeId', select: 'name' },
        { path: 'createdBy', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'projectId', select: 'name' },
      ]);
      return this.mapPopulatedTaskDocToDTO(populated);
    } catch (error) {
      throw new Error('Error fetching task');
    }
  }

  async setTaskProjects(taskId, projectIds, userId) {
    try {
      const taskDoc = await this.taskRepository.findById(taskId);
      if (!taskDoc) {
        throw new Error('Task not found');
      }

      const task = new Task(taskDoc);
      
      // Check if user can edit this task
      if (!task.canBeEditedBy({ id: userId })) {
        throw new Error('Not authorized to edit this task');
      }

      const updatedTaskDoc = await this.taskRepository.setProjects(taskId, projectIds);
      const populated = await TaskModel.populate(updatedTaskDoc, [
        { path: 'assigneeId', select: 'name' },
        { path: 'createdBy', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'projectId', select: 'name' },
        { path: 'projects', select: 'name' }
      ]);
      
      return this.mapPopulatedTaskDocToDTO(populated);
    } catch (error) {
      throw new Error(`Error setting task projects: ${error.message}`);
    }
  }
}

// Create singleton instance
const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);

module.exports = taskService;