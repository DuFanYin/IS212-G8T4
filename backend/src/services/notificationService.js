const Notification = require('../db/models/Notification');

exports.createNotification = async ({ userId, message, link, type }) => {
  return await Notification.create({
    userId, 
    message,
    link,
    type,
    read: false,
    createdAt: new Date(),
  });
};
