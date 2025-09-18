const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware'); // users are signed in


router.use(auth);

// Create a new task
router.post('/', taskController.createTask);

// Get task by ID
router.get('/:id', taskController.getTaskById);

// Update a task
router.put('/:id', taskController.updateTask);

// Archive a task
router.delete('/:id', taskController.archiveTask);

module.exports = router;
