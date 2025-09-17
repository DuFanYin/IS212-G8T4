const { Project, User, Task } = require('../db/models');
const UserService = require('./userService');

class ProjectService {
  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} userId - ID of user creating the project
   */
  static async createProject(projectData, userId) {

    // Ensure owner is a collaborator
    if (!projectData.collaborators.includes(userId)) {
      projectData.collaborators.push(userId);
    }

    // If department is specified, validate collaborators (errors are thrown naturally)
    await ProjectService.validateCollaborators(projectData.collaborators, projectData.departmentId);

    return Project.create({
      ...projectData,
      ownerId: userId
    });
  }

  static async validateCollaborators(collaborators, departmentId){

    //error is thrown naturally
    for(const collaboratorId of collaborators){
      const collaborator = await UserService.getUserById(collaboratorId);

      if(collaborator && collaborator.departmentId){

        if(!collaborator.departmentId.equals(departmentId)){
          throw new Error("All collaborators must be from the same department");
        }
      }
    }
  }

  /**
   * Update a project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - ID of user making the update
   */
  static async updateProject(projectId, updateData, userId) {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    // Validate department-based collaborators if department is being updated
    if (updateData.departmentId) {
      const invalidCollaborators = [];
      for (const collaboratorId of project.collaborators) {
        const collaborator = await User.findById(collaboratorId);
        if (collaborator && collaborator.departmentId) {
          if (!collaborator.departmentId.equals(updateData.departmentId)) {
            invalidCollaborators.push(collaboratorId);
          }
        }
      }
      if (invalidCollaborators.length > 0) {
        throw new Error('Cannot change department: some collaborators are from different departments');
      }
    }

    // Validate new collaborators
    if (updateData.collaborators) {
      if (project.departmentId) {
        const invalidCollaborators = [];
        for (const collaboratorId of updateData.collaborators) {
          const collaborator = await User.findById(collaboratorId);
          if (collaborator && collaborator.departmentId) {
            if (!collaborator.departmentId.equals(project.departmentId)) {
              invalidCollaborators.push(collaboratorId);
            }
          }
        }
        if (invalidCollaborators.length > 0) {
          throw new Error('All collaborators must be from the same department');
        }
      }

      // Ensure owner remains a collaborator
      if (!updateData.collaborators.includes(project.ownerId)) {
        updateData.collaborators.push(project.ownerId);
      }
    }

    Object.assign(project, updateData);
    return project.save();
  }

  /**
   * Add a collaborator to a project
   * @param {string} projectId - Project ID
   * @param {string} collaboratorId - New collaborator's user ID
   */
  static async addCollaborator(projectId, collaboratorId) {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const collaborator = await User.findById(collaboratorId);
    if (!collaborator) throw new Error('User not found');

    // Validate department membership if project has department
    if (project.departmentId && collaborator.departmentId) {
      if (!project.departmentId.equals(collaborator.departmentId)) {
        throw new Error('Collaborator must be from the same department');
      }
    }

    if (!project.collaborators.includes(collaboratorId)) {
      project.collaborators.push(collaboratorId);
      await project.save();
    }

    return project;
  }

  /**
   * Check project visibility for a user
   * @param {Object} project - Project object
   * @param {string} userId - User ID
   */
  static async isVisibleToUser(project, userId) {
    const user = await User.findById(userId);
    if (!user) return false;

    // HR and SM can see all projects
    if (['hr', 'sm'].includes(user.role)) return true;

    // Director can see all department projects
    if (user.role === 'director' && user.departmentId.equals(project.departmentId)) return true;

    // Manager and Staff can see projects they're collaborating on
    if (['manager', 'staff'].includes(user.role) && project.collaborators.includes(userId)) return true;

    return false;
  }

  /**
   * Archive a project
   * @param {string} projectId - Project ID
   */
  static async archiveProject(projectId) {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    project.isArchived = true;
    return project.save();
  }
}

module.exports = ProjectService;
