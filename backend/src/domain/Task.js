class Task {
  constructor(data) {
    this.id = data._id || data.id;
    this.title = data.title;
    this.description = data.description;
    this.dueDate = data.dueDate;
    this.status = data.status;
    this.createdBy = data.createdBy;
    this.assigneeId = data.assigneeId;
    this.projectId = data.projectId;
    this.attachments = data.attachments || [];
    this.collaborators = data.collaborators || [];
    this.lastStatusUpdate = data.lastStatusUpdate;
    this.isDeleted = data.isDeleted || false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Required status checks based on requirements
  isOverdue() {
    return this.dueDate && new Date(this.dueDate) < new Date() && this.status !== 'completed';
  }

  isCompleted() {
    return this.status === 'completed';
  }

  isUnassigned() {
    return this.status === 'unassigned';
  }

  isOngoing() {
    return this.status === 'ongoing';
  }

  isUnderReview() {
    return this.status === 'under_review';
  }

  // Required permission checks based on requirements
  canBeCompletedBy(user) {
    // Staff auto-own tasks they create
    if (this.createdBy?.toString() === user.id?.toString()) return true;
    
    // Assignment transfers ownership
    if (this.assigneeId?.toString() === user.id?.toString()) return true;
    
    // Collaborators can complete
    return this.collaborators.some(collab => collab.toString() === user.id?.toString());
  }

  canBeAssignedBy(user) {
    // Managers/Directors can assign tasks to lower roles only
    return user.canAssignTasks();
  }

  canBeEditedBy(user) {
    // Staff can only edit tasks they created (title, due date, collaborators)
    if (user.isStaff()) {
      return this.createdBy?.toString() === user.id?.toString();
    }
    
    // Managers must be collaborators to update task status
    if (user.isManager()) {
      return this.collaborators.some(collab => collab.toString() === user.id?.toString());
    }
    
    return false;
  }

  isCollaborator(userId) {
    return this.collaborators.some(collab => collab.toString() === userId.toString());
  }

  // Required business logic
  updateStatus(newStatus, updatedBy) {
    this.status = newStatus;
    this.lastStatusUpdate = {
      status: newStatus,
      updatedBy: updatedBy.id,
      updatedAt: new Date()
    };
  }

  assignTo(userId) {
    this.assigneeId = userId;
    this.status = 'ongoing';
  }

  addCollaborator(userId) {
    if (!this.collaborators.includes(userId)) {
      this.collaborators.push(userId);
    }
  }

  hasAttachments() {
    return this.attachments && this.attachments.length > 0;
  }

  // Required DTOs
  toDTO() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      status: this.status,
      createdBy: this.createdBy,
      assigneeId: this.assigneeId,
      projectId: this.projectId,
      collaborators: this.collaborators,
      attachments: this.attachments,
      isOverdue: this.isOverdue(),
      hasAttachments: this.hasAttachments(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Task;