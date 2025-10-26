const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Handles POST /api/notifications (from page.tsx to create a notification)
router.post('/', authMiddleware, notificationController.createNotification);

// Handles GET /api/notifications (from header.tsx to fetch notifications)
router.get('/', authMiddleware, notificationController.getNotificationsForUser);

module.exports = router;
