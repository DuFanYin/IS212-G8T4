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

  async assignRole(projectId, collaboratorId, role, assignedBy) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new Error('Project not found');
  
    // Ensure collaborators array uses the updated schema (with user, role, assignedBy)
    const existing = project.collaborators.find(
      c => c.user && c.user.toString() === collaboratorId
    );
  
    if (existing) {
      // Update existing collaborator’s role
      existing.role = role;
      existing.assignedBy = assignedBy;
      existing.assignedAt = new Date();
    } else {
      // Add new collaborator with role metadata
      project.collaborators.push({
        user: collaboratorId,
        role,
        assignedBy,
        assignedAt: new Date()
      });
    }
  
    await project.save();
    return project;
  }  

  async setHasTasks(id, hasTasks) {
    return ProjectModel.findByIdAndUpdate(id, { hasContainedTasks: hasTasks }, { new: true });
  }
}

module.exports = ProjectRepository;