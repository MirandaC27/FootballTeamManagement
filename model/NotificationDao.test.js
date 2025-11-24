const dbcon = require('./DbConnection');
const dao = require('./NotificationDao');

//setup for all tests
beforeAll(async () => {
    await dbcon.connect('test');
});

afterAll(async () => {
    await dao.Notification.deleteMany({});
    await dbcon.disconnect();
});

beforeEach(async () => {
    await dao.Notification.deleteMany({});
});

/*
 * CREATE NOTIFICATION TESTS
 */

// create a notification with required fields only (title + message)
test('Create new notification with title and message', async () => {
    let created = await dao.createNotification(
        null,
        null,
        "Match starting soon!",
        "New Match Notification",
        new Date("2025-01-01T10:00:00")
    );

    let found = await dao.Notification.findById(created._id);

    expect(created._id).not.toBeNull();
    expect(found.title).toBe("New Match Notification");
    expect(found.message).toBe("Match starting soon!");
});

// fail to create notification with no title
test('Create fails with missing title', async () => {
    expect.assertions(1);
    try {
        await dao.createNotification(
            null,
            null,
            "Missing title here",
            null,
            new Date()
        );
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

// fail to create notification with no message
test('Create fails with missing message', async () => {
    expect.assertions(1);
    try {
        await dao.createNotification(
            null,
            null,
            null,
            "Missing message",
            new Date()
        );
    } catch (err) {
        expect(err.name).toBe('ValidationError');
    }
});

// timestamp defaults to now when not provided
test('Timestamp defaults to now', async () => {
    let created = await dao.createNotification(
        null,
        null,
        "Auto timestamp",
        "Timestamp Test"
    );

    let found = await dao.Notification.findById(created._id);
    expect(found.timestamp).not.toBeNull();
});

/*
 * GET ALL NOTIFICATIONS TESTS
 */

// return notifications sorted from newest to oldest
test('Get all notifications sorted by timestamp desc', async () => {
    const n1 = await dao.createNotification(null, null, "Message1", "Title1", new Date("2024-01-01"));
    const n2 = await dao.createNotification(null, null, "Message2", "Title2", new Date("2024-02-01"));
    const n3 = await dao.createNotification(null, null, "Message3", "Title3", new Date("2024-03-01"));

    let results = await dao.getAllNotifications();

    expect(results.length).toBe(3);
    expect(results[0]._id.toString()).toBe(n3._id.toString());
    expect(results[1]._id.toString()).toBe(n2._id.toString());
    expect(results[2]._id.toString()).toBe(n1._id.toString());
});

// returns empty array when no notifications
test('Get all notifications returns empty array when none exist', async () => {
    const results = await dao.getAllNotifications();
    expect(results).toEqual([]);
});

/*
 * getNotificationsBetween TESTS
 */

// returns notifications inside date range sorted desc
test('Get notifications between dates', async () => {
    const n1 = await dao.createNotification(null, null, "Message1", "Title1", new Date("2024-01-10"));
    const n2 = await dao.createNotification(null, null, "Message2", "Title2", new Date("2024-01-20"));
    const n3 = await dao.createNotification(null, null, "Message3", "Title3", new Date("2024-02-01"));

    let start = new Date("2024-01-01");
    let end = new Date("2024-02-01");

    let results = await dao.getNotificationsBetween(start, end);

    expect(results.length).toBe(2);
    expect(results[0]._id.toString()).toBe(n2._id.toString()); // newest first
    expect(results[1]._id.toString()).toBe(n1._id.toString());
});

// returns empty array when no matches in range
test('Get notifications between returns empty when none match', async () => {
    let start = new Date("2024-05-01");
    let end = new Date("2024-06-01");

    let results = await dao.getNotificationsBetween(start, end);

    expect(results).toEqual([]);
});

/*
 * findNotificationByTitleAndDate TESTS
 */

// finds correct notification by title and date range
test('Find notification by title and date', async () => {
    const target = await dao.createNotification(
        null,
        null,
        "Special Msg",
        "Special Title",
        new Date("2024-09-15")
    );

    await dao.createNotification(null, null, "Other", "Other Title", new Date("2024-09-10"));

    let start = new Date("2024-09-01");
    let end = new Date("2024-09-30");

    let found = await dao.findNotificationByTitleAndDate("Special Title", start, end);

    expect(found).not.toBeNull();
    expect(found._id.toString()).toBe(target._id.toString());
});

// returns null when no match
test('Find notification returns null when not found', async () => {
    let start = new Date("2024-09-01");
    let end = new Date("2024-09-30");

    let found = await dao.findNotificationByTitleAndDate("Does Not Exist", start, end);

    expect(found).toBeNull();
});
