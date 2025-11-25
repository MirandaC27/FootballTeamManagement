// NotificationDao.test.js
const dbcon = require('./DbConnection');
const dao = require('./NotificationDao');

beforeAll(async () => {
    await dbcon.connect("test");
});

afterAll(async () => {
    await dao.Notification.deleteMany({});
    await dbcon.disconnect();
});

beforeEach(async () => {
    await dao.Notification.deleteMany({});
});

//create tests

test("Create new notification (title and message required)", async () => {
    const created = await dao.createNotification({
        title: "New Match Notification",
        message: "Match starting soon!"
    });

    const found = await dao.Notification.findById(created._id);

    expect(created._id).not.toBeNull();
    expect(found.title).toBe("New Match Notification");
    expect(found.message).toBe("Match starting soon!");
});

test("Create fails with missing title", async () => {
    expect.assertions(1);
    try {
        await dao.createNotification({
            message: "Missing title"
        });
    } catch (err) {
        expect(err.name).toBe("ValidationError");
    }
});

test("Create fails with missing message", async () => {
    expect.assertions(1);
    try {
        await dao.createNotification({
            title: "No Message"
        });
    } catch (err) {
        expect(err.name).toBe("ValidationError");
    }
});

test("Timestamp defaults to now", async () => {
    const before = Date.now();

    const created = await dao.createNotification({
        title: "Timestamp Test",
        message: "Testing timestamps"
    });

    const found = await dao.Notification.findById(created._id);
    expect(found.timestamp.getTime()).toBeGreaterThanOrEqual(before);
});

//get notification tests
test("getAllNotifications returns notifications sorted DESC", async () => {
    const n1 = await dao.Notification.create({
        title: "Oldest",
        message: "Old message",
        timestamp: new Date("2024-01-01")
    });

    const n2 = await dao.Notification.create({
        title: "Middle",
        message: "Mid message",
        timestamp: new Date("2024-02-01")
    });

    const n3 = await dao.Notification.create({
        title: "Newest",
        message: "New message",
        timestamp: new Date("2024-03-01")
    });

    const results = await dao.getAllNotifications();

    expect(results.length).toBe(3);
    expect(results[0]._id.toString()).toBe(n3._id.toString());
    expect(results[1]._id.toString()).toBe(n2._id.toString());
    expect(results[2]._id.toString()).toBe(n1._id.toString());
});

test("getAllNotifications returns empty array when no notifications exist", async () => {
    const results = await dao.getAllNotifications();
    expect(results).toEqual([]);
});

//get todays notification tests
test("getTodaysNotifications returns notifications from today only", async () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const nToday = await dao.Notification.create({
        title: "Today",
        message: "Today's event",
        timestamp: today
    });

    await dao.Notification.create({
        title: "Yesterday",
        message: "Old event",
        timestamp: yesterday
    });

    const results = await dao.getTodaysNotifications();

    expect(results.length).toBe(1);
    expect(results[0]._id.toString()).toBe(nToday._id.toString());
});

test("getTodaysNotifications returns empty when nothing matches today's date", async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await dao.Notification.create({
        title: "Old",
        message: "Not today",
        timestamp: yesterday
    });

    const results = await dao.getTodaysNotifications();
    expect(results).toEqual([]);
});
