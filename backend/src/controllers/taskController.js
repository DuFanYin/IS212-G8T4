const TaskService = require('../services/taskService');


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
