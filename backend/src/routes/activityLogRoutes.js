const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getActivityLogs);

module.exports = router;
