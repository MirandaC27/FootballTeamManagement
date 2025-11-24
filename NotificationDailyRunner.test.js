// NotificationDailyRunner.test.js
const EventDao = require('./model/EventDao');
const NotificationDao = require('./model/NotificationDao');
const { generateDailyEventNotifications, startDailyRunner } = require('./NotificationDailyRunner');

// Correct DAO mocks
jest.mock('./model/EventDao', () => ({
  find: jest.fn()
}));

jest.mock('./model/NotificationDao', () => ({
  findNotificationByTitleAndDate: jest.fn(),
  createNotification: jest.fn()
}));

// mock generateDailyEventNotifications separately for startDailyRunner tests
jest.mock('./NotificationDailyRunner', () => {
  const original = jest.requireActual('./NotificationDailyRunner');
  return {
    ...original,
    generateDailyEventNotifications: jest.fn()
  };
});

describe("NotificationDailyRunner.generateDailyEventNotifications", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates notifications for today's events", async () => {
    const today = new Date();

    const mockEvents = [
      { _id: '1', title: 'Practice', tag: 'practice', location: 'Field A', eventDate: today },
      { _id: '2', title: 'Match vs Team A', tag: 'match', location: 'Stadium A', eventDate: today },
    ];

    EventDao.find.mockResolvedValue(mockEvents);
    NotificationDao.findNotificationByTitleAndDate.mockResolvedValue(null);
    NotificationDao.createNotification.mockResolvedValue({});

    await generateDailyEventNotifications();

    expect(EventDao.find).toHaveBeenCalledTimes(1);
    expect(NotificationDao.findNotificationByTitleAndDate).toHaveBeenCalledTimes(2);
    expect(NotificationDao.createNotification).toHaveBeenCalledTimes(2);

    // verify formatted message + title
    expect(NotificationDao.createNotification.mock.calls[0][2]).toBe("You have a practice today at Field A.");
    expect(NotificationDao.createNotification.mock.calls[0][3]).toBe("Event Today: Practice");
  });

  test("does not create notifications when no events today", async () => {
    EventDao.find.mockResolvedValue([]);

    await generateDailyEventNotifications();

    expect(EventDao.find).toHaveBeenCalledTimes(1);
    expect(NotificationDao.findNotificationByTitleAndDate).not.toHaveBeenCalled();
    expect(NotificationDao.createNotification).not.toHaveBeenCalled();
  });

  test("does not create notification if one already exists for the day", async () => {
    const today = new Date();
    const mockEvents = [
      { _id: '1', title: 'Match vs Team B', tag: 'match', location: 'Stadium C', eventDate: today }
    ];

    EventDao.find.mockResolvedValue(mockEvents);
    NotificationDao.findNotificationByTitleAndDate.mockResolvedValue({ _id: 'existing' });

    await generateDailyEventNotifications();

    expect(NotificationDao.findNotificationByTitleAndDate).toHaveBeenCalledTimes(1);
    expect(NotificationDao.createNotification).not.toHaveBeenCalled();
  });

  test("handles errors gracefully without throwing", async () => {
    EventDao.find.mockRejectedValue(new Error("DB failure"));

    await expect(generateDailyEventNotifications()).resolves.not.toThrow();
  });
});

describe("NotificationDailyRunner.startDailyRunner", () => {

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("startDailyRunner triggers immediate generation and schedules future executions", () => {
    startDailyRunner();

    expect(generateDailyEventNotifications).toHaveBeenCalledTimes(1);

    // simulate reaching the timeout (midnight)
    jest.runOnlyPendingTimers();

    // should run again
    expect(generateDailyEventNotifications).toHaveBeenCalledTimes(2);

    // simulate 24 hours passing (interval)
    jest.advanceTimersByTime(24 * 60 * 60 * 1000);

    // should run a third time
    expect(generateDailyEventNotifications).toHaveBeenCalledTimes(3);
  });

});
