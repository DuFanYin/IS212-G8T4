const Notification = require('../db/models/Notification');

exports.getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: notifications });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
