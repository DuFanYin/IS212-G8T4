const TaskService = require('../services/taskService');


// Create a new task

exports.createTask = async (req, res) => {
  try {
    const task = await TaskService.createTask(req.body, req.user._id);
    res.status(201).json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await TaskService.updateTask(req.params.id, req.body, req.user._id);
    res.json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Archive (soft delete) a task
exports.archiveTask = async (req, res) => {
  try {
    const task = await TaskService.archiveTask(req.params.id, req.user._id);
    res.json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Get task by ID

exports.getTaskById = async (req, res) => {
  try {
    const task = await TaskService.getById(req.params.id);
    const visible = await TaskService.isVisibleToUser(task, req.user._id);
    if (!visible) return res.status(403).json({ status: 'error', message: 'Not authorized to view this task' });

    res.json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
