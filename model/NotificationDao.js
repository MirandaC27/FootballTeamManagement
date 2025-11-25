
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


/**
 * create a notification oject
 * @param {*} matchId id of the match, defaults to null
 * @param {*} eventId id of the event, defaults to null
 * @param {*} title title of notification
 * @param {*} message message of notification
 * @returns notification object
 */
async function createNotification({ matchId=null, eventId=null, title, message }) {
  return await Notification.create({ matchId, eventId, title, message, timestamp: new Date() });
}

/**
 * get all notifications in database
 * @returns all notifications sorted by time
 */
async function getAllNotifications() {
  return Notification.find().sort({ timestamp: -1 });
}

/**
 * get all notifications for the current day
 * @returns all notifications today sorted by time
 */
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