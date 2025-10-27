const TaskService = require('../services/taskService');
const path = require('path');
const multerMiddle = require('../middleware/attachmentMiddleware');
const multer = require('multer');
const fs = require("fs");
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const { ValidationError } = require('../utils/errors');

exports.createTask = asyncHandler(async (req, res) => {
  const task = await TaskService.createTask(req.body, req.user.userId);
  sendSuccess(res, task, null, 201);
});

exports.updateTask = asyncHandler(async (req, res) => {
  const task = await TaskService.updateTask(req.params.id, req.body, req.user.userId);
  sendSuccess(res, task);
});

exports.archiveTask = asyncHandler(async (req, res) => {
  const task = await TaskService.softDeleteTask(req.params.id, req.user.userId);
  sendSuccess(res, task);
});

exports.getUserTasks = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    sortBy: req.query.sortBy,
    order: req.query.order || 'asc'
  };
  const tasks = await TaskService.getUserTasks(req.user.userId, filters);
  sendSuccess(res, tasks);
});

exports.getProjectTasks = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    sortBy: req.query.sortBy,
    order: req.query.order || 'asc'
  };
  const tasks = await TaskService.getTasksByProject(req.params.projectId, req.user.userId, filters);
  sendSuccess(res, tasks);
});

exports.getTeamTasks = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    sortBy: req.query.sortBy,
    order: req.query.order || 'asc'
  };
  const tasks = await TaskService.getTasksByTeam(req.params.teamId, req.user.userId, filters);
  sendSuccess(res, tasks);
});

exports.getDepartmentTasks = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    sortBy: req.query.sortBy,
    order: req.query.order || 'asc'
  };
  const tasks = await TaskService.getTasksByDepartment(req.params.departmentId, req.user.userId, filters);
  sendSuccess(res, tasks);
});

exports.getTaskById = asyncHandler(async (req, res) => {
  const task = await TaskService.getById(req.params.id);
  const visible = await TaskService.isVisibleToUser(req.params.id, req.user.userId);
  if (!visible) return res.status(403).json({ status: 'error', message: 'Not authorized to view this task' });
  sendSuccess(res, task);
});

exports.assignTask = asyncHandler(async (req, res) => {
  const task = await TaskService.assignTask(req.params.id, req.body.assigneeId, req.user.userId);
  sendSuccess(res, task);
});

exports.updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await TaskService.updateTaskStatus(req.params.id, req.body.status, req.user.userId);
  sendSuccess(res, task);
});

exports.getUnassignedTasks = asyncHandler(async (req, res) => {
  const tasks = await TaskService.getUnassignedTasks(req.user.userId);
  sendSuccess(res, tasks);
});

exports.addAttachment = asyncHandler(async (req, res) => {
  multerMiddle.single('file')(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ status: 'error', message: 'File too large' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(415).json({ status: 'error', message: 'Unsupported file format' });
        }
        return res.status(400).json({ status: 'error', message: err.message });
      } else if (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }

      const taskId = req.params.id;
      const file = req.file;

      if (!file) {
        throw new ValidationError('No file uploaded');
      }

      const attachmentPath = path.relative(process.cwd(), file.path);
      const task = await TaskService.getById(taskId);

      if (!task) {
        throw new ValidationError('Task not found');
      }

      task.attachments.push({
        filename: file.originalname,
        path: attachmentPath,
        uploadedBy: req.user.userId,
        uploadedAt: new Date(),
      });

      const updatedTask = await TaskService.updateTask(taskId, { attachments: task.attachments }, req.user.userId);

      sendSuccess(res, updatedTask, 'Attachment added successfully', 201);
    } catch (err) {
      return res.status(500).json({ message: 'Error uploading attachment' });
    }
  });
});

exports.removeAttachment = asyncHandler(async (req, res) => {
  const { id: taskId, attachmentId } = req.params;
  const userId = req.user.userId;

  if (!attachmentId) {
    throw new ValidationError('Attachment not found');
  }

  const removedAttachment = await TaskService.removeAttachment(taskId, attachmentId, userId);
  const filePath = path.join(process.cwd(), removedAttachment.path);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  sendSuccess(res, null, 'Attachment removed');
});

exports.setTaskProjects = asyncHandler(async (req, res) => {
  const { projectIds } = req.body;
  const task = await TaskService.setTaskProjects(req.params.id, projectIds, req.user.userId);
  sendSuccess(res, task);
});
