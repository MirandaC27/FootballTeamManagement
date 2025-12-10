const controller = require('./EventController');
const dao = require('../model/EventDao');
const calendarArray = require('../model/CalendarConfig');
const NotificationDao = require("../model/NotificationDao");

// test setup
jest.mock('../model/EventDao');
jest.mock('../model/CalendarConfig');
jest.mock("../model/NotificationDao", () => ({
    createNotification: jest.fn(),
    Notification: { findOne: jest.fn() }
}));

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
});

/*
* create event tests
*/

// Fail to create an empty event without required fields
test('Create empty event', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Please make sure all fields are filled out');
});

// Fail to create an event without a date
test('Create an event without a date', async () => {
    const req = { body: { title: 'no date', tag: 'practice', location: 'Field', startTime: "10:00", endTime: "11:00" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Please make sure all fields are filled out');
});

// Fail to create an event without a title
test('Create an event without a title', async () => {
    const req = { body: { eventDate: '2025-10-24', tag: 'match', location: 'Field', startTime: "10:00", endTime: "11:00" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Please make sure all fields are filled out');
});

// Fail to create an event without a tag
test('Create an event without a tag', async () => {
    const req = { body: { eventDate: '2025-10-24', title: 'No Tag', location: "Field", startTime: "10:00", endTime: "11:00" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Please make sure all fields are filled out');
});

// Fail to create an event with invalid tag
test('Create an event with invalid tag', async () => {
    const req = { body: { 
        eventDate: '2025-10-24', 
        title: 'Invalid Tag', 
        tag: 'holiday',
        location: "Field",
        startTime: "10:00",
        endTime: "11:00"
    }};
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Invalid tag. Must be practice, match, or event.');
});

// Create new event successfully
test('Create new event successfully', async () => {
    const req = { body: { 
        eventDate: '2025-10-24',
        title: 'Final',
        tag: 'practice',
        location: "Field",
        locationCoords: [5, 10],
        startTime: "10:00",
        endTime: "11:00"
    }};
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.create.mockResolvedValue({ _id: "xyz" });

    await controller.createNewEvent(req, res);

    expect(dao.create).toHaveBeenCalledWith({
        eventDate: new Date('2025-10-24T00:00:00'),
        title: 'Final',
        tag: 'practice',
        location: 'Field',
        locationCoords: [5, 10],
        startTime: "10:00",
        endTime: "11:00"
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Event added successfully' });
});

// DAO error
test('Create new event with DAO error', async () => {
    const req = { body: { 
        eventDate: '2025-10-24',
        title: 'Semi',
        tag: 'match',
        location: "Field",
        startTime: "10:00",
        endTime: "11:00"
    }};
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.create.mockRejectedValue(new Error('DB Error'));

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not create event');
});

//bad time not in 24 hrs
test("Create event fails on invalid time format", async () => {
    const req = {
        body: {
            eventDate: "2025-10-24",
            title: "Bad Time",
            tag: "practice",
            location: "Field",
            startTime: "99:00",  
            endTime: "12:00"
        }
    };

    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Time must be in HH:MM (24-hour) format.");
});

//backwards time
test("Create event fails when endTime is earlier than startTime", async () => {
    const req = {
        body: {
            eventDate: "2025-10-24",
            title: "Backwards Time",
            tag: "practice",
            location: "Field",
            startTime: "12:00",
            endTime: "11:00"
        }
    };

    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("endTime must be later than startTime.");
});


/*
* delete event tests
*/

test('Delete event successfully', async () => {
    const req = { params: { id: '123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.eventModel = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '123' }) };

    await controller.deleteEvent(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Event deleted successfully' });
});

test('Delete event not found', async () => {
    const req = { params: { id: '999' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.eventModel = { findByIdAndDelete: jest.fn().mockResolvedValue(null) };

    await controller.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
});

test('Delete event with DAO error', async () => {
    const req = { params: { id: '123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.eventModel = { findByIdAndDelete: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting event' });
});

/*
* get all events
*/

test('Get all events successfully', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    const events = [
        { _id: 'm1', eventDate: '2025-10-24' },
        { _id: 'm2', eventDate: '2025-10-25' },
    ];
    dao.eventModel = { find: jest.fn().mockResolvedValue(events) };

    await controller.getAllEvents(req, res);

    expect(dao.eventModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(events);
});

test('Get all events with DAO error', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.eventModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getAllEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not get events');
});

test("Get event location coords with DAO error", async () => {
    const req = { params: { id: "123" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.eventModel = { findById: jest.fn().mockRejectedValue(new Error("DB error")) };

    await controller.getEventLocationCoords(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Could not get coordinates");
});


/*
* calendar data
*/

test('Get calendar data successfully', async () => {
    const req = { params: { year: '2025', month: '10' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    calendarArray.mockReturnValue({ year: 2025, monthName: 'October', data: [] });

    dao.eventModel = {
        find: jest.fn().mockResolvedValue([
            {
                _id: '1',
                eventDate: '2025-10-05T00:00:00',
                title: 'Event 1',
                tag: 'event',
                location: 'Loyola University Maryland',
                startTime: '11:00',
                endTime: '12:00'
            },
            {
                _id: '2',
                eventDate: '2025-09-30T00:00:00',
                title: 'Event 2'
            },
        ]),
    };

    await controller.getCalendarData(req, res);

    expect(calendarArray).toHaveBeenCalledWith(2025, 9);
    expect(res.json).toHaveBeenCalledWith({
        year: 2025,
        monthName: 'October',
        data: [],
        eventDays: [{
            day: 5,
            id: '1',
            title: 'Event 1',
            tag: 'event',
            location: 'Loyola University Maryland',
            startTime: '11:00',
            endTime: '12:00'
        }]
    });
});

test('Get calendar data with DAO error', async () => {
    const req = { params: { year: '2025', month: '10' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    calendarArray.mockReturnValue({ year: 2025, monthName: 'October', data: [] });
    dao.eventModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getCalendarData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error getting calendar data');
});

test("Get calendar data returns empty eventDays when no events match month", async () => {
    const req = { params: { year: "2025", month: "10" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    calendarArray.mockReturnValue({ year: 2025, monthName: "October", data: [] });

    dao.eventModel = {
        find: jest.fn().mockResolvedValue([
            { _id: "1", eventDate: "2025-11-01T00:00:00", title: "Wrong Month" }
        ])
    };

    await controller.getCalendarData(req, res);

    expect(res.json).toHaveBeenCalledWith({
        year: 2025,
        monthName: "October",
        data: [],
        eventDays: []
    });
});


/*
* update tests
*/

test('Update existing event successfully with tag', async () => {
    const req = {
        params: { id: '123' },
        body: { 
            eventDate: '2025-10-25',
            title: 'Updated Title',
            tag: 'match',
            startTime: "10:00",
            endTime: "11:00"
        }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const updatedEvent = { 
        _id: '123',
        eventDate: new Date('2025-10-25T00:00:00'),
        title: 'Updated Title',
        tag: 'match'
    };

    dao.update = jest.fn().mockResolvedValue(updatedEvent);

    await controller.updateEvent(req, res);

    expect(dao.update).toHaveBeenCalledWith('123', {
        eventDate: new Date('2025-10-25T00:00:00'),
        title: 'Updated Title',
        tag: 'match',
        startTime: "10:00",
        endTime: "11:00"
    });

    expect(res.json).toHaveBeenCalledWith({
        message: 'Event updated successfully',
        updated: updatedEvent
    });
});

test('Update event not found', async () => {
    const req = {
        params: { id: '999' },
        body: { title: 'Does not exist' }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.update = jest.fn().mockResolvedValue(null);

    await controller.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
});


test('Update event with DAO error', async () => {
    const req = {
        params: { id: '123' },
        body: { title: 'Should fail' }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.update = jest.fn().mockRejectedValue(new Error('DB Error'));

    await controller.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error while updating event' });
});

test('Update event with invalid tag', async () => {
    const req = {
        params: { id: '123' },
        body: { tag: 'holiday' }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.update = jest.fn(); 

    await controller.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid tag.' });
});


test('Update event with only title provided keeps same date', async () => {
    const existingDate = new Date('2025-10-20T00:00:00');

    const req = {
        params: { id: '123' },
        body: { title: 'Title Only' }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    const updatedEvent = { _id: '123', eventDate: existingDate, title: 'Title Only' };
    dao.update = jest.fn().mockResolvedValue(updatedEvent);

    await controller.updateEvent(req, res);

    expect(dao.update).toHaveBeenCalledWith('123', { title: 'Title Only' });

    expect(res.json).toHaveBeenCalledWith({
        message: 'Event updated successfully',
        updated: updatedEvent
    });
});


test('Update event with only date provided keeps same title', async () => {
    const originalTitle = 'Original Title';
    const newDate = '2025-11-01';

    const req = {
        params: { id: '456' },
        body: { eventDate: newDate }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    const updatedEvent = {
        _id: '456',
        eventDate: new Date(`${newDate}T00:00:00`),
        title: originalTitle
    };

    dao.update = jest.fn().mockResolvedValue(updatedEvent);

    await controller.updateEvent(req, res);

    expect(dao.update).toHaveBeenCalledWith('456', {
        eventDate: new Date('2025-11-01T00:00:00')
    });

    expect(res.json).toHaveBeenCalledWith({
        message: 'Event updated successfully',
        updated: updatedEvent
    });
});


test("Update event fails on invalid time format", async () => {
    const req = {
        params: { id: "123" },
        body: { startTime: "25:00", endTime: "26:00" }
    };

    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await controller.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Time must be in HH:MM (24-hour) format.");
});

/*
notification tests
*/

test("Create event on same day triggers notification", async () => {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Build a LOCAL date string that matches what the controller will parse:
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayLocal = `${yyyy}-${mm}-${dd}`;


    const req = {
        body: {
            eventDate: todayLocal,
            title: "Today Event",
            tag: "event",
            location: "Gym",
            startTime: "10:00",
            endTime: "11:00"
        }
    };

    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };

    dao.create.mockResolvedValue({ _id: "abc123" });

    await controller.createNewEvent(req, res);

    expect(NotificationDao.createNotification).toHaveBeenCalledWith({
        eventId: "abc123",
        title: "Event Today: Today Event",
        message: "You have a(n) event today."
    });

    expect(res.status).toHaveBeenCalledWith(200);
});


test("Update event same day triggers update notification", async () => {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Build a LOCAL date string that matches what the controller will parse:
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayLocal = `${yyyy}-${mm}-${dd}`;


    NotificationDao.Notification.findOne.mockResolvedValue(null);

    const updatedEvent = {
        _id: "xyz",
        title: "Updated Today",
        tag: "practice",
        location: "Field",
        eventDate: new Date(`${todayLocal}T00:00:00`)
    };

    const req = { params: { id: "xyz" }, body: { title: "Updated Today" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.update = jest.fn().mockResolvedValue(updatedEvent);

    await controller.updateEvent(req, res);

    expect(NotificationDao.createNotification).toHaveBeenCalledWith({
        eventId: "xyz",
        title: "Event Today: Updated Today",
        message: "You have a(n) practice today at Field."
    });
});

test("Update event same day does NOT trigger notification if one already exists", async () => {
    const todayISO = new Date().toISOString().split("T")[0];

    NotificationDao.Notification.findOne.mockResolvedValue({ _id: "notif" });

    const updatedEvent = {
        _id: "xyz",
        title: "Test",
        tag: "event",
        location: "Campus",
        eventDate: new Date(`${todayISO}T00:00:00`)
    };

    const req = { params: { id: "xyz" }, body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.update = jest.fn().mockResolvedValue(updatedEvent);

    await controller.updateEvent(req, res);

    expect(NotificationDao.createNotification).not.toHaveBeenCalled();
});




