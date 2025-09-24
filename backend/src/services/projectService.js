const ProjectRepository = require('../repositories/ProjectRepository');
const Project = require('../domain/Project');
const UserRepository = require('../repositories/UserRepository');
const User = require('../domain/User');

class ProjectService {
  constructor(projectRepository, userRepository) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} userId - ID of user creating the project
   */
  //Code Reviewed
  async createProject(projectData, userId) {
    const project = new Project({ ...projectData, ownerId: userId });
    await this.validateCollaborators(project.collaborators, project.departmentId);
    await this.projectRepository.create(project);
    return project;
  }

  //Code Reviewed
  async getAllProjects(){
    const projectDocs = await this.projectRepository.findAllProjects();
    return projectDocs.map(doc => new Project(doc));
  }

  //Code Reviewed
  async getActiveProjects() {
    const projectDocs = await this.projectRepository.findActiveProjects();
    return projectDocs.map(doc => new Project(doc));
  }

  /**
   * Update a project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - ID of user making the update
   */
  //Code Reviewed
  async updateProject(projectId, updateData, userId) {
    const project = await this.getProjectById(projectId);

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
    await this.projectRepository.updateById(projectId, otherFields);

    if (newCollaborators.length) {
      await this.projectRepository.addCollaborators(projectId, newCollaborators);
    }

    const updatedProjectDoc = await this.getProjectById(projectId);
    return new Project(updatedProjectDoc);
  }

  /**
   * Add a collaborator to a project
   * @param {string} projectId - Project ID
   * @param {string} collaboratorId - New collaborator's user ID
   */
  //Code Reviewed
  async addCollaborator(projectId, collaboratorId, userId) {
    const project = await this.getProjectById(projectId);

    await this.validateUser(project, userId);

    const collaboratorDoc = await this.userRepository.findById(collaboratorId);
    if (!collaboratorDoc) throw new Error('Collaborator not found');

    this.validateDepartmentMembership(collaboratorDoc.departmentId, project.departmentId);

    await this.projectRepository.addCollaborators(projectId, [collaboratorId]);

    const updatedProjectDoc = await this.getProjectById(projectId);
    return new Project(updatedProjectDoc);
  }

  async validateUser(project, userId){
    const userDoc = await this.userRepository.findById(userId);
    const user = new User(userDoc);

    if (!project.canBeModifiedBy(user)) {
      throw new Error("Not Authorized");
    }
  }

  //Code Reviewed
  async validateCollaborators(collaborators, departmentId) {
    for (const collaboratorId of collaborators) {
      const collaboratorDoc = await this.userRepository.findById(collaboratorId);
      if (!collaboratorDoc) throw new Error(`Collaborator ${collaboratorId} not found`);

      const collaborator = new User(collaboratorDoc);
      this.validateDepartmentMembership(collaborator.departmentId, departmentId);
    }
  }

  //Code Reviewed
  validateDepartmentMembership(userDeptId, projectDeptId) {
    if (userDeptId && projectDeptId && !userDeptId.equals(projectDeptId)) {
      throw new Error("All collaborators must be from the same department");
    }
  }

  /**
   * Check project visibility for a user
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   */
  async isVisibleToUser(projectId, userId) {
    try {
      const project = this.getProjectById(projectId);
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
      throw new Error('Error fetching projects by owner');
    }
  }

  async getProjectsByDepartment(departmentId) {
    try {
      const projectDocs = await this.projectRepository.findProjectsByDepartment(departmentId);
      return projectDocs.map(doc => new Project(doc));
    } catch (error) {
      throw new Error('Error fetching projects by department');
    }
  }

  async getProjectById(projectId) {
    try { 
      const projectDoc = await this.projectRepository.findById(projectId); 
      if (!projectDoc) throw new Error('Project not found'); 
      return new Project(projectDoc); 
    } catch (error) { 
      throw new Error('Error fetching project by id');
    }
  }
}

// Create singleton instance
const projectRepository = new ProjectRepository();
const userRepository = new UserRepository();
const projectService = new ProjectService(projectRepository, userRepository);

module.exports = projectService;