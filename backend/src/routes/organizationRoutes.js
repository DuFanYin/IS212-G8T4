const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAllDepartments, getTeamsByDepartment, getAllTeams } = require('../controllers/organizationController');

// Get all departments (SM only)
router.get('/departments', authMiddleware, getAllDepartments);

// Get teams by department (Director+)
router.get('/departments/:departmentId/teams', authMiddleware, getTeamsByDepartment);

// Get all teams (SM only)
router.get('/teams', authMiddleware, getAllTeams);

module.exports = router;
