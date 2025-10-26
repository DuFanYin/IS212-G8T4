const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/logs/ - Get all activity logs (requires authentication)
router.get('/', authMiddleware, getActivityLogs);

// POST /api/logs/ - Get activity logs with resourceId filter
router.post('/', authMiddleware, getActivityLogs);

module.exports = router;
