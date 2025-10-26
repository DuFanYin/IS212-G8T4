const TaskRepository = require('../repositories/TaskRepository');
const DepartmentRepository = require('../repositories/DepartmentRepository');
const TeamRepository = require('../repositories/TeamRepository');
const UserRepository = require('../repositories/UserRepository');
const User = require('../domain/User');
const TaskModel = require('../db/models/Task');
const Task = require('../domain/Task');

class MetricsService {
  constructor() {
    this.taskRepository = new TaskRepository();
    this.departmentRepository = new DepartmentRepository();
    this.teamRepository = new TeamRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Calculate status buckets for a task array
   * @param {Array} tasks - Array of task documents
   * @returns {Object} Status buckets
   */
  calculateStatusBuckets(tasks) {
    const now = new Date();
    return tasks.reduce((acc, task) => {
      if (task.status === 'ongoing') acc.ongoing++;
      if (task.status === 'under_review') acc.under_review++;
      if (task.status === 'completed') acc.completed++;
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed') {
        acc.overdue++;
      }
      return acc;
    }, { ongoing: 0, under_review: 0, completed: 0, overdue: 0 });
  }

  /**
   * Get department metrics (aggregated stats for all departments)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of department metrics
   */
  async getDepartmentMetrics(userId) {
    try {
      const userDoc = await this.userRepository.findById(userId);
      const user = new User(userDoc);

      // Only HR/SM can see department-level metrics
      if (!user.canSeeAllTasks()) {
        throw new Error('Not authorized to view department metrics');
      }

      const departments = await this.departmentRepository.findAll();
      const results = [];

      for (const dept of departments) {
        const tasks = await this.taskRepository.findTasksByDepartment(dept._id || dept.id);
        const populated = await TaskModel.populate(tasks, [
          { path: 'assigneeId', select: 'name' },
          { path: 'createdBy', select: 'name' },
          { path: 'collaborators', select: 'name' },
          { path: 'projectId', select: 'name' },
        ]);

        // Filter valid tasks (with projects, not deleted)
        const valid = populated.filter(t => t.projectId && !t.isDeleted);
        const buckets = this.calculateStatusBuckets(valid);

        results.push({
          titleName: 'Company',
          name: dept.name,
          ...buckets,
        });
      }

      return results;
    } catch (error) {
      throw new Error(`Error fetching department metrics: ${error.message}`);
    }
  }

  /**
   * Get team metrics (aggregated stats for all teams)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of team metrics
   */
  async getTeamMetrics(userId) {
    try {
      const userDoc = await this.userRepository.findById(userId);
      const user = new User(userDoc);

      // Only Director and above can see team-level metrics
      if (!user.canSeeDepartmentTasks() && !user.canSeeAllTasks()) {
        throw new Error('Not authorized to view team metrics');
      }

      const teams = await this.teamRepository.findAll();
      const results = [];

      for (const team of teams) {
        const tasks = await this.taskRepository.findTasksByTeam(team._id || team.id);
        const populated = await TaskModel.populate(tasks, [
          { path: 'assigneeId', select: 'name' },
          { path: 'createdBy', select: 'name' },
          { path: 'collaborators', select: 'name' },
          { path: 'projectId', select: 'name' },
        ]);

        // Filter valid tasks (with projects, not deleted)
        const valid = populated.filter(t => t.projectId && !t.isDeleted);
        const buckets = this.calculateStatusBuckets(valid);

        results.push({
          titleName: 'Department',
          name: team.name,
          ...buckets,
        });
      }

      return results;
    } catch (error) {
      throw new Error(`Error fetching team metrics: ${error.message}`);
    }
  }

  /**
   * Get personal task metrics (for staff)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Personal metrics
   */
  async getPersonalMetrics(userId) {
    try {
      const userDoc = await this.userRepository.findById(userId);
      const user = new User(userDoc);

      // Get user's tasks
      const ownTasks = await this.taskRepository.findTasksByAssignee(userId);
      const teamTasks = await this.taskRepository.findTasksByTeam(user.teamId);
      const projectTasks = await this.taskRepository.findTasksByCollaborator(userId);

      // Combine and deduplicate
      const allTasks = [...ownTasks, ...teamTasks, ...projectTasks];
      const uniqueTasks = allTasks.filter((task, index, self) => {
        const id = task?._id?.toString?.();
        return id && index === self.findIndex(t => t?._id?.toString?.() === id);
      });

      const populated = await TaskModel.populate(uniqueTasks, [
        { path: 'assigneeId', select: 'name' },
        { path: 'createdBy', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'projectId', select: 'name' },
      ]);

      // Filter valid tasks
      const valid = populated.filter(t => t.projectId && !t.isDeleted);
      const buckets = this.calculateStatusBuckets(valid);

      return [{
        titleName: 'Personal',
        name: user.name,
        ...buckets,
      }];
    } catch (error) {
      throw new Error(`Error fetching personal metrics: ${error.message}`);
    }
  }

  /**
   * Get single team metrics (for managers)
   * @param {string} userId - User ID (manager)
   * @param {string} teamId - Team ID
   * @returns {Promise<Array>} Team metrics
   */
  async getSingleTeamMetrics(userId, teamId) {
    try {
      const userDoc = await this.userRepository.findById(userId);
      const user = new User(userDoc);

      if (!user.canSeeTeamTasks()) {
        throw new Error('Not authorized to view team metrics');
      }

      const tasks = await this.taskRepository.findTasksByTeam(teamId);
      const populated = await TaskModel.populate(tasks, [
        { path: 'assigneeId', select: 'name' },
        { path: 'createdBy', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'projectId', select: 'name' },
      ]);

      const valid = populated.filter(t => t.projectId && !t.isDeleted);
      const buckets = this.calculateStatusBuckets(valid);

      return [{
        titleName: 'Team',
        name: user.teamName || 'Team',
        ...buckets,
      }];
    } catch (error) {
      throw new Error(`Error fetching team metrics: ${error.message}`);
    }
  }
}

module.exports = new MetricsService();

