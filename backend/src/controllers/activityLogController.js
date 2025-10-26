const activityLogService = require('../services/activityLogService');

const getActivityLogs = async (req, res) => {
  try{
    // Support both query params (GET) and body params (POST)
    const resourceId = req.query.resourceId || req.body.resourceId;

    const filters = {};
    if (resourceId) filters.taskId = resourceId;

    const activityLogs = await activityLogService.getAllActivityLogs(filters);

    res.json({
      status: "success",
      data: activityLogs,
      message: "Activity Logs is successfully retrieved"
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
}

module.exports = {
    getActivityLogs
}

