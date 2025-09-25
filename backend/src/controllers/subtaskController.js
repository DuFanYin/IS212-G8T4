const subtaskService = require('../services/subtaskService');

// GET /api/subtasks/:id
const getSubtask = async (req, res) => {
  try {
    const subtask = await subtaskService.getSubtaskById(req.params.id);
    res.json({
      status: 'success',
      data: subtask.toDTO(),
    });
  } catch (err) {
    res.status(404).json({ status: 'error', message: err.message });
  }
};

// GET /api/tasks/:parentTaskId/subtasks
const getSubtasksByParentTask = async (req, res) => {
  try {
    const subtasks = await subtaskService.getSubtasksByParentTask(req.params.parentTaskId);
    res.json({
      status: 'success',
      data: subtasks.map((s) => s.toDTO()),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/tasks/:parentTaskId/subtasks
const createSubtask = async (req, res) => {
  try {
    const subtask = await subtaskService.createSubtask(
      req.params.parentTaskId,
      req.body,
      req.user.userId
    );
    res.status(201).json({
      status: 'success',
      data: subtask.toDTO(),
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PUT /api/subtasks/:id
const updateSubtask = async (req, res) => {
  try {
    const subtask = await subtaskService.updateSubtask(
      req.params.id,
      req.body,
      req.user.userId
    );
    res.json({
      status: 'success',
      data: subtask.toDTO(),
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/subtasks/:id/status
const updateSubtaskStatus = async (req, res) => {
  try {
    const subtask = await subtaskService.updateSubtaskStatus(
      req.params.id,
      req.body.status,
      req.user.userId
    );
    res.json({
      status: 'success',
      data: subtask.toDTO(),
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/subtasks/:id
const deleteSubtask = async (req, res) => {
  try {
    const subtask = await subtaskService.softDeleteSubtask(
      req.params.id,
      req.user.userId
    );
    res.json({
      status: 'success',
      data: subtask.toDTO(),
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getSubtask,
  getSubtasksByParentTask,
  createSubtask,
  updateSubtask,
  updateSubtaskStatus,
  deleteSubtask,
};
