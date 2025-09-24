const ProjectModel = require('../db/models/Project');
const Project = require('../domain/Project');
const mongoose = require('mongoose')

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

  async addCollaborators(id, collaboratorIds = []) {
    const cleanIds = collaboratorIds.map(collaboratorId => new mongoose.Types.ObjectId(collaboratorId));

    return ProjectModel.findByIdAndUpdate(
      id,
      { $addToSet: { collaborators: { $each: cleanIds } } },
      { new: true }
    );
  }

  async removeCollaborators(id, collaboratorIds = []){
    const cleanIds = collaboratorIds.map(collaboratorId => new mongoose.Types.ObjectId(collaboratorId));

    return ProjectModel.findByIdAndUpdate(
      id,
      { $pull: { collaborators: { $in: cleanIds } } },
      { new: true }
    );
  }

  async setHasTasks(id, hasTasks) {
    return ProjectModel.findByIdAndUpdate(id, { hasContainedTasks: hasTasks }, { new: true });
  }
}

module.exports = ProjectRepository;