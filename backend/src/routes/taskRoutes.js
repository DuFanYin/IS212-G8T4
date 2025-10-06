const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  createTask, 
  getUserTasks, 
  getProjectTasks, 
  getTeamTasks,
  getDepartmentTasks,
  getTaskById, 
  updateTask, 
  assignTask, 
  updateTaskStatus,
  getUnassignedTasks,
  archiveTask 
} = require('../controllers/taskController');

// Create a new task
router.post('/', authMiddleware, createTask);

// Get user's tasks (role-based visibility)
router.get('/', authMiddleware, getUserTasks);

// Get tasks by project
router.get('/project/:projectId', authMiddleware, getProjectTasks);

// Get tasks by team
router.get('/team/:teamId', authMiddleware, getTeamTasks);

// Get tasks by department
router.get('/department/:departmentId', authMiddleware, getDepartmentTasks);

// Get all unassigned tasks
router.get('/unassigned', authMiddleware, getUnassignedTasks);

// Get task by ID
router.get('/:id', authMiddleware, getTaskById);

// Update a task
router.put('/:id', authMiddleware, updateTask);

// Assign task to user
router.patch('/:id/assign', authMiddleware, assignTask);

// Update task status
router.patch('/:id/status', authMiddleware, updateTaskStatus);

// Archive a task
router.delete('/:id', authMiddleware, archiveTask);

module.exports = router;
