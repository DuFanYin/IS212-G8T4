class User {
  constructor(data) {
    this.id = data._id || data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.teamId = data.teamId;
    this.departmentId = data.departmentId;
    this.resetToken = data.resetToken;
    this.resetTokenExpiry = data.resetTokenExpiry;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Required role checks based on requirements
  isManager() {
    return ['manager', 'director', 'sm'].includes(this.role);
  }

  isStaff() {
    return this.role === 'staff';
  }

  isHR() {
    return this.role === 'hr';
  }

  isSeniorManagement() {
    return this.role === 'sm';
  }

  isDirector() {
    return this.role === 'director';
  }

  // Required permission checks
  canAssignTasks() {
    // Manager/Director: can assign tasks downwards
    return ['manager', 'director', 'sm'].includes(this.role);
  }

  canSeeAllTasks() {
    // HR/SM: full company visibility
    return ['hr', 'sm'].includes(this.role);
  }

  canSeeDepartmentTasks() {
    // Director: see department tasks
    return this.role === 'director';
  }

  canSeeTeamTasks() {
    // Manager: see team tasks
    return this.role === 'manager';
  }

  canAccessDepartment(deptId) {
    if (!this.departmentId || !deptId) return false;
    return this.departmentId.toString() === deptId.toString();
  }

  // Required DTOs
  toProfileDTO() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      teamId: this.teamId,
      departmentId: this.departmentId
    };
  }

  toSafeDTO() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role
    };
  }
}

module.exports = User;
