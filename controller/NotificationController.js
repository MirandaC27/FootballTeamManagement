const NotificationDao = require("../model/NotificationDao");

async function getAll(req, res) {
  const list = await NotificationDao.getAllNotifications();
  res.json(list);
}

async function getToday(req, res) {
  const list = await NotificationDao.getTodaysNotifications();
  res.json(list);
}

module.exports = {
  getAll,
  getToday
};
