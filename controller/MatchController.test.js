const controller = require('./MatchController');
const dao = require('../model/MatchDao');
const calendarArray = require('../CalendarConfig');


//test setup
jest.mock('../model/MatchDao');
jest.mock('../CalendarConfig');

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
});

/*
* create match tests
*/
//fail to create an empty match without a date or a title
test('Create empty match', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date and title are required');
});

//fail to create a match without a date
test('Create a match without a date', async () => {
    const req = { body: {title: 'no date yet'} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date and title are required');
});


//fail to create match without a title.
test('Create a match without a title', async () => {
    const req = { body: {title: 'no date yet'} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date and title are required');
});

//create a new match with date and title
test('Create new match successfully', async () => {
    const req = { body: { matchDate: '2025-10-24', title: 'Final' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.create.mockResolvedValue({});

    await controller.createNewMatch(req, res);

    expect(dao.create).toHaveBeenCalledWith({
        matchDate: new Date('2025-10-24T00:00:00'),
        title: 'Final',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Match added successfully' });
});

//create match that has an error from the Database
test('Create new match with DAO error', async () => {
    const req = { body: { matchDate: '2025-10-24', title: 'Semi' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.create.mockRejectedValue(new Error('DB Error'));

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not create match');
});


/*
* delete match tests
*/
//delete an existing match
test('Delete match successfully', async () => {
    const req = { params: { id: '123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '123' }) };

    await controller.deleteMatch(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Match deleted successfully' });
});

//delete a non-existent match
test('Delete match not found', async () => {
    const req = { params: { id: '999' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue(null) };

    await controller.deleteMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Match not found' });
});

//delete match that has an error from the Database
test('Delete match with DAO error', async () => {
    const req = { params: { id: '123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.matchModel = { findByIdAndDelete: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.deleteMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting match' });
});


/*
* getting data tests
*/

//get all existing matches from database
test('Get all matches successfully', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    const matches = [
        { _id: 'm1', matchDate: '2025-10-24' },
        { _id: 'm2', matchDate: '2025-10-25' },
    ];
    dao.matchModel = { find: jest.fn().mockResolvedValue(matches) };

    await controller.getAllMatches(req, res);

    expect(dao.matchModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(matches);
});

//try getting a match with error from database
test('Get all matches with DAO error', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.matchModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getAllMatches(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not get matches');
});

//get all calendar data
test('Get calendar data successfully', async () => {
    const req = { params: { year: '2025', month: '10' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    calendarArray.mockReturnValue({ year: 2025, monthName: 'October', data: [] });
    dao.matchModel = {
        find: jest.fn().mockResolvedValue([
            { _id: '1', matchDate: '2025-10-05T00:00:00', title: 'Match 1' },
            { _id: '2', matchDate: '2025-09-30T00:00:00', title: 'Match 2' },
        ]),
    };

    await controller.getCalendarData(req, res);

    expect(calendarArray).toHaveBeenCalledWith(2025, 9);
    expect(res.json).toHaveBeenCalledWith({
        year: 2025,
        monthName: 'October',
        data: [],
        matchDays: [{ day: 5, id: '1', title: 'Match 1' }],
    });

    expect(res.status).not.toHaveBeenCalled();
});

//get calendar data with error from databse
test('Get calendar data with DAO error', async () => {
    const req = { params: { year: '2025', month: '10' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    calendarArray.mockReturnValue({ year: 2025, monthName: 'October', data: [] });
    dao.matchModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getCalendarData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error getting calendar data');
});
