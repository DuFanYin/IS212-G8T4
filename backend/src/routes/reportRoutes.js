const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { generateTeamReport, exportTeamReportPDF } = require('../controllers/reportController');

router.get(
  '/team/:teamId',
  authMiddleware,
  roleMiddleware(['manager', 'admin']), // Only managers and admins allowed
  generateTeamReport
);

router.get(
  '/team/:teamId/pdf',
  authMiddleware,
  roleMiddleware(['manager', 'admin']),
  exportTeamReportPDF
);

module.exports = router;
