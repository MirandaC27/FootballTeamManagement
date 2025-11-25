const controller = require("./EventController");
const dao = require("../model/EventDao");
const calendarArray = require("../CalendarConfig");
const NotificationDao = require("../model/NotificationDao");

// Mock DAOs
jest.mock("../model/EventDao");
jest.mock("../CalendarConfig");
jest.mock("../model/NotificationDao", () => ({
  createNotification: jest.fn(),
  Notification: { findOne: jest.fn() }
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

//create event tests
test("Fail: create empty event", async () => {
  const req = { body: {} };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

  await controller.createNewEvent(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.send).toHaveBeenCalledWith(
    "date, title, tag, location, location coordinates, startTime, and endTime are required"
  );
});

test("Fail: missing startTime", async () => {
  const req = {
    body: {
      eventDate: "2025-10-24",
      title: "Game Day",
      tag: "match",
      location: "Field A",
      locationCoords: [1, 2],
      endTime: "15:00"
    }
  };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  await controller.createNewEvent(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
});

test("Fail: invalid tag", async () => {
  const req = {
    body: {
      eventDate: "2025-10-24",
      title: "Invalid",
      tag: "holiday",
      location: "Field A",
      locationCoords: [1, 2],
      startTime: "10:00",
      endTime: "11:00"
    }
  };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  await controller.createNewEvent(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.send).toHaveBeenCalledWith("Invalid tag. Must be practice, match, or event.");
});

test("Success: create event (not same-day)", async () => {
  const req = {
    body: {
      eventDate: "2025-12-24",
      title: "Finals",
      tag: "match",
      location: "Stadium",
      locationCoords: [11, 22],
      startTime: "10:00",
      endTime: "12:00"
    }
  };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };

  dao.create.mockResolvedValue({ _id: "E1" });

  await controller.createNewEvent(req, res);

  expect(dao.create).toHaveBeenCalledWith({
    eventDate: new Date("2025-12-24T00:00:00"),
    title: "Finals",
    tag: "match",
    location: "Stadium",
    locationCoords: [11, 22],
    startTime: "10:00",
    endTime: "12:00"
  });

  expect(NotificationDao.createNotification).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
});

test("Success: same-day event triggers notification", async () => {
  const today = new Date().toISOString().split("T")[0];

  const req = {
    body: {
      eventDate: today,
      title: "Today Practice",
      tag: "practice",
      location: "Gym",
      locationCoords: [5, 10],
      startTime: "09:00",
      endTime: "10:00"
    }
  };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };

  dao.create.mockResolvedValue({ _id: "E22", title: "Today Practice", tag: "practice", location: "Gym" });

  await controller.createNewEvent(req, res);

  expect(NotificationDao.createNotification).toHaveBeenCalledWith({
    eventId: "E22",
    title: "Event Today: Today Practice",
    message: "You have a practice today at Gym."
  });
});


//delete event test
test("Delete success", async () => {
  const req = { params: { id: "123" } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  dao.eventModel = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: "123" }) };

  await controller.deleteEvent(req, res);

  expect(res.json).toHaveBeenCalledWith({ message: "Event deleted successfully" });
});

test("Delete not found", async () => {
  const req = { params: { id: "999" } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  dao.eventModel = { findByIdAndDelete: jest.fn().mockResolvedValue(null) };

  await controller.deleteEvent(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
});

//Update event tests

test("Update success with full data", async () => {
  const req = {
    params: { id: "123" },
    body: {
      eventDate: "2025-05-01",
      title: "Updated",
      tag: "event",
      location: "Hall",
      locationCoords: [1, 1],
      startTime: "08:00",
      endTime: "09:00"
    }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  const updatedEvent = {
    _id: "123",
    eventDate: new Date("2025-05-01T00:00:00"),
    title: "Updated",
    tag: "event",
    location: "Hall",
    locationCoords: [1, 1]
  };

  dao.update.mockResolvedValue(updatedEvent);

  await controller.updateEvent(req, res);

  expect(dao.update).toHaveBeenCalledWith("123", {
    eventDate: new Date("2025-05-01T00:00:00"),
    title: "Updated",
    tag: "event",
    location: "Hall",
    locationCoords: [1, 1],
    startTime: "08:00",
    endTime: "09:00"
  });

  expect(res.json).toHaveBeenCalledWith({
    message: "Event updated successfully",
    updated: updatedEvent
  });
});

test("Fail update: invalid tag", async () => {
  const req = { params: { id: "1" }, body: { tag: "holiday" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await controller.updateEvent(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ message: "Invalid tag." });
});

test("Fail update: event not found", async () => {
  const req = { params: { id: "XX" }, body: { title: "Nothing" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  dao.update.mockResolvedValue(null);

  await controller.updateEvent(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
});

test("Success: same-day update creates notification if not exists", async () => {
  const today = new Date();
  const req = {
    params: { id: "123" },
    body: { eventDate: today.toISOString().split("T")[0], title: "Update", tag: "match", location: "Field" }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  const updated = {
    _id: "123",
    eventDate: today,
    title: "Update",
    tag: "match",
    location: "Field"
  };

  dao.update.mockResolvedValue(updated);
  NotificationDao.Notification.findOne.mockResolvedValue(null);

  await controller.updateEvent(req, res);

  expect(NotificationDao.createNotification).toHaveBeenCalledWith({
    eventId: "123",
    title: "Event Today: Update",
    message: "You have a match today at Field."
  });
});

//event location tests
test("Get event location coords success", async () => {
  const req = { params: { id: "123" } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

  const coords = { _id: "123", locationCoords: [10, 20] };
  dao.eventModel = { findById: jest.fn().mockResolvedValue(coords) };

  await controller.getEventLocationCoords(req, res);

  expect(res.json).toHaveBeenCalledWith(coords);
});

test("Get event location coords fails", async () => {
  const req = { params: { id: "123" } };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  dao.eventModel = { findById: jest.fn().mockRejectedValue(new Error()) };

  await controller.getEventLocationCoords(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
});

//get calendar data tests

test("Get calendar data success", async () => {
  const req = { params: { year: "2025", month: "10" } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

  calendarArray.mockReturnValue({ year: 2025, monthName: "October", data: [] });

  dao.eventModel = {
    find: jest.fn().mockResolvedValue([
      { _id: "1", eventDate: "2025-10-05T00:00:00", title: "Event 1", tag: "practice" }
    ])
  };

  await controller.getCalendarData(req, res);

  expect(res.json).toHaveBeenCalled();
});

test("Get calendar data fails", async () => {
  const req = { params: { year: "2025", month: "10" } };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  calendarArray.mockReturnValue({ year: 2025, monthName: "October", data: [] });

  dao.eventModel = { find: jest.fn().mockRejectedValue(new Error()) };

  await controller.getCalendarData(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
});
