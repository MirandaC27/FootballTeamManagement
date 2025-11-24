// NotificationDailyRunner.test.js
const EventDao = require('./model/EventDao');
const NotificationDao = require('./model/NotificationDao');
const { generateDailyEventNotifications } = require('./NotificationDailyRunner');

// Mock DAOs
jest.mock('./model/EventDao', () => ({
  eventModel: { find: jest.fn() }
}));

jest.mock('./model/NotificationDao', () => ({
  findNotificationByTitleAndDate: jest.fn(),
  createNotification: jest.fn()
}));

describe('NotificationDailyRunner', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("generateDailyEventNotifications creates notifications for today's events", async () => {
        const today = new Date();
        const mockEvents = [
            { _id: '1', title: 'Match vs Team A', tag: 'match', location: 'Stadium A', eventDate: today },
            { _id: '2', title: 'Training Session', tag: 'training', location: 'Field B', eventDate: today },
        ];

        EventDao.eventModel.find.mockResolvedValue(mockEvents);
        NotificationDao.findNotificationByTitleAndDate.mockResolvedValue(null);
        NotificationDao.createNotification.mockResolvedValue(true);

        await generateDailyEventNotifications();

        expect(EventDao.eventModel.find).toHaveBeenCalled();
        expect(NotificationDao.findNotificationByTitleAndDate).toHaveBeenCalledTimes(2);
        expect(NotificationDao.createNotification).toHaveBeenCalledTimes(2);
    });

    test("does not create notifications if events list is empty", async () => {
        EventDao.eventModel.find.mockResolvedValue([]);
        NotificationDao.findNotificationByTitleAndDate.mockResolvedValue(null);
        NotificationDao.createNotification.mockResolvedValue(true);

        await generateDailyEventNotifications();

        expect(EventDao.eventModel.find).toHaveBeenCalled();
        expect(NotificationDao.findNotificationByTitleAndDate).not.toHaveBeenCalled();
        expect(NotificationDao.createNotification).not.toHaveBeenCalled();
    });

    test("skips creating notification if one already exists today", async () => {
        const today = new Date();
        const mockEvents = [
            { _id: '1', title: 'Match vs Team B', tag: 'match', location: 'Stadium C', eventDate: today }
        ];

        EventDao.eventModel.find.mockResolvedValue(mockEvents);
        NotificationDao.findNotificationByTitleAndDate.mockResolvedValue({ _id: 'existing' });
        NotificationDao.createNotification.mockResolvedValue(true);

        await generateDailyEventNotifications();

        expect(NotificationDao.findNotificationByTitleAndDate).toHaveBeenCalled();
        expect(NotificationDao.createNotification).not.toHaveBeenCalled();
    });
});
