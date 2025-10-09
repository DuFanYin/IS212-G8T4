const activityLogService = require('../services/activityLogService');

const getActivityLogs = async (req, res) => {
  try{
    const resourceId = req.body.resourceId;

    const filters = {};
    if (resourceId) filters.taskId = resourceId;

    const projects = await activityLogService.getAllActivityLogs(filters);

    res.json({
      status: "success",
      data: projects,
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

