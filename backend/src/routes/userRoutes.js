const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile, getTeamMembers, getDepartmentMembers } = require('../controllers/userController');

router.get('/profile', authMiddleware, getProfile);
router.get('/team-members', authMiddleware, getTeamMembers);
router.get('/department-members/:departmentId?', authMiddleware, getDepartmentMembers);

module.exports = router;