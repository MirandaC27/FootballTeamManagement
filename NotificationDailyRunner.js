// NotificationDailyRunner.js
const EventDao = require("./model/EventDao");
const NotificationDao = require("./model/NotificationDao");

/**
 * generate event notificaitons for all events for one day
 */
async function generateDailyEventNotifications() {
  try {
    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    // Get today's events
    const eventsToday = await EventDao.eventModel.find({
      eventDate: { $gte: start, $lte: end }
    });

    console.log(`[DailyRunner] Events today: ${eventsToday.length}`);

    if (!eventsToday.length) return;

    for (const event of eventsToday) {

      // Prevent duplicates by checking if notification already exists today
      const alreadyExists = await NotificationDao.Notification.findOne({
        eventId: event._id,
        timestamp: { $gte: start, $lte: end }
      });

      if (alreadyExists) continue;

      // Create simplified notification
      await NotificationDao.createNotification({
        eventId: event._id,
        title: `Event Today: ${event.title}`,
        message: `You have a ${event.tag} today at ${event.location}.`
      });

      console.log(`[DailyRunner] Notification created for event: ${event.title}`);
    }
  } catch (err) {
    console.error("[DailyRunner] Error:", err);
  }
}

/**
 * start daily runner at midnight that gets all events that day and generates notifications for all of them
 */
function startDailyRunner() {
  console.log("[DailyRunner] Started.");

  // Run immediately at server start
  generateDailyEventNotifications();

  // Calculate time until next midnight
  const now = new Date();
  const millisUntilMidnight =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;

  // Schedule future runs
  setTimeout(() => {
    generateDailyEventNotifications();
    setInterval(generateDailyEventNotifications, 24 * 60 * 60 * 1000);
  }, millisUntilMidnight);
}

module.exports = {
  startDailyRunner,
  generateDailyEventNotifications
};
