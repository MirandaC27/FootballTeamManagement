// NotificationDailyRunner.test.js
const EventDao = require("./model/EventDao");
const NotificationDao = require("./model/NotificationDao");
const { generateDailyEventNotifications, startDailyRunner } = require("./NotificationDailyRunner");

// Mock Event DAO
jest.mock("./model/EventDao", () => ({
  eventModel: {
    find: jest.fn()
  }
}));

// Mock Notification DAO
jest.mock("./model/NotificationDao", () => ({
  Notification: { findOne: jest.fn() },
  createNotification: jest.fn()
}));

// Separate mock for generateDailyEventNotifications used by startDailyRunner
jest.mock("./NotificationDailyRunner", () => {
  const original = jest.requireActual("./NotificationDailyRunner");
  return {
    ...original,
    generateDailyEventNotifications: jest.fn()
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

/*
* generateDailyEventNotificaiton tests
*/
test("generateDailyEventNotifications  no events today (early return)", async () => {
  EventDao.eventModel.find.mockResolvedValue([]);

  const { generateDailyEventNotifications: realFn } = jest.requireActual("./NotificationDailyRunner");
  await realFn();

  expect(EventDao.eventModel.find).toHaveBeenCalledTimes(1);
  expect(NotificationDao.Notification.findOne).not.toHaveBeenCalled();
  expect(NotificationDao.createNotification).not.toHaveBeenCalled();
});


test("generateDailyEventNotifications  creates notifications for all events", async () => {
  const today = new Date();
  const mockEvents = [
    { _id: "A", title: "Practice", tag: "practice", location: "Gym", eventDate: today },
    { _id: "B", title: "Match", tag: "match", location: "Field", eventDate: today }
  ];

  EventDao.eventModel.find.mockResolvedValue(mockEvents);
  NotificationDao.Notification.findOne.mockResolvedValue(null);
  NotificationDao.createNotification.mockResolvedValue({});

  const { generateDailyEventNotifications: realFn } = jest.requireActual("./NotificationDailyRunner");
  await realFn();

  expect(NotificationDao.Notification.findOne).toHaveBeenCalledTimes(2);
  expect(NotificationDao.createNotification).toHaveBeenCalledTimes(2);

  expect(NotificationDao.createNotification.mock.calls[0][0]).toEqual({
    eventId: "A",
    title: "Event Today: Practice",
    message: "You have a practice today at Gym."
  });
});


test("generateDailyEventNotifications does NOT create when duplicate exists", async () => {
  const today = new Date();
  const event = { _id: "X", title: "Meeting", tag: "event", location: "HQ", eventDate: today };

  EventDao.eventModel.find.mockResolvedValue([event]);
  NotificationDao.Notification.findOne.mockResolvedValue({ _id: "existing" });

  const { generateDailyEventNotifications: realFn } = jest.requireActual("./NotificationDailyRunner");
  await realFn();

  expect(NotificationDao.Notification.findOne).toHaveBeenCalledTimes(1);
  expect(NotificationDao.createNotification).not.toHaveBeenCalled();
});


test("generateDailyEventNotifications skips some events and creates others", async () => {
  const today = new Date();
  const mockEvents = [
    { _id: "1", title: "Morning Run", tag: "practice", location: "Track", eventDate: today },
    { _id: "2", title: "Scrimmage", tag: "match", location: "Stadium", eventDate: today }
  ];

  EventDao.eventModel.find.mockResolvedValue(mockEvents);

  // First event already has a notification
  NotificationDao.Notification.findOne
    .mockResolvedValueOnce({ _id: "existing" })
    .mockResolvedValueOnce(null);

  NotificationDao.createNotification.mockResolvedValue({});

  const { generateDailyEventNotifications: realFn } = jest.requireActual("./NotificationDailyRunner");
  await realFn();

  expect(NotificationDao.Notification.findOne).toHaveBeenCalledTimes(2);
  expect(NotificationDao.createNotification).toHaveBeenCalledTimes(1);

  expect(NotificationDao.createNotification.mock.calls[0][0]).toEqual({
    eventId: "2",
    title: "Event Today: Scrimmage",
    message: "You have a match today at Stadium."
  });
});


test("generateDailyEventNotifications handles find failure gracefully", async () => {
  EventDao.eventModel.find.mockRejectedValue(new Error("DB error"));

  const { generateDailyEventNotifications: realFn } = jest.requireActual("./NotificationDailyRunner");

  await expect(realFn()).resolves.not.toThrow();
});


test("generateDailyEventNotifications continues after per-event error", async () => {
  const today = new Date();
  const events = [
    { _id: "1", title: "One", tag: "practice", location: "Field", eventDate: today },
    { _id: "2", title: "Two", tag: "match", location: "Arena", eventDate: today }
  ];

  EventDao.eventModel.find.mockResolvedValue(events);

  // First event errors, second succeeds
  NotificationDao.Notification.findOne
    .mockRejectedValueOnce(new Error("Event error"))
    .mockResolvedValueOnce(null);

  NotificationDao.createNotification.mockResolvedValue({});

  const { generateDailyEventNotifications: realFn } = jest.requireActual("./NotificationDailyRunner");
  await realFn();

  expect(NotificationDao.createNotification).toHaveBeenCalledTimes(1);
});

/*
* startDailyRunner tests
*/
//immediate call test
test("startDailyRunner calls generateDailyEventNotifications once immediately", () => {
  startDailyRunner();
  expect(generateDailyEventNotifications).toHaveBeenCalledTimes(1);
});

//scheduled server timeout
test("startDailyRunner schedules timeout for midnight", () => {
  startDailyRunner();
  expect(jest.getTimerCount()).toBeGreaterThan(0);
});

//runs again after timeout
test("startDailyRunner runs again after midnight timeout", () => {
  startDailyRunner();

  jest.runOnlyPendingTimers(); // Simulate midnight

  expect(generateDailyEventNotifications).toHaveBeenCalledTimes(2);
});

//starts the runner daily
test("startDailyRunner daily interval triggers execution", () => {
  startDailyRunner();

  jest.runOnlyPendingTimers(); // Midnight timeout

  jest.advanceTimersByTime(24 * 60 * 60 * 1000); // 24 hours

  expect(generateDailyEventNotifications).toHaveBeenCalledTimes(3);
});

//no duplicate intervals
test("startDailyRunner ensures only one repeating interval exists", () => {
  startDailyRunner();
  jest.runOnlyPendingTimers(); // Midnight

  const initialCount = jest.getTimerCount();

  jest.advanceTimersByTime(24 * 60 * 60 * 1000);
  jest.advanceTimersByTime(24 * 60 * 60 * 1000);

  const finalCount = jest.getTimerCount();

  expect(finalCount).toBe(initialCount);
});
