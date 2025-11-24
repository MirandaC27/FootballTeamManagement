
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {type: String, 
          required: true},
          
  matchId: {type: mongoose.Schema.Types.ObjectId, 
            ref: "match", 
            required: false 
  },

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "event",
    required: false
  },

  message: {type: String, 
            required: true },

  timestamp: {type: Date, 
              default: Date.now },
});

const Notification = mongoose.model("notification", notificationSchema);

async function createNotification(matchId, eventId, message, title, timestamp) {
  const notif = new Notification({ matchId, eventId, message, title, timestamp });
  return await notif.save();
}

async function getAllNotifications() {
  return await Notification.find().sort({ timestamp: -1 });
}

async function getNotificationsBetween(start, end) {
  return await Notification
    .find({ timestamp: { $gte: start, $lt: end } })
    .sort({ timestamp: -1 });
}


async function findNotificationByTitleAndDate(title, start, end) {
    return Notification.findOne({ title, timestamp: { $gte: start, $lt: end } });
}

module.exports = {
  Notification, 
  createNotification, 
  getAllNotifications,
  getNotificationsBetween,
  findNotificationByTitleAndDate              
};
