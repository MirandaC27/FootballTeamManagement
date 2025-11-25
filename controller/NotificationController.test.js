const controller = require("./NotificationController");
const NotificationDao = require("../model/NotificationDao");


jest.mock("../model/NotificationDao");

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
});

//getAll tests
test("Get all notifications successfully", async function () {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    const fakeList = [
        { _id: "1", title: "Match started!", message: "Team A vs Team B" },
        { _id: "2", title: "Event Today", message: "Practice at 5 PM" }
    ];

    NotificationDao.getAllNotifications.mockResolvedValue(fakeList);

    await controller.getAll(req, res);

    expect(NotificationDao.getAllNotifications).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(fakeList);
    expect(res.status).not.toHaveBeenCalled();
});


test("Get all notifications handles DAO error", async function () {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    NotificationDao.getAllNotifications.mockRejectedValue(new Error("DB Error"));

    await expect(controller.getAll(req, res)).rejects.toThrow("DB Error");

    expect(res.json).not.toHaveBeenCalled();
});


//getToday tests
test("Get today's notifications successfully", async function () {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    const fakeTodaysList = [
        { _id: "10", title: "Event Today", message: "Practice at Loyola" }
    ];

    NotificationDao.getTodaysNotifications.mockResolvedValue(fakeTodaysList);

    await controller.getToday(req, res);

    expect(NotificationDao.getTodaysNotifications).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(fakeTodaysList);
    expect(res.status).not.toHaveBeenCalled();
});

test("Get today's notifications handles DAO error", async function () {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    NotificationDao.getTodaysNotifications.mockRejectedValue(new Error("Today error"));

    await expect(controller.getToday(req, res)).rejects.toThrow("Today error");

    expect(res.json).not.toHaveBeenCalled();
});
