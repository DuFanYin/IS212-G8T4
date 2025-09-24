const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  createTask, 
  getUserTasks, 
  getProjectTasks, 
  getTaskById, 
  updateTask, 
  assignTask, 
  updateTaskStatus, 
  archiveTask 
} = require('../controllers/taskController');

// Create a new task
router.post('/', authMiddleware, createTask);

// Get user's tasks (role-based visibility)
router.get('/', authMiddleware, getUserTasks);

// Get tasks by project
router.get('/project/:projectId', authMiddleware, getProjectTasks);

// Get task by ID
router.get('/:id', authMiddleware, getTaskById);

// Update a task
router.put('/:id', authMiddleware, updateTask);

// Assign task to user
router.put('/:id/assign', authMiddleware, assignTask);

// Update task status
router.put('/:id/status', authMiddleware, updateTaskStatus);

// Archive a task
router.delete('/:id', authMiddleware, archiveTask);

module.exports = router;
