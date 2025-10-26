const ProjectRepository = require('../repositories/ProjectRepository');
const Project = require('../domain/Project');
const UserRepository = require('../repositories/UserRepository');
const User = require('../domain/User');
const ProjectModel = require('../db/models/Project');
const TaskRepository = require('../repositories/TaskRepository');


class ProjectService {
  constructor(projectRepository, userRepository, taskRepository) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
    this.taskRepository = taskRepository;
  }

  /**
 * Managers (or owners) can view aggregated progress for tasks in a project.
 * Returns: { total, unassigned, ongoing, under_review, completed, percent }
 */
  async getProjectProgress(projectId, userId) {
    // 1) Load project and requesting user
    const project = await this.getProjectDomainById(projectId);
    const userDoc = await this.userRepository.findById(userId);
    if (!userDoc) throw new Error('User not found');
    const user = new User(userDoc);

    // 2) Authorize: allow if user can see all tasks (manager-like) OR can modify this project (owner/manager)
    const isManagerLike = typeof user.canSeeAllTasks === 'function' && user.canSeeAllTasks();
    const isOwnerOrManager = typeof project.canBeModifiedBy === 'function' && project.canBeModifiedBy(user);
    if (!isManagerLike && !isOwnerOrManager) {
      throw new Error('Not Authorized');
    }

    // 3) Aggregate status buckets via TaskRepository (supports both projectId and projects[])
    return this.taskRepository.countByStatusForProject(projectId);
  }

  /**
   * Get detailed statistics for a project's tasks
   * Returns: { total, completed, inProgress, overdue, unassigned }
   */
  async getProjectStats(projectId, userId) {
    try {
      const project = await this.getProjectDomainById(projectId);
      const userDoc = await this.userRepository.findById(userId);
      if (!userDoc) throw new Error('User not found');
      const user = new User(userDoc);

      // Authorize: allow if user can see all tasks OR can modify this project
      const isManagerLike = typeof user.canSeeAllTasks === 'function' && user.canSeeAllTasks();
      const isOwnerOrManager = typeof project.canBeModifiedBy === 'function' && project.canBeModifiedBy(user);
      if (!isManagerLike && !isOwnerOrManager) {
        throw new Error('Not authorized');
      }

      // Get all tasks for this project
      const taskDocs = await this.taskRepository.findTasksByProject(projectId);
      const TaskModel = require('../db/models/Task');
      
      // Populate tasks
      const populated = await TaskModel.populate(taskDocs, [
        { path: 'assigneeId', select: 'name' },
        { path: 'createdBy', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'projectId', select: 'name' },
      ]);

      const Task = require('../domain/Task');
      const tasks = populated.map(doc => new Task(doc));

      // Calculate statistics
      const now = new Date();
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'ongoing' || t.status === 'under_review').length,
        overdue: tasks.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return dueDate < now && t.status !== 'completed';
        }).length,
        unassigned: tasks.filter(t => t.status === 'unassigned').length,
      };

      return stats;
    } catch (error) {
      throw new Error(`Error fetching project stats: ${error.message}`);
    }
  }

  // Internal: fetch domain Project by id (for permission/logic checks)
  async getProjectDomainById(projectId) {
    const doc = await this.projectRepository.findById(projectId);
    if (!doc) throw new Error('Project not found');
    return new Project(doc);
  }

  // Build enriched DTO for projects including ownerName and collaboratorNames
  async buildEnrichedProjectDTO(project) {
    const dto = project.toDTO ? project.toDTO() : project;
    let ownerName = undefined;
    try {
      if (dto.ownerId) {
        const ownerDoc = await this.userRepository.findById(dto.ownerId);
        ownerName = ownerDoc?.name;
      }
    } catch { }

    let collaboratorNames = undefined;
    try {
      if (Array.isArray(dto.collaborators) && dto.collaborators.length > 0) {
        const names = [];
        for (const id of dto.collaborators) {
          try {
            const doc = await this.userRepository.findById(id);
            if (doc?.name) names.push(doc.name);
          } catch { }
        }
        collaboratorNames = names;
      }
    } catch { }

    return { ...dto, ownerName, collaboratorNames };
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} userId - ID of user creating the project
   */
  //Code Reviewed
  async createProject(projectData, userId) {
    // Convert collaborators to new format if they're in legacy format
    let collaborators = projectData.collaborators || [];
    if (Array.isArray(collaborators) && collaborators.length > 0 && typeof collaborators[0] === 'string') {
      collaborators = collaborators.map(collabId => ({
        user: collabId,
        role: 'viewer',
        assignedBy: userId,
        assignedAt: new Date()
      }));
    }
    
    // Add owner as collaborator in new format
    const ownerCollaborator = {
      user: userId,
      role: 'editor',
      assignedBy: userId,
      assignedAt: new Date()
    };
    
    // Check if owner is already in collaborators
    const ownerExists = collaborators.some(collab => collab.user.toString() === userId.toString());
    if (!ownerExists) {
      collaborators.push(ownerCollaborator);
    }
    
    const project = new Project({ ...projectData, ownerId: userId, collaborators });
    await this.validateCollaborators(project.collaborators, project.departmentId);
    const createdDoc = await this.projectRepository.create(project);
    return new Project(createdDoc);
  }

  //Code Reviewed
  async getAllProjects() {
    const docs = await this.projectRepository.findAllProjects();
    const populated = await ProjectModel.populate(docs, [
      { path: 'ownerId', select: 'name' },
      { path: 'collaborators', select: 'name' },
      { path: 'departmentId', select: 'name' }
    ]);
    return populated.map((doc) => ({
      id: doc._id,
      name: doc.name,
      description: doc.description,
      ownerId: doc.ownerId?._id || doc.ownerId,
      ownerName: doc.ownerId?.name,
      deadline: doc.deadline,
      departmentId: doc.departmentId?._id || doc.departmentId,
      departmentName: doc.departmentId?.name,
      collaborators: Array.isArray(doc.collaborators) ? doc.collaborators.map((c) => c._id || c) : [],
      collaboratorNames: Array.isArray(doc.collaborators) ? doc.collaborators.map((c) => c.name).filter(Boolean) : [],
      isArchived: doc.isArchived,
      hasContainedTasks: doc.hasContainedTasks,
      isOverdue: doc.deadline ? new Date(doc.deadline) < new Date() && !doc.isArchived : false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  //Code Reviewed
  async getActiveProjects() {
    const docs = await this.projectRepository.findActiveProjects();
    const populated = await ProjectModel.populate(docs, [
      { path: 'ownerId', select: 'name' },
      { path: 'collaborators', select: 'name' },
      { path: 'departmentId', select: 'name' }
    ]);
    return populated.map((doc) => ({
      id: doc._id,
      name: doc.name,
      description: doc.description,
      ownerId: doc.ownerId?._id || doc.ownerId,
      ownerName: doc.ownerId?.name,
      deadline: doc.deadline,
      departmentId: doc.departmentId?._id || doc.departmentId,
      departmentName: doc.departmentId?.name,
      collaborators: Array.isArray(doc.collaborators) ? doc.collaborators.map((c) => c._id || c) : [],
      collaboratorNames: Array.isArray(doc.collaborators) ? doc.collaborators.map((c) => c.name).filter(Boolean) : [],
      isArchived: doc.isArchived,
      hasContainedTasks: doc.hasContainedTasks,
      isOverdue: doc.deadline ? new Date(doc.deadline) < new Date() && !doc.isArchived : false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  /**
   * Get projects visible to a given user based on role/visibility rules
   * - HR/SM: all active projects
   * - Director: active projects in their department
   * - Others: projects where they are owner or collaborator
   */
  async getVisibleProjectsForUser(userId) {
    const userDoc = await this.userRepository.findById(userId);
    if (!userDoc) {
      // Roll back to prior behavior: return active projects for safety
      return await this.getActiveProjects();
    }
    const user = new User(userDoc);

    let docs = [];
    if (user.canSeeAllTasks()) {
      docs = await this.projectRepository.findActiveProjects();
    } else if (user.canSeeDepartmentTasks()) {
      docs = await this.projectRepository.findProjectsByDepartment(user.departmentId);
      docs = docs.filter((d) => d.isArchived === false);
    } else {
      const owned = await this.projectRepository.findProjectsByOwner(user.id);
      const collab = await this.projectRepository.findProjectsByCollaborator(user.id);
      const combined = [...owned, ...collab].filter((d) => d.isArchived === false);
      // de-duplicate by _id
      const seen = new Set();
      docs = combined.filter((d) => {
        const key = d._id?.toString?.() || d.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    const populated = await ProjectModel.populate(docs, [
      { path: 'ownerId', select: 'name' },
      { path: 'collaborators', select: 'name' },
      { path: 'departmentId', select: 'name' }
    ]);

    return populated.map((doc) => ({
      id: doc._id,
      name: doc.name,
      description: doc.description,
      ownerId: doc.ownerId?._id || doc.ownerId,
      ownerName: doc.ownerId?.name,
      deadline: doc.deadline,
      departmentId: doc.departmentId?._id || doc.departmentId,
      departmentName: doc.departmentId?.name,
      collaborators: Array.isArray(doc.collaborators) ? doc.collaborators.map((c) => c._id || c) : [],
      collaboratorNames: Array.isArray(doc.collaborators) ? doc.collaborators.map((c) => c.name).filter(Boolean) : [],
      isArchived: doc.isArchived,
      hasContainedTasks: doc.hasContainedTasks,
      isOverdue: doc.deadline ? new Date(doc.deadline) < new Date() && !doc.isArchived : false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  /**
   * Update a project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - ID of user making the update
   */
  //Code Reviewed
  async updateProject(projectId, updateData, userId) {
    const project = await this.getProjectDomainById(projectId);

    await this.validateUser(project, userId);

    const newCollaborators = updateData.collaborators || [];
    const departmentId = updateData.departmentId || project.departmentId;

    if (newCollaborators.length || updateData.departmentId) {
      await this.validateCollaborators(
        [...project.collaborators, ...newCollaborators],
        departmentId
      );
    }

    const { collaborators, ...otherFields } = updateData;
    let updatedProjectDoc = await this.projectRepository.updateById(projectId, otherFields);

    if (newCollaborators.length) {
      updatedProjectDoc = await this.projectRepository.addCollaborators(projectId, newCollaborators);
    }

    return new Project(updatedProjectDoc);
  }

  /**
   * Add a collaborator to a project
   * @param {string} projectId - Project ID
   * @param {string} collaboratorId - New collaborator's user ID
   */
  //Code Reviewed
  async addCollaborator(projectId, collaboratorId, userId) {
    const project = await this.getProjectDomainById(projectId);

    await this.validateUser(project, userId);

    const collaboratorDoc = await this.userRepository.findById(collaboratorId);
    if (!collaboratorDoc) throw new Error('Collaborator not found');

    this.validateDepartmentMembership(collaboratorDoc.departmentId, project.departmentId);

    const updatedProjectDoc = await this.projectRepository.addCollaborators(projectId, [collaboratorId]);
    return new Project(updatedProjectDoc);
  }

  async removeCollaborator(projectId, collaboratorId, userId) {
    const project = await this.getProjectDomainById(projectId);

    await this.validateUser(project, userId);
    if (project.isOwner(collaboratorId)) {
      throw new Error("Cannot remove project owner");
    }

    const collaboratorDoc = await this.userRepository.findById(collaboratorId);
    if (!collaboratorDoc) throw new Error('Collaborator not found');

    const updatedProjectDoc = await this.projectRepository.removeCollaborators(projectId, [collaboratorId]);
    return new Project(updatedProjectDoc);
  }

  /**
 * Assign or update a collaborator's role within a project.
 * Only the project owner may change roles.
 */
  async assignRoleToCollaborator(projectId, collaboratorId, role, actingUserId) {
    // 1️⃣ Fetch the project domain model
    const project = await this.getProjectDomainById(projectId);

    // 2️⃣ Ensure the acting user exists and is authorized
    const actingUserDoc = await this.userRepository.findById(actingUserId);
    if (!actingUserDoc) throw new Error('Acting user not found');

    const actingUser = new User(actingUserDoc);
    if (!project.isOwner(actingUser.id)) {
      throw new Error('Only the project owner can assign or change roles');
    }

    // 3️⃣ Ensure the collaborator exists
    const collaboratorDoc = await this.userRepository.findById(collaboratorId);
    if (!collaboratorDoc) throw new Error('Collaborator not found');

    // 4️⃣ Persist role assignment via repository
    const updatedProject = await this.projectRepository.assignRole(
      projectId,
      collaboratorId,
      role,
      actingUserId
    );

    // 5️⃣ Log the role change (optional — if ActivityLogService is available)
    try {
      const ActivityLogService = require('./activityLogService');
      await ActivityLogService.logActivity({
        projectId,
        action: `Assigned role '${role}' to collaborator ${collaboratorId}`,
        performedBy: actingUserId,
        timestamp: new Date()
      });
    } catch (err) {
      console.warn('Activity logging failed:', err.message);
    }

    return new Project(updatedProject);
  }

  async validateUser(project, userId) {
    const userDoc = await this.userRepository.findById(userId);
    const user = new User(userDoc);

    if (!project.canBeModifiedBy(user)) {
      throw new Error("Not Authorized");
    }
  }

  //Code Reviewed
  async validateCollaborators(collaborators, departmentId) {
    for (const collaborator of collaborators) {
      // Handle both legacy string format and new object format
      const collaboratorId = typeof collaborator === 'string' ? collaborator : collaborator.user;
      const collaboratorDoc = await this.userRepository.findById(collaboratorId);
      if (!collaboratorDoc) throw new Error(`Collaborator ${collaboratorId} not found`);

      const collaboratorUser = new User(collaboratorDoc);
      this.validateDepartmentMembership(collaboratorUser.departmentId, departmentId);
    }
  }

  //Code Reviewed
  validateDepartmentMembership(userDeptId, projectDeptId) {
    if (userDeptId && projectDeptId) {
      const a = typeof userDeptId?.toString === 'function' ? userDeptId.toString() : `${userDeptId}`;
      const b = typeof projectDeptId?.toString === 'function' ? projectDeptId.toString() : `${projectDeptId}`;
      if (a !== b) {
        throw new Error("All collaborators must be from the same department");
      }
    }
  }

  /**
   * Check project visibility for a user
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   */
  async isVisibleToUser(projectId, userId) {
    try {
      const project = await this.getProjectDomainById(projectId);
      const userDoc = await this.userRepository.findById(userId);
      const user = new User(userDoc);

      return project.canBeAccessedBy(user);
    } catch (error) {
      return false;
    }
  }

  async getProjectsByOwner(ownerId) {
    try {
      const projectDocs = await this.projectRepository.findProjectsByOwner(ownerId);
      return projectDocs.map(doc => new Project(doc));
    } catch (error) {
      throw new Error(error?.message || 'Error fetching projects by owner');
    }
  }

  async getProjectsByDepartment(departmentId) {
    try {
      const projectDocs = await this.projectRepository.findProjectsByDepartment(departmentId);
      return projectDocs.map(doc => new Project(doc));
    } catch (error) {
      throw new Error(error?.message || 'Error fetching projects by department');
    }
  }

  async getProjectById(projectId) {
    try {
      const doc = await this.projectRepository.findById(projectId);
      if (!doc) throw new Error('Project not found');
      const populated = await ProjectModel.populate(doc, [
        { path: 'ownerId', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'departmentId', select: 'name' }
      ]);
      return {
        id: populated._id,
        name: populated.name,
        description: populated.description,
        ownerId: populated.ownerId?._id || populated.ownerId,
        ownerName: populated.ownerId?.name,
        deadline: populated.deadline,
        departmentId: populated.departmentId?._id || populated.departmentId,
        departmentName: populated.departmentId?.name,
        collaborators: Array.isArray(populated.collaborators) ? populated.collaborators.map((c) => c._id || c) : [],
        collaboratorNames: Array.isArray(populated.collaborators) ? populated.collaborators.map((c) => c.name).filter(Boolean) : [],
        isArchived: populated.isArchived,
        hasContainedTasks: populated.hasContainedTasks,
        isOverdue: populated.deadline ? new Date(populated.deadline) < new Date() && !populated.isArchived : false,
        createdAt: populated.createdAt,
        updatedAt: populated.updatedAt,
      };
    } catch (error) {
      throw new Error(error?.message || 'Error fetching project by id');
    }
  }
}

// Create singleton instance
const projectRepository = new ProjectRepository();
const userRepository = new UserRepository();
const taskRepository = new TaskRepository();
const projectService = new ProjectService(projectRepository, userRepository, taskRepository);

module.exports = projectService;