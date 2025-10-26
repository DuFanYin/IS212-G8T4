const Notification = require('../db/models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');

exports.createNotification = asyncHandler(async (req, res) => {
  const { userId, message, type, link } = req.body;

  const newNotification = await Notification.create({
    userId,
    message,
    type,
    link,
    read: false
  });

  sendSuccess(res, newNotification, 'Notification created', 201);
});

exports.getNotificationsForUser = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 });

  sendSuccess(res, notifications);
});
