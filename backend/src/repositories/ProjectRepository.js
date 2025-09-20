const ProjectModel = require('../db/models/Project');
const Project = require('../domain/Project');

class ProjectRepository {
  async findById(id) {
    return ProjectModel.findById(id);
  }

  async findAllProjects(){
    return ProjectModel.find();
  }

  async findActiveProjects() {
    return ProjectModel.find({ isArchived: false });
  }

  async findProjectsByOwner(ownerId) {
    return ProjectModel.find({ ownerId });
  }

  async findProjectsByDepartment(departmentId) {
    return ProjectModel.find({ departmentId });
  }

  async findProjectsByCollaborator(userId) {
    return ProjectModel.find({ collaborators: userId });
  }

  async create(project) {
    if (!(project instanceof Project)) {
      throw new Error('Expected a Project instance');
    }

    const projectData = project.toDTO();
    return ProjectModel.create(projectData);
  }

  async updateById(id, updates) {
    return ProjectModel.findByIdAndUpdate(id, updates, { new: true });
  }

  async addCollaborator(id, userId) {
    return ProjectModel.findByIdAndUpdate(id, { 
      $addToSet: { collaborators: userId } 
    }, { new: true });
  }

  async setHasTasks(id, hasTasks) {
    return ProjectModel.findByIdAndUpdate(id, { hasContainedTasks: hasTasks }, { new: true });
  }
}

module.exports = ProjectRepository;