class Subtask {
  constructor(data) {
    this.id = data._id || data.id;
    this.parentTaskId = data.parentTaskId;
    this.title = data.title;
    this.description = data.description;
    this.dueDate = data.dueDate;
    this.status = data.status;
    this.assigneeId = data.assigneeId;
    this.collaborators = data.collaborators || [];
    this.lastStatusUpdate = data.lastStatusUpdate;
    this.isDeleted = data.isDeleted;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Status checks
  isCompleted() {
    return this.status === 'completed';
  }

  isOngoing() {
    return this.status === 'ongoing';
  }

  isUnderReview() {
    return this.status === 'under_review';
  }

  isUnassigned() {
    return this.status === 'unassigned';
  }

  isOverdue() {
    return new Date() > new Date(this.dueDate) && !this.isCompleted();
  }

  // Permission checks
  canBeCompletedBy(user) {
    // User can complete if they are assignee or collaborator
    return this.assigneeId && this.assigneeId.toString() === user.id.toString() ||
           this.isCollaborator(user);
  }

  canBeEditedBy(user) {
    // User can edit if they are assignee or collaborator
    return this.assigneeId && this.assigneeId.toString() === user.id.toString() ||
           this.isCollaborator(user);
  }

  isCollaborator(user) {
    return this.collaborators.some(c => c.toString() === user.id.toString());
  }

  // Business logic
  updateStatus(newStatus) {
    this.status = newStatus;
    this.lastStatusUpdate = {
      status: newStatus,
      updatedAt: new Date()
    };
  }

  assignTo(userId) {
    this.assigneeId = userId;
    if (!this.collaborators.includes(userId)) {
      this.collaborators.push(userId);
    }
  }

  addCollaborator(userId) {
    if (!this.collaborators.includes(userId)) {
      this.collaborators.push(userId);
    }
  }

  // DTOs
  toDTO() {
    return {
      id: this.id,
      parentTaskId: this.parentTaskId,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      status: this.status,
      assigneeId: this.assigneeId,
      collaborators: this.collaborators,
      lastStatusUpdate: this.lastStatusUpdate,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Subtask;
