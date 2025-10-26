const activityLogService = require('../services/activityLogService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');

const getActivityLogs = asyncHandler(async (req, res) => {
  const resourceId = req.query.resourceId || req.body.resourceId;
  const filters = {};
  
  if (resourceId) {
    filters.taskId = resourceId;
  }

  const activityLogs = await activityLogService.getAllActivityLogs(filters);
  sendSuccess(res, activityLogs, 'Activity Logs is successfully retrieved');
});

module.exports = {
  getActivityLogs
};
