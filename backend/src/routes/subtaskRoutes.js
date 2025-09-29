const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getSubtask,
  getSubtasksByParentTask,
  createSubtask,
  updateSubtask,
  updateSubtaskStatus,
  deleteSubtask,
} = require('../controllers/subtaskController');

// Get subtask by ID
router.get('/subtasks/:id', authMiddleware, getSubtask);

// List subtasks for a parent task
router.get('/tasks/:parentTaskId/subtasks', authMiddleware, getSubtasksByParentTask);

// Create subtask under a parent task
router.post('/tasks/:parentTaskId/subtasks', authMiddleware, createSubtask);

// Update subtask
router.put('/subtasks/:id', authMiddleware, updateSubtask);

// Update subtask status
router.patch('/subtasks/:id/status', authMiddleware, updateSubtaskStatus);

// Archive (soft delete) subtask
router.delete('/subtasks/:id', authMiddleware, deleteSubtask);

module.exports = router;