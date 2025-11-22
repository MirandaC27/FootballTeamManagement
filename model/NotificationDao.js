
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {type: String, 
          required: true},
          
  matchId: {type: mongoose.Schema.Types.ObjectId, 
            ref: "match", required: true },

  message: {type: String, 
            required: true },

  timestamp: {type: Date, 
              default: Date.now },
});

const Notification = mongoose.model("notification", notificationSchema);

async function createNotification(matchId, message, title, timestamp) {
  const notif = new Notification({ matchId, message, title, timestamp });
  return await notif.save();
}

async function getAllNotifications() {
  return await Notification.find().sort({ timestamp: -1 });
}


module.exports = { 
  createNotification, 
  getAllNotifications,              
};
