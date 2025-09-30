class User {
  constructor(data) {
    this.id = data._id || data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    // Support populated docs: if populated, use id and expose names
    this.teamId = data.teamId && (data.teamId._id || data.teamId);
    this.departmentId = data.departmentId && (data.departmentId._id || data.departmentId);
    this.teamName = data.teamId && data.teamId.name ? data.teamId.name : undefined;
    this.departmentName = data.departmentId && data.departmentId.name ? data.departmentId.name : undefined;
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
      teamName: this.teamName,
      departmentId: this.departmentId,
      departmentName: this.departmentName
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
