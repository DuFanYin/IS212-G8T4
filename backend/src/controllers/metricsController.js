const metricsService = require('../services/metricsService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');

exports.getDepartmentMetrics = asyncHandler(async (req, res) => {
  const metrics = await metricsService.getDepartmentMetrics(req.user.userId);
  sendSuccess(res, metrics);
});

exports.getTeamMetrics = asyncHandler(async (req, res) => {
  const metrics = await metricsService.getTeamMetrics(req.user.userId);
  sendSuccess(res, metrics);
});

exports.getPersonalMetrics = asyncHandler(async (req, res) => {
  const metrics = await metricsService.getPersonalMetrics(req.user.userId);
  sendSuccess(res, metrics);
});

exports.getSingleTeamMetrics = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const metrics = await metricsService.getSingleTeamMetrics(req.user.userId, teamId);
  sendSuccess(res, metrics);
});
