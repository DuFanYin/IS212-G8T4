const Notification = require('../db/models/Notification');

exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type, link } = req.body;

    const newNotification = await Notification.create({
      userId: userId, 
      message,
      type,
      link,
      read: false // Matches your 'Notification.js' model
    });

    console.log('✅ Backend: Notification created in DB:', newNotification);

    res.status(201).json({ 
      success: true, 
      message: 'Notification created',
      data: newNotification
    });

  } catch (error) {
    console.error('❌ /api/notifications POST Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create notification' 
    });
  }
};

exports.getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({ userId: userId }) // Matches your 'Notification.js' model
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: notifications });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};