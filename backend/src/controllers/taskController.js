const TaskService = require('../services/taskService');
const path = require('path');
const multerMiddle = require('../middleware/attachmentMiddleware');
const multer = require('multer');
const fs = require("fs");

// Create a new task

exports.createTask = async (req, res) => {
  try {
    const task = await TaskService.createTask(req.body, req.user.userId);
    res.status(201).json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await TaskService.updateTask(req.params.id, req.body, req.user.userId);
    res.json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Archive (soft delete) a task
exports.archiveTask = async (req, res) => {
  try {
    const task = await TaskService.softDeleteTask(req.params.id, req.user.userId);
    res.json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Get user's tasks (role-based visibility)
exports.getUserTasks = async (req, res) => {
  try {
    const tasks = await TaskService.getUserTasks(req.user.userId);
    res.json({ status: 'success', data: tasks });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Get tasks by project
exports.getProjectTasks = async (req, res) => {
  try {
    const tasks = await TaskService.getTasksByProject(req.params.projectId, req.user.userId);
    res.json({ status: 'success', data: tasks });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Get tasks by team
exports.getTeamTasks = async (req, res) => {
  try {
    const tasks = await TaskService.getTasksByTeam(req.params.teamId, req.user.userId);
    res.json({ status: 'success', data: tasks });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Get tasks by department
exports.getDepartmentTasks = async (req, res) => {
  try {
    const tasks = await TaskService.getTasksByDepartment(req.params.departmentId, req.user.userId);
    res.json({ status: 'success', data: tasks });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await TaskService.getById(req.params.id);
    const visible = await TaskService.isVisibleToUser(req.params.id, req.user.userId);
    if (!visible) return res.status(403).json({ status: 'error', message: 'Not authorized to view this task' });

    res.json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Assign task to user
exports.assignTask = async (req, res) => {
  try {
    const task = await TaskService.assignTask(req.params.id, req.body.assigneeId, req.user.userId);
    res.json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await TaskService.updateTaskStatus(req.params.id, req.body.status, req.user.userId);
    res.json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Get all unassigned tasks
exports.getUnassignedTasks = async (req, res) => {
  try {
    const tasks = await TaskService.getUnassignedTasks(req.user.userId);
    res.json({ status: 'success', data: tasks });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.addAttachment = async (req, res) => {
  multerMiddle.single('file')(req, res, async (err) => {
    try {
      // Handle multer errors
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

      // Now multer succeeded, proceed with your original controller logic
      const taskId = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ status: 'error', message: 'No file uploaded' });
      }

      // Store relative path in DB (e.g., storage/<taskId>/<filename>)
      const attachmentPath = path.relative(process.cwd(), file.path);

      // Find the task first
      const task = await TaskService.getById(taskId);
      if (!task) {
        return res.status(404).json({ status: 'error', message: 'Task not found' });
      }

      // Add the attachment to the task
      task.attachments.push({
        filename: file.originalname,
        path: attachmentPath,
        uploadedBy: req.user.userId,
        uploadedAt: new Date(),
      });

      // Save or update task
      const updatedTask = await TaskService.updateTask(taskId, { attachments: task.attachments }, req.user.userId);

      res.status(201).json({
        status: 'success',
        message: 'Attachment added successfully',
        data: updatedTask,
      });
    } catch (err) {
      res.status(500).json({ message: 'Error uploading attachment' });
    }
  })
};

exports.removeAttachment = async (req, res) => {
  try {
    const { id: taskId, attachmentId } = req.params;
    const userId = req.user.userId;

    if (!attachmentId) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const removedAttachment = await TaskService.removeAttachment(taskId, attachmentId, userId);

    // Delete from disk
    const filePath = path.join(process.cwd(), removedAttachment.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ status: 'success', message: 'Attachment removed' });
  } catch (err) {
    // Permission / not found specific handling
    if (err.message.includes('Not authorized')) {
      return res.status(403).json({ status: 'error', message: err.message });
    }

    if (err.message.includes('Attachment not found')) {
      return res.status(404).json({ status: 'error', message: err.message });
    }

    // Fallback for unexpected errors
    return res.status(500).json({ status: 'error', message: 'Error removing attachment' });
  }
}

// Set task projects
exports.setTaskProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;
    const task = await TaskService.setTaskProjects(req.params.id, projectIds, req.user.userId);
    res.json({ status: 'success', data: task });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
