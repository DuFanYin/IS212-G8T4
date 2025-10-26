const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');

// POST /api/logs/  with { resourceId } in body
router.post('/', activityLogController.getActivityLogs);

module.exports = router;
