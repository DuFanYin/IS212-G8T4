const express = require('express');
const router = express.Router();
const subtaskController = require('../controllers/subtaskController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/subtasks/:id', subtaskController.getSubtask);
router.get('/tasks/:parentTaskId/subtasks', subtaskController.getSubtasksByParentTask);
router.post('/tasks/:parentTaskId/subtasks', subtaskController.createSubtask);
router.put('/subtasks/:id', subtaskController.updateSubtask);
router.patch('/subtasks/:id/status', subtaskController.updateSubtaskStatus);
router.delete('/subtasks/:id', subtaskController.deleteSubtask);

module.exports = router;