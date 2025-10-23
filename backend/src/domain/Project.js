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

    // Owner is now added in ProjectService.createProject()
    // this.addOwnerToCollaborators();
  }

  addOwnerToCollaborators() {
    const ownerIdStr = this.ownerId?.toString();
    const containsOwner = Array.isArray(this.collaborators) && this.collaborators.some((c) => {
      if (typeof c === 'object' && c && c.user) return c.user.toString() === ownerIdStr;
      return c?.toString?.() === ownerIdStr;
    });
    if (!containsOwner && this.ownerId) {
      // Add owner as collaborator in new format
      this.collaborators.push({
        user: this.ownerId,
        role: 'editor', // Owner should be editor by default
        assignedBy: this.ownerId,
        assignedAt: new Date()
      });
    }
  }

  // Required checks based on requirements
  isOwner(userId) {
    return this.ownerId?.toString() === userId.toString();
  }

  isCollaborator(userId) {
    const uid = userId?.toString?.() || `${userId}`;
    return this.collaborators.some((collab) => {
      if (typeof collab === 'object' && collab && collab.user) return collab.user.toString() === uid;
      return collab?.toString?.() === uid;
    });
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

  // Required DTOs
  toDTO() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerId: this.ownerId,
      deadline: this.deadline,
      departmentId: this.departmentId,
      // Keep collaborators in their current format for repository compatibility
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