
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


/** Create a notification */
async function createNotification({ matchId=null, eventId=null, title, message }) {
  return await Notification.create({ matchId, eventId, title, message, timestamp: new Date() });
}

/** Get all notifications */
async function getAllNotifications() {
  return Notification.find().sort({ timestamp: -1 });
}

/** Get notifications that occurred today */
async function getTodaysNotifications() {
  const start = new Date();
  start.setHours(0,0,0,0);

  const end = new Date();
  end.setHours(23,59,59,999);

  return Notification.find({ timestamp: { $gte: start, $lte: end }}).sort({ timestamp: -1 });
}

module.exports = {
  Notification,
  createNotification,
  getAllNotifications,
  getTodaysNotifications
};