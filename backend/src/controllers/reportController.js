const ReportService = require('../services/reportService');

const generateTeamReport = async (req, res) => {
  try {
    const { teamId } = req.params;
    const managerId = req.user.userId;
    const report = await ReportService.generateTeamReport(teamId, managerId);
    res.status(200).json({ status: 'success', data: report });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

const exportTeamReportPDF = async (req, res) => {
  try {
    const { teamId } = req.params;
    const managerId = req.user.userId;
    const pdfBuffer = await ReportService.exportTeamReportPDF(teamId, managerId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="team-report-${teamId}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

module.exports = { generateTeamReport, exportTeamReportPDF };
