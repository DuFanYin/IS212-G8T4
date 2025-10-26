const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getDepartmentMetrics,
  getTeamMetrics,
  getPersonalMetrics,
  getSingleTeamMetrics
} = require('../controllers/metricsController');

// Department-level metrics (HR/SM)
router.get('/departments', authMiddleware, getDepartmentMetrics);

// All teams metrics (Director and above)
router.get('/teams', authMiddleware, getTeamMetrics);

// Single team metrics (Manager)
router.get('/teams/:teamId', authMiddleware, getSingleTeamMetrics);

// Personal metrics (Staff)
router.get('/personal', authMiddleware, getPersonalMetrics);

module.exports = router;

