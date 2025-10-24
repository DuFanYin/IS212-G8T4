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
    // Support both legacy (ObjectId[]) and new schema (subdocs with user)
    return ProjectModel.find({
      $or: [
        { collaborators: userId },
        { 'collaborators.user': userId }
      ]
    });
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
    
    // Get the current project to check existing collaborators
    const project = await ProjectModel.findById(id);
    if (!project) return null;
    
    // Filter out collaborators that already exist
    const existingCollaboratorIds = new Set();
    project.collaborators.forEach(collab => {
      if (typeof collab === 'object' && collab.user) {
        existingCollaboratorIds.add(collab.user.toString());
      } else {
        existingCollaboratorIds.add(collab.toString());
      }
    });
    
    const newCollaborators = cleanIds
      .filter(id => !existingCollaboratorIds.has(id.toString()))
      .map(uid => ({ user: uid, role: 'viewer' }));
    
    if (newCollaborators.length === 0) {
      return project; // No new collaborators to add
    }
    
    return ProjectModel.findByIdAndUpdate(
      id,
      { $push: { collaborators: { $each: newCollaborators } } },
      { new: true }
    );
  }

  async removeCollaborators(id, collaboratorIds = []){
    const cleanIds = collaboratorIds.map(collaboratorId => new mongoose.Types.ObjectId(collaboratorId));

    // Remove collaborators by user ID from subdocuments
    // For new format with subdocuments, match on the user field
    return ProjectModel.findByIdAndUpdate(
      id,
      {
        $pull: {
          collaborators: { user: { $in: cleanIds } }
        }
      },
      { new: true }
    );
  }

  async assignRole(projectId, collaboratorId, role, assignedBy) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new Error('Project not found');

    const targetId = collaboratorId.toString();

    // Normalize legacy collaborators (ObjectId[]) to subdocs on the fly
    if (project.collaborators.length > 0 && typeof project.collaborators[0] !== 'object') {
      project.collaborators = project.collaborators.map(id => ({ user: id, role: 'viewer' }));
    }

    // Find existing collaborator subdoc
    let existing = project.collaborators.find(c => c.user && c.user.toString() === targetId);

    // If not present, ensure added as collaborator with default role first
    if (!existing) {
      project.collaborators.push({ user: collaboratorId, role: 'viewer' });
      existing = project.collaborators.find(c => c.user && c.user.toString() === targetId);
    }

    // Update role metadata
    existing.role = role;
    existing.assignedBy = assignedBy;
    existing.assignedAt = new Date();

    await project.save();
    return project;
  }

  async setHasTasks(id, hasTasks) {
    return ProjectModel.findByIdAndUpdate(id, { hasContainedTasks: hasTasks }, { new: true });
  }
}

module.exports = ProjectRepository;