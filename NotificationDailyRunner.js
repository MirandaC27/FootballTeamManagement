// NotificationDailyRunner.js
const Event = require("./model/EventDao").eventModel;
const NotificationDao = require("./model/NotificationDao");

async function generateDailyEventNotifications() {
    try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);


        const eventsToday = await Event.find({
            eventDate: { $gte: start, $lt: end }
        });

        if (eventsToday.length === 0) return;

        for (const event of eventsToday) {
            const title = `Event Today: ${event.title}`;
            const message = `You have a ${event.tag} today at ${event.location}.`;


            const exists = await NotificationDao.findNotificationByTitleAndDate(title, start, end);

            if (!exists) {

                await NotificationDao.createNotification(
                    null,          
                    event._id,     
                    message,       
                    title,         
                    new Date()     
                );

                console.log(`Created notification for event: ${event.title}`);
            }
        }
    } catch (err) {
        console.error("Error generating daily event notifications:", err);
    }
}

async function startDailyRunner() {
    console.log("Daily Event Notification Runner started.");

    generateDailyEventNotifications();

    const now = new Date();
    const millisUntilMidnight =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;

    setTimeout(() => {
        generateDailyEventNotifications();
        setInterval(generateDailyEventNotifications, 24 * 60 * 60 * 1000);
    }, millisUntilMidnight);
}

module.exports = {
    startDailyRunner,
    generateDailyEventNotifications
};
