class Project {
  constructor(data) {
    this.id = data._id || data.id;
    this.name = data.name;
    this.description = data.description;
    this.ownerId = data.ownerId;
    this.deadline = data.deadline;
    this.departmentId = data.departmentId;
    this.collaborators = data.collaborators || [];
    this.isArchived = data.isArchived || false;
    this.hasContainedTasks = data.hasContainedTasks || false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.addOwnerToCollaborators();
  }

  addOwnerToCollaborators() {
    if (!this.collaborators.includes(this.ownerId)) {
      this.collaborators.push(this.ownerId);
    }
  }

  // Required checks based on requirements
  isOwner(userId) {
    return this.ownerId?.toString() === userId.toString();
  }

  isCollaborator(userId) {
    return this.collaborators.some(collab => collab.toString() === userId.toString());
  }

  canBeAccessedBy(user) {
    // Owner can always access
    if (this.isOwner(user.id)) return true;
    
    // Collaborators can access
    if (this.isCollaborator(user.id)) return true;
    
    // HR/SM: see all tasks/projects
    if (user.canSeeAllTasks()) return true;
    
    // Director: see department tasks
    if (user.canSeeDepartmentTasks() && this.departmentId) {
      return user.canAccessDepartment(this.departmentId);
    }
    
    return false;
  }

  canBeModifiedBy(user) {
    // Only owner or managers can modify
    return this.isOwner(user.id) || user.isManager();
  }

  addCollaborator(userId) {
    if (!this.collaborators.includes(userId)) {
      this.collaborators.push(userId);
    }
  }

  isOverdue() {
    return this.deadline && new Date(this.deadline) < new Date() && !this.isArchived;
  }

  hasTasks() {
    return this.hasContainedTasks;
  }

  setHasTasks(hasTasks) {
    this.hasContainedTasks = hasTasks;
  }

  mergeCollaborators(newCollaborators){
    this.collaborators = [...new Set([...this.collaborators, ...newCollaborators, this.ownerId])];
  }

  // Required DTOs
  toDTO() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerId: this.ownerId,
      deadline: this.deadline,
      departmentId: this.departmentId,
      collaborators: this.collaborators,
      isArchived: this.isArchived,
      hasContainedTasks: this.hasContainedTasks,
      isOverdue: this.isOverdue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Project;