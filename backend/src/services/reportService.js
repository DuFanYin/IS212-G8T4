const TaskRepository = require('../repositories/TaskRepository');
const UserRepository = require('../repositories/UserRepository');
const pdfGenerator = require('../utils/pdfGenerator');

const taskRepo = new TaskRepository();
const userRepo = new UserRepository();

class ReportService {
  /**
   * Generate team report with optional filters
   * @param {String} teamId 
   * @param {String} managerId 
   * @param {Object} filters - Optional filters (status, assignee, project, startDate, endDate)
   */
  async generateTeamReport(teamId, managerId, filters = {}) {
    const teamMembers = await userRepo.findUsersByTeam(teamId);
    if (!teamMembers.length) throw new Error('No members found in this team.');

    // Apply filters
    const { status, assignee, project, startDate, endDate } = filters;
    const query = { teamId, isDeleted: false };

    if (status) query.status = status;
    if (assignee) query.assigneeId = assignee;
    if (project) query.projectId = project;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch filtered task data
    const teamTasks = await taskRepo.findTasksByTeam(teamId);

    // Apply filtering manually (since findTasksByTeam already gathers tasks)
    const filteredTasks = teamTasks.filter(task => {
      let ok = true;
      if (status && task.status !== status) ok = false;
      if (assignee && task.assigneeId?.toString() !== assignee) ok = false;
      if (project && task.projectId?.toString() !== project) ok = false;
      if (startDate && new Date(task.createdAt) < new Date(startDate)) ok = false;
      if (endDate && new Date(task.createdAt) > new Date(endDate)) ok = false;
      return ok;
    });

    // Compute stats per member
    const memberStats = teamMembers.map(member => {
      const memberTasks = filteredTasks.filter(
        t => t.assigneeId?.toString() === member._id.toString()
      );
      return {
        memberId: member._id,
        memberName: member.name,
        totalTasks: memberTasks.length,
        completedTasks: memberTasks.filter(t => t.status === 'completed').length,
        ongoingTasks: memberTasks.filter(t => t.status === 'ongoing').length,
        underReviewTasks: memberTasks.filter(t => t.status === 'under_review').length,
      };
    });

    const report = {
      teamId,
      filters,
      generatedBy: managerId,
      generatedAt: new Date(),
      totalMembers: teamMembers.length,
      totalTasks: filteredTasks.length,
      memberStats,
    };

    return report;
  }

  /**
   * Export team report as PDF with filters
   */
  async exportTeamReportPDF(teamId, managerId, filters = {}) {
    const report = await this.generateTeamReport(teamId, managerId, filters);
    const pdfBuffer = await pdfGenerator.generatePDF(report);
    return pdfBuffer;
  }
}

module.exports = new ReportService();
