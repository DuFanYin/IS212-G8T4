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
const notificationService = require('./notificationService');
const { ROLE_HIERARCHY } = require('../middleware/roleMiddleware');


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
      const oldDueDate = task.dueDate;
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

        if (ROLE_HIERARCHY[user.role] <= ROLE_HIERARCHY[assignee.role]) {
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
      
      // console.log("========== Due Date Change Check ==========");
      // console.log("Old Due Date:", oldDueDate);
      // console.log("New Due Date:", updateData.dueDate);

      // if (oldDueDate && updateData.dueDate) {
      //   console.log("Old ISO:", new Date(oldDueDate).toISOString());
      //   console.log("New ISO:", new Date(updateData.dueDate).toISOString());
      // }
      // console.log("============================================");


      // Notify collaborators if dueDate changed
      if (
        updateData.dueDate &&
        oldDueDate &&
        new Date(updateData.dueDate).toISOString() !== new Date(oldDueDate).toISOString()
      ) {
        // Get all relevant users
      const collaborators = updatedTask.collaborators?.map(c => c.toString()) || [];
      const assigneeId = updatedTask.assigneeId?.toString();
      const userMakingChange = userId.toString();

      // Create a unique set of all involved users (assignee + collaborators)
      const allInvolved = new Set(collaborators);
      if (assigneeId) {
        allInvolved.add(assigneeId);
      }

      // Remove the user who made the change (so they don't get a notification)
      allInvolved.delete(userMakingChange);

      // Convert the set back to an array
      const userIdsToNotify = [...allInvolved];

      if (userIdsToNotify.length > 0) {
        console.log("🔔 Triggering deadline change notifications...");
        console.log("User IDs to Notify:", userIdsToNotify);

        // Send notification to each person
        for (const idToNotify of userIdsToNotify) {
          await notificationService.createNotification({
            userId: idToNotify,
            message: `Task "${updatedTask.title}" deadline changed to ${new Date(updateData.dueDate).toDateString()}`,
            link: `/projects-tasks/task/${updatedTask.id}`, // <-- Fixed link
            type: 'deadline-change',
          });
        }
      }
      }

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
   * OPTIMIZED: Batch loads all involved users in 1 query instead of N queries
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   */
  async isVisibleToUser(taskId, userId) {
    try {
      const taskDoc = await this.taskRepository.findById(taskId);
      if (!taskDoc) return false;

      const task = new Task(taskDoc);
      const userRepository = new UserRepository();
      
      // Load requester
      const userDoc = await userRepository.findById(userId);
      if (!userDoc) return false;
      const user = new User(userDoc);

      // HR/SM: see all tasks - early return, no queries needed
      if (user.canSeeAllTasks()) return true;

      // Collect all involved user IDs
      const involvedUserIds = [
        task.assigneeId,
        task.createdBy,
        ...(Array.isArray(task.collaborators) ? task.collaborators : [])
      ].filter(Boolean);

      // Batch load ALL involved users in ONE query (instead of N queries)
      const involvedUserDocs = involvedUserIds.length > 0 
        ? await userRepository.findByIds(involvedUserIds)
        : [];
      
      const involvedUsers = new Map(involvedUserDocs.map(doc => [doc._id?.toString(), doc]));

      // Director: see department tasks
      if (user.canSeeDepartmentTasks()) {
        // Check project department
        if (task.projectId) {
          const project = await projectService.getProjectById(task.projectId);
          if (project?.departmentId && user.canAccessDepartment(project.departmentId)) return true;
        }
        // Check if any involved user is in requester's department
        for (const [id, doc] of involvedUsers) {
          if (doc.departmentId && user.canAccessDepartment(doc.departmentId)) return true;
        }
      }

      // Manager: see team tasks
      if (user.canSeeTeamTasks()) {
        // Check if any involved user is in requester's team
        for (const [id, doc] of involvedUsers) {
          if (doc.teamId?.toString() === user.teamId?.toString()) return true;
        }
      }

      // Staff: see own tasks or tasks they're involved in
      if (user.isStaff()) {
        const userIdStr = user.id?.toString();
        
        // Own tasks
        if (task.assigneeId?.toString() === userIdStr || task.createdBy?.toString() === userIdStr) return true;
        
        // Team members' tasks (check batch-loaded users)
        for (const [id, doc] of involvedUsers) {
          if (doc.teamId?.toString() === user.teamId?.toString()) return true;
        }
        
        // Tasks they're collaborating on
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

  async getTasksByProject(projectId, userId, filters = {}) {
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
      
      let tasks = visible.map((d) => this.mapPopulatedTaskDocToDTO(d));
      
      // Apply filtering and sorting if provided
      if (filters.status) {
        tasks = this.filterByStatus(tasks, filters.status);
      }
      
      if (filters.sortBy) {
        tasks = this.sortTasks(tasks, filters.sortBy, filters.order);
      }
      
      return tasks;
    } catch (error) {
      throw new Error('Error fetching tasks by project');
    }
  }

  async getTasksByTeam(teamId, requesterId, filters = {}) {
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
      
      let tasks = populated.map((d) => this.mapPopulatedTaskDocToDTO(d));
      
      // Apply filtering and sorting
      if (filters.status) {
        tasks = this.filterByStatus(tasks, filters.status);
      }
      
      if (filters.sortBy) {
        tasks = this.sortTasks(tasks, filters.sortBy, filters.order);
      }
      
      return tasks;
    } catch (error) {
      throw new Error('Error fetching tasks by team');
    }
  }

  async getTasksByDepartment(departmentId, requesterId, filters = {}) {
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
      
      let tasks = populated.map((d) => this.mapPopulatedTaskDocToDTO(d));
      
      // Apply filtering and sorting
      if (filters.status) {
        tasks = this.filterByStatus(tasks, filters.status);
      }
      
      if (filters.sortBy) {
        tasks = this.sortTasks(tasks, filters.sortBy, filters.order);
      }
      
      return tasks;
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

  /**
   * Helper method to filter tasks by status
   * @param {Array} tasks - Array of task DTOs
   * @param {string} status - Status to filter by ('all', 'ongoing', 'completed', 'unassigned', 'under_review', 'overdue')
   * @returns {Array}
   */
  filterByStatus(tasks, status) {
    if (!status || status === 'all') return tasks;
    
    if (status === 'overdue') {
      const now = new Date();
      return tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < now && task.status !== 'completed';
      });
    }
    
    return tasks.filter(task => task.status === status);
  }

  /**
   * Helper method to sort tasks
   * @param {Array} tasks - Array of task DTOs
   * @param {string} sortBy - Field to sort by ('dueDate', 'status', 'assignee', 'project')
   * @param {string} order - 'asc' or 'desc'
   * @returns {Array}
   */
  sortTasks(tasks, sortBy, order = 'asc') {
    if (!sortBy) return tasks;
    
    const sorted = [...tasks];
    
    switch (sortBy) {
      case 'dueDate':
        sorted.sort((a, b) => {
          const aTime = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const bTime = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return order === 'asc' ? aTime - bTime : bTime - aTime;
        });
        break;
        
      case 'status':
        sorted.sort((a, b) => {
          const comparison = (a.status || '').localeCompare(b.status || '');
          return order === 'asc' ? comparison : -comparison;
        });
        break;
        
      case 'assignee':
        sorted.sort((a, b) => {
          const aName = a.assigneeName || '';
          const bName = b.assigneeName || '';
          const comparison = aName.localeCompare(bName);
          return order === 'asc' ? comparison : -comparison;
        });
        break;
        
      case 'project':
        sorted.sort((a, b) => {
          const aName = a.projectName || '';
          const bName = b.projectName || '';
          const comparison = aName.localeCompare(bName);
          return order === 'asc' ? comparison : -comparison;
        });
        break;
        
      default:
        break;
    }
    
    return sorted;
  }

  /**
   * Calculate task statistics
   * @param {Array} tasks - Array of task DTOs
   * @returns {Object}
   */
  calculateTaskStats(tasks) {
    const now = new Date();
    
    return {
      total: tasks.length,
      unassigned: tasks.filter(t => t.status === 'unassigned').length,
      ongoing: tasks.filter(t => t.status === 'ongoing').length,
      under_review: tasks.filter(t => t.status === 'under_review').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate < now && t.status !== 'completed';
      }).length,
    };
  }

  async getUserTasks(userId, filters = {}) {
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
      
      let tasks = populated.map((d) => this.mapPopulatedTaskDocToDTO(d));
      
      // Apply filtering and sorting
      if (filters.status) {
        tasks = this.filterByStatus(tasks, filters.status);
      }
      
      if (filters.sortBy) {
        tasks = this.sortTasks(tasks, filters.sortBy, filters.order);
      }
      
      return tasks;
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

      if (ROLE_HIERARCHY[user.role] <= ROLE_HIERARCHY[assignee.role]) {
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