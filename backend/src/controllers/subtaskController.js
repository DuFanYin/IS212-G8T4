const subtaskService = require('../services/subtaskService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');

const getSubtask = asyncHandler(async (req, res) => {
  const subtask = await subtaskService.getSubtaskById(req.params.id);
  sendSuccess(res, subtask.toDTO());
});

const getSubtasksByParentTask = asyncHandler(async (req, res) => {
  const subtasks = await subtaskService.getSubtasksByParentTask(req.params.parentTaskId);
  sendSuccess(res, subtasks.map((s) => s.toDTO()));
});

const createSubtask = asyncHandler(async (req, res) => {
  const subtask = await subtaskService.createSubtask(
    req.params.parentTaskId,
    req.body,
    req.user.userId
  );
  sendSuccess(res, subtask.toDTO(), null, 201);
});

const updateSubtask = asyncHandler(async (req, res) => {
  const subtask = await subtaskService.updateSubtask(
    req.params.id,
    req.body,
    req.user.userId
  );
  sendSuccess(res, subtask.toDTO());
});

const updateSubtaskStatus = asyncHandler(async (req, res) => {
  const subtask = await subtaskService.updateSubtaskStatus(
    req.params.id,
    req.body.status,
    req.user.userId
  );
  sendSuccess(res, subtask.toDTO());
});

const deleteSubtask = asyncHandler(async (req, res) => {
  const subtask = await subtaskService.softDeleteSubtask(
    req.params.id,
    req.user.userId
  );
  sendSuccess(res, subtask.toDTO());
});

module.exports = {
  getSubtask,
  getSubtasksByParentTask,
  createSubtask,
  updateSubtask,
  updateSubtaskStatus,
  deleteSubtask,
};
