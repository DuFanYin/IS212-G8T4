const ReportService = require('../services/reportService');

// Generate JSON report (now supports filters)
const generateTeamReport = async (req, res) => {
  try {
    const { teamId } = req.params;
    const managerId = req.user.userId;

    // Extract filters from query parameters
    const { status, assignee, project, startDate, endDate } = req.query;

    const filters = {
      ...(status && { status }),
      ...(assignee && { assignee }),
      ...(project && { project }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const report = await ReportService.generateTeamReport(teamId, managerId, filters);

    res.status(200).json({ status: 'success', data: report });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Export PDF (also supports same filters)
const exportTeamReportPDF = async (req, res) => {
  try {
    const { teamId } = req.params;
    const managerId = req.user.userId;

    // Optional filters for PDF export too
    const { status, assignee, project, startDate, endDate } = req.query;

    const filters = {
      ...(status && { status }),
      ...(assignee && { assignee }),
      ...(project && { project }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const pdfBuffer = await ReportService.exportTeamReportPDF(teamId, managerId, filters);

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
