const NotificationDao = require("../model/NotificationDao");

async function getNotifications(req, res) {
    try {
        const list = await NotificationDao.getAllNotifications();
        console.log("NOTIFICATIONS:", list);
        res.json(list);
    } catch (err) {
        console.error("Error loading notifications:", err);
        res.status(500).send("Error loading notifications");
    }
}

async function markNotificationRead(req, res) {
    try {
        const { id } = req.params;
        const updated = await NotificationDao.markAsRead(id);

        if (!updated) {
            return res.status(404).send("Notification not found");
        }

        res.json(updated);
    } catch (err) {
        console.error("Error marking read:", err);
        res.status(500).send("Error marking read");
    }
}

module.exports = {
    getNotifications,
    markNotificationRead
};
