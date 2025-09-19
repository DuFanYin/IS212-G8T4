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
  async createProject(projectData, userId) {
    try {
      // Ensure owner is a collaborator
      if (!projectData.collaborators) {
        projectData.collaborators = [];
      }
      if (!projectData.collaborators.includes(userId)) {
        projectData.collaborators.push(userId);
      }

      // If department is specified, validate collaborators
      await this.validateCollaborators(projectData.collaborators, projectData.departmentId);

      const projectDoc = await this.projectRepository.create({
        ...projectData,
        ownerId: userId
      });

      return new Project(projectDoc);
    } catch (error) {
      throw new Error('Error creating project');
    }
  }

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
      throw new Error('Error validating collaborators');
    }
  }

  async getProjects() {
    try {
      const projectDocs = await this.projectRepository.findActiveProjects();
      return projectDocs.map(doc => new Project(doc));
    } catch (error) {
      throw new Error('Error fetching projects');
    }
  }

  async getProjectById(projectId) {
    try {
      const projectDoc = await this.projectRepository.findById(projectId);
      if (!projectDoc) throw new Error('Project not found');
      
      return new Project(projectDoc);
    } catch (error) {
      throw new Error('Error fetching project');
    }
  }

  /**
   * Update a project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - ID of user making the update
   */
  async updateProject(projectId, updateData, userId) {
    try {
      const projectDoc = await this.projectRepository.findById(projectId);
      if (!projectDoc) throw new Error('Project not found');

      const project = new Project(projectDoc);

      // Validate department-based collaborators if department is being updated
      if (updateData.departmentId) {
        const invalidCollaborators = [];
        for (const collaboratorId of project.collaborators) {
          const userRepository = new UserRepository();
          const collaboratorDoc = await userRepository.findById(collaboratorId);
          const collaborator = new User(collaboratorDoc);
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
          const userRepository = new UserRepository();
          const collaboratorDoc = await userRepository.findById(collaboratorId);
          const collaborator = new User(collaboratorDoc);
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

      const updatedProjectDoc = await this.projectRepository.updateById(projectId, updateData);
      return new Project(updatedProjectDoc);
    } catch (error) {
      throw new Error('Error updating project');
    }
  }

  /**
   * Add a collaborator to a project
   * @param {string} projectId - Project ID
   * @param {string} collaboratorId - New collaborator's user ID
   */
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

      if (!project.collaborators.includes(collaboratorId)) {
        const updatedProjectDoc = await this.projectRepository.addCollaborator(projectId, collaboratorId);
        return new Project(updatedProjectDoc);
      }

      return project;
    } catch (error) {
      throw new Error('Error adding collaborator');
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