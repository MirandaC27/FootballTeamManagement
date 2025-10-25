const controller = require('./MatchController');
const dao = require('../model/MatchDao');
const calendarArray = require('../calendar-config');

// Mock the entire dao and calendar modules
jest.mock('../model/MatchDao');
jest.mock('../calendar-config');

/**
 * Executed before each test.
 */
beforeEach(function () {
    jest.useFakeTimers();
    jest.clearAllMocks();
});

/**
 * Create new match without matchDate test.
 */
test('Create new match without matchDate', async function () {
    let req = { body: {} };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('No match date');
});

/**
 * Create new match successfully test.
 */
test('Create new match successfully', async function () {
    let req = { body: { matchDate: '2025-10-24' } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.create.mockResolvedValue({});

    await controller.createNewMatch(req, res);

    expect(dao.create).toHaveBeenCalledWith({ matchDate: new Date('2025-10-24T00:00:00') });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Match added successfully" });
});

/**
 * Create new match with DAO error test.
 */
test('Create new match with DAO error', async function () {
    let req = { body: { matchDate: '2025-10-24' } };
    let res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.create.mockRejectedValue(new Error('DB Error'));

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not create match');
});

/**
 * Delete match successfully test.
 */
test('Delete match successfully', async function () {
    let req = { params: { id: '123' } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '123' }) };

    await controller.deleteMatch(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Match deleted successfully" });
});

/**
 * Delete match not found test.
 */
test('Delete match not found', async function () {
    let req = { params: { id: '999' } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue(null) };

    await controller.deleteMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Match not found" });
});

/**
 * Delete match with DAO error test.
 */
test('Delete match with DAO error', async function () {
    let req = { params: { id: '123' } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.matchModel = { findByIdAndDelete: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.deleteMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error while deleting match" });
});

/**
 * Get all matches successfully test.
 */
test('Get all matches successfully', async function () {
    let req = {};
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    let matches = [
        { _id: 'm1', matchDate: '2025-10-24' },
        { _id: 'm2', matchDate: '2025-10-25' },
    ];
    dao.matchModel = { find: jest.fn().mockResolvedValue(matches) };

    await controller.getAllMatches(req, res);

    expect(dao.matchModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(matches);
    expect(res.status).not.toHaveBeenCalledWith(500);
});

/**
 * Get all matches with DAO error test.
 */
test('Get all matches with DAO error', async function () {
    let req = {};
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.matchModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getAllMatches(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not get matches');
});

/**
 * Get calendar data successfully test.
 */
test('Get calendar data successfully', async function () {
    let req = { params: { year: '2025', month: '10' } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    calendarArray.mockReturnValue({ year: 2025, monthName: 'October', data: [] });
    dao.matchModel = {
        find: jest.fn().mockResolvedValue([
            { _id: '1', matchDate: '2025-10-05T00:00:00Z' },
            { _id: '2', matchDate: '2025-09-30T00:00:00Z' },
        ]),
    };

    await controller.getCalendarData(req, res);

    expect(calendarArray).toHaveBeenCalledWith(2025, 9);
    expect(res.json).toHaveBeenCalledWith({
        year: 2025,
        monthName: 'October',
        data: [],
        matchDays: [{ day: 5, id: '1' }],
    });
});

/**
 * Get calendar data with DAO error test.
 */
test('Get calendar data with DAO error', async function () {
    let req = { params: { year: '2025', month: '10' } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    calendarArray.mockReturnValue({ year: 2025, monthName: 'October', data: [] });
    dao.matchModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getCalendarData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error getting calendar data');
});
