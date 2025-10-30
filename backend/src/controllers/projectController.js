const ProjectService = require('../services/projectService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const { ValidationError } = require('../utils/errors');

const createProject = asyncHandler(async (req, res) => {
  const { name, deadline } = req.body;

  if (!name) {
    throw new ValidationError('Name is required');
  }

  if (deadline) {
    const deadlineDate = new Date(deadline);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (isNaN(deadlineDate.getTime())) {
      throw new ValidationError('Invalid date format');
    }
    if (deadlineDate < todayStart) {
      throw new ValidationError('Due date cannot be in the past');
    }
  }

  const userId = req.user.userId;
  const project = await ProjectService.createProject(req.body, userId);
  sendSuccess(res, project.toDTO());
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;
  const userId = req.user.userId;

  const updatedProject = await ProjectService.updateProject(projectId, updateData, userId);
  sendSuccess(res, updatedProject.toDTO());
});

const addCollaborators = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { collaboratorId } = req.body;
  const userId = req.user.userId;

  const updatedProject = await ProjectService.addCollaborator(projectId, collaboratorId, userId);
  sendSuccess(res, updatedProject.toDTO());
});

const removeCollaborators = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { collaboratorId } = req.body;
  const userId = req.user.userId;

  const updatedProject = await ProjectService.removeCollaborator(projectId, collaboratorId, userId);
  sendSuccess(res, updatedProject.toDTO());
});

const assignRole = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { collaboratorId, role } = req.body;
  const userId = req.user.userId;

  const updatedProject = await ProjectService.assignRoleToCollaborator(
    projectId,
    collaboratorId,
    role,
    userId
  );

  sendSuccess(res, updatedProject.toDTO(), 'Role assigned successfully');
});

const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const projects = await ProjectService.getVisibleProjectsForUser(userId);
  sendSuccess(res, projects, 'Project data is successfully retrieved');
});

const getProjectsByDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  const projects = await ProjectService.getProjectsByDepartment(departmentId);
  sendSuccess(res, projects, 'Project data is successfully retrieved');
});

const setStatusProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;
  const userId = req.user.userId;

  const updatedProject = await ProjectService.updateProject(projectId, updateData, userId);
  sendSuccess(res, updatedProject.toDTO());
});

async function getProjectProgress(req, res, next) {
  try {
    const userId = req.user?.userId;
    const stats = await ProjectService.getProjectProgress(req.params.projectId, userId);
    sendSuccess(res, stats);
  } catch (err) {
    const status = /not authorized/i.test(err.message) ? 403 : 400;
    return res.status(status).json({ status: 'error', message: err.message });
  }
}

async function getProjectStats(req, res, next) {
  try {
    const userId = req.user?.userId;
    const stats = await ProjectService.getProjectStats(req.params.projectId, userId);
    sendSuccess(res, stats);
  } catch (err) {
    const status = /not authorized/i.test(err.message) ? 403 : 400;
    return res.status(status).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectsByDepartment,
  updateProject,
  addCollaborators,
  removeCollaborators,
  setStatusProject,
  getProjectProgress,
  getProjectStats,
  assignRole
};
