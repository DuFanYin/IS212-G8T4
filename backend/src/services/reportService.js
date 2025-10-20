const TaskRepository = require('../repositories/TaskRepository');
const UserRepository = require('../repositories/UserRepository');
const pdfGenerator = require('../utils/pdfGenerator');

const taskRepo = new TaskRepository();
const userRepo = new UserRepository();

class ReportService {
  async generateTeamReport(teamId, managerId) {
    const teamMembers = await userRepo.findUsersByTeam(teamId);
    if (!teamMembers.length) throw new Error('No members found in this team.');

    const stats = await taskRepo.aggregateTeamStats(teamId);

    const report = {
      teamId,
      generatedBy: managerId,
      generatedAt: new Date(),
      memberStats: stats,
      totalMembers: teamMembers.length
    };

    return report;
  }

  async exportTeamReportPDF(teamId, managerId) {
    const report = await this.generateTeamReport(teamId, managerId);
    const pdfBuffer = await pdfGenerator.generatePDF(report);
    return pdfBuffer;
  }
}

module.exports = new ReportService();
