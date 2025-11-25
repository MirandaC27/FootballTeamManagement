const NotificationDao = require("../model/NotificationDao");

/**
 * get all notifications in database via NotificationDao
 * @returns all notifications sorted by time
 */
async function getAll(req, res) {
  const list = await NotificationDao.getAllNotifications();
  res.json(list);
}

/**
 * get all of today's notifications in database via NotificationDao
 * @returns all notifications today sorted by time
 */
async function getToday(req, res) {
  const list = await NotificationDao.getTodaysNotifications();
  res.json(list);
}

module.exports = {
  getAll,
  getToday
};
