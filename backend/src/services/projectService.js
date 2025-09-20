const ProjectRepository = require('../repositories/ProjectRepository');
const Project = require('../domain/Project');
const UserRepository = require('../repositories/UserRepository');
const User = require('../domain/User');

class ProjectService {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} userId - ID of user creating the project
   */

  //Code Reviewed
  async createProject(projectData, userId) {
    try {
      const project = new Project({ ...projectData, ownerId: userId });

      // If department is specified, validate collaborators
      await this.validateCollaborators(project.collaborators, project.departmentId);

      await this.projectRepository.create(project);

      return project;
    } catch (error) {
      console.log(error);
      throw new Error(`Error creating project: ${error.message}`);
    }
  }

  //Code Reviewed
  async validateCollaborators(collaborators, departmentId) {
    try {
      const userRepository = new UserRepository();
      for (const collaboratorId of collaborators) {
        const collaboratorDoc = await userRepository.findById(collaboratorId);
        if (!collaboratorDoc) {
          throw new Error(`Collaborator ${collaboratorId} not found`);
        }

        const collaborator = new User(collaboratorDoc);
        if (collaborator.departmentId && departmentId) {
          if (!collaborator.departmentId.equals(departmentId)) {
            throw new Error("All collaborators must be from the same department");
          }
        }
      }
    } catch (error) {
      throw new Error(`Error validating collaborators: ${error.message}`);
    }
  }

  //Code Reviewed
  async getAllProjects(){
    try{
      const projectDocs = await this.project.findAllProjects();
      return projectDocs.map(doc => new Project(doc));
    } catch (error){
      throw new Error(`Error fetching project: ${error.message}`);
    }
  }

  //Code Reviewed
  async getProjects() {
    try {
      const projectDocs = await this.projectRepository.findActiveProjects();
      return projectDocs.map(doc => new Project(doc));
    } catch (error) {
      throw new Error(`Error fetching project: ${error.message}`);
    }
  }

  //Code Reviewed
  async getProjectById(projectId) {
    try {
      const projectDoc = await this.projectRepository.findById(projectId);
      if (!projectDoc) throw new Error('Project not found');
      
      return new Project(projectDoc);
    } catch (error) {
      throw new Error(`Error fetching project: ${error.message}`);
    }
  }

  /**
   * Update a project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - ID of user making the update
   */
  //Code Reviewed
  async updateProject(projectId, updateData, userId) {
    try {
      const projectDoc = await this.projectRepository.findById(projectId);
      if (!projectDoc) throw new Error('Project not found');

      const project = new Project(projectDoc);

      // Merge collaborators (safe even if updateData.collaborators is undefined)
      project.mergeCollaborators(updateData.collaborators || []);

      // Validate department-based collaborators after merge
      await this.validateCollaborators(project.collaborators, updateData.departmentId || project.departmentId);

      const fieldsToUpdate = { ...updateData, collaborators: project.collaborators };
      await this.projectRepository.updateById(projectId, fieldsToUpdate);

      return project;
    }
    catch (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }
  }

  /**
   * Add a collaborator to a project
   * @param {string} projectId - Project ID
   * @param {string} collaboratorId - New collaborator's user ID
   */
  //Code Reviewed
  async addCollaborator(projectId, collaboratorId) {
    try {
      const projectDoc = await this.projectRepository.findById(projectId);
      if (!projectDoc) throw new Error('Project not found');

      const project = new Project(projectDoc);
      const userRepository = new UserRepository();
      const collaboratorDoc = await userRepository.findById(collaboratorId);
      const collaborator = new User(collaboratorDoc);

      // Validate department membership if project has department
      if (project.departmentId && collaborator.departmentId) {
        if (!project.departmentId.equals(collaborator.departmentId)) {
          throw new Error('Collaborator must be from the same department');
        }
      }
      
      project.mergeCollaborators([collaboratorId]);
      const updatedProjectDoc = await this.projectRepository.addCollaborator(projectId, collaboratorId);

      return project;
    } catch (error) {
      throw new Error(`Error adding collaborator: ${error.message}`);
    }
  }

  /**
   * Check project visibility for a user
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   */
  async isVisibleToUser(projectId, userId) {
    try {
      const projectDoc = await this.projectRepository.findById(projectId);
      if (!projectDoc) return false;

      const project = new Project(projectDoc);
      const userRepository = new UserRepository();
      const userDoc = await userRepository.findById(userId);
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
}

// Create singleton instance
const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);

module.exports = projectService;