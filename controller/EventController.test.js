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

// Fail to create an empty event without date, title, or tag
test('Create empty event', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date, title and tag are required');
});

// Fail to create an event without a date
test('Create an event without a date', async () => {
    const req = { body: { title: 'no date', tag: 'practice' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date, title and tag are required');
});

// Fail to create an event without a title
test('Create an event without a title', async () => {
    const req = { body: { eventDate: '2025-10-24', tag: 'match' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date, title and tag are required');
});

// Fail to create an event without a tag
test('Create an event without a tag', async () => {
    const req = { body: { eventDate: '2025-10-24', title: 'No Tag' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date, title and tag are required');
});

// Fail to create an event with invalid tag
test('Create an event with invalid tag', async () => {
    const req = { body: { eventDate: '2025-10-24', title: 'Invalid Tag', tag: 'holiday' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Invalid tag. Must be practice, match, or event.');
});

// Create a new event successfully
test('Create new event successfully', async () => {
    const req = { body: { eventDate: '2025-10-24', title: 'Final', tag: 'practice' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.create.mockResolvedValue({});

    await controller.createNewEvent(req, res);

    expect(dao.create).toHaveBeenCalledWith({
        eventDate: new Date('2025-10-24T00:00:00'),
        title: 'Final',
        tag: 'practice'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Event added successfully' });
});

// Create event that has an error from the Database
test('Create new event with DAO error', async () => {
    const req = { body: { eventDate: '2025-10-24', title: 'Semi', tag: 'match' } };
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

/*
* update tests
*/

// Update existing event successfully including tag
test('Update existing event successfully with tag', async () => {
    const req = {
        params: { id: '123' },
        body: { eventDate: '2025-10-25', title: 'Updated Title', tag: 'match' }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const updatedEvent = { _id: '123', eventDate: new Date('2025-10-25T00:00:00'), title: 'Updated Title', tag: 'match' };
    dao.update = jest.fn().mockResolvedValue(updatedEvent);

    await controller.updateEvent(req, res);

    expect(dao.update).toHaveBeenCalledWith('123', {
        eventDate: new Date('2025-10-25T00:00:00'),
        title: 'Updated Title',
        tag: 'match'
    });
    expect(res.json).toHaveBeenCalledWith({
        message: 'Event updated successfully',
        updated: updatedEvent
    });
});

//update non-existent event
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

//update event with DAO error
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


// Fail to update event with invalid tag
test('Update event with invalid tag', async () => {
    const req = {
        params: { id: '123' },
        body: { tag: 'holiday' }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.update = jest.fn(); // should not be called

    await controller.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid tag.' });
});

//update event's title and only title
test('Update event with only title provided keeps same date', async () => {
    
    const existingDate = new Date('2025-10-20T00:00:00');

    const req = {
        params: { id: '123' },
        body: { title: 'Title Only' } // no eventDate
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const updatedEvent = { _id: '123', eventDate: existingDate, title: 'Title Only' };
    dao.update = jest.fn().mockResolvedValue(updatedEvent);

    await controller.updateEvent(req, res);


    expect(dao.update).toHaveBeenCalledWith('123', { title: 'Title Only' });


    expect(res.json).toHaveBeenCalledWith({
        message: 'Event updated successfully',
        updated: {
            _id: '123',
            eventDate: existingDate,
            title: 'Title Only'
        }
    });
});

//update event's date and only the date
test('Update event with only date provided keeps same title', async () => {
    const originalTitle = 'Original Title';
    const newDate = '2025-11-01';
    const req = {
        params: { id: '456' },
        body: { eventDate: newDate } // no title
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

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
        updated: {
            _id: '456',
            eventDate: new Date('2025-11-01T00:00:00'),
            title: originalTitle
        }
    });
});

