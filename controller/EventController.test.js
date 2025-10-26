const controller = require('./EventController');
const dao = require('../model/EventDao');
const calendarArray = require('../CalendarConfig');


//test setup
jest.mock('../model/EventDao');
jest.mock('../CalendarConfig');

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
});

/*
* create event tests
*/
//fail to create an empty event without a date or a title
test('Create empty event', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date and title are required');
});

//fail to create a event without a date
test('Create a event without a date', async () => {
    const req = { body: {title: 'no date yet'} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date and title are required');
});


//fail to create event without a title.
test('Create a event without a title', async () => {
    const req = { body: {title: 'no date yet'} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date and title are required');
});

//create a new event with date and title
test('Create new event successfully', async () => {
    const req = { body: { eventDate: '2025-10-24', title: 'Final' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.create.mockResolvedValue({});

    await controller.createNewEvent(req, res);

    expect(dao.create).toHaveBeenCalledWith({
        eventDate: new Date('2025-10-24T00:00:00'),
        title: 'Final',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Event added successfully' });
});

//create event that has an error from the Database
test('Create new event with DAO error', async () => {
    const req = { body: { eventDate: '2025-10-24', title: 'Semi' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.create.mockRejectedValue(new Error('DB Error'));

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not create event');
});


/*
* delete event tests
*/
//delete an existing event
test('Delete event successfully', async () => {
    const req = { params: { id: '123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.eventModel = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '123' }) };

    await controller.deleteEvent(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Event deleted successfully' });
});

//delete a non-existent event
test('Delete event not found', async () => {
    const req = { params: { id: '999' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.eventModel = { findByIdAndDelete: jest.fn().mockResolvedValue(null) };

    await controller.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
});

//delete event that has an error from the Database
test('Delete event with DAO error', async () => {
    const req = { params: { id: '123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.eventModel = { findByIdAndDelete: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting event' });
});


/*
* getting data tests
*/

//get all existing events from database
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

//try getting a event with error from database
test('Get all events with DAO error', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.eventModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getAllEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not get events');
});

//get all calendar data
test('Get calendar data successfully', async () => {
    const req = { params: { year: '2025', month: '10' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    calendarArray.mockReturnValue({ year: 2025, monthName: 'October', data: [] });
    dao.eventModel = {
        find: jest.fn().mockResolvedValue([
            { _id: '1', eventDate: '2025-10-05T00:00:00', title: 'Event 1' },
            { _id: '2', eventDate: '2025-09-30T00:00:00', title: 'Event 2' },
        ]),
    };

    await controller.getCalendarData(req, res);

    expect(calendarArray).toHaveBeenCalledWith(2025, 9);
    expect(res.json).toHaveBeenCalledWith({
        year: 2025,
        monthName: 'October',
        data: [],
        eventDays: [{ day: 5, id: '1', title: 'Event 1' }],
    });

    expect(res.status).not.toHaveBeenCalled();
});

//get calendar data with error from databse
test('Get calendar data with DAO error', async () => {
    const req = { params: { year: '2025', month: '10' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    calendarArray.mockReturnValue({ year: 2025, monthName: 'October', data: [] });
    dao.eventModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getCalendarData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error getting calendar data');
});
