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

module.exports = {
    getNotifications
};
