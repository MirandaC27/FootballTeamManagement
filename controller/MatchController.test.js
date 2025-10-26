const controller = require('./MatchController');
const dao = require('../model/MatchDao');
const calendarArray = require('../calendar-config');

jest.mock('../model/MatchDao');
jest.mock('../calendar-config');

/**
 * Executed before each test.
 */
beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
});

/**
 * Create new match with missing fields test.
 */
test('Create empty match', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date and title are required');
});

/**
 * fail to Create match without a date.
 */
test('Create a match without a date', async () => {
    const req = { body: {title: 'no date yet'} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date and title are required');
});

/**
 * fail to Create match without a title.
 */
test('Create a match without a title', async () => {
    const req = { body: {title: 'no date yet'} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('date and title are required');
});

/**
 * Create new match successfully.
 */
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

/**
 * Create new match with DAO error.
 */
test('Create new match with DAO error', async () => {
    const req = { body: { matchDate: '2025-10-24', title: 'Semi' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    dao.create.mockRejectedValue(new Error('DB Error'));

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not create match');
});

/**
 * Delete match successfully.
 */
test('Delete match successfully', async () => {
    const req = { params: { id: '123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '123' }) };

    await controller.deleteMatch(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Match deleted successfully' });
});

/**
 * Delete match not found.
 */
test('Delete match not found', async () => {
    const req = { params: { id: '999' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue(null) };

    await controller.deleteMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Match not found' });
});

/**
 * Delete match with DAO error.
 */
test('Delete match with DAO error', async () => {
    const req = { params: { id: '123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.matchModel = { findByIdAndDelete: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.deleteMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting match' });
});

/**
 * Get all matches successfully.
 */
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

/**
 * Get all matches with DAO error.
 */
test('Get all matches with DAO error', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.matchModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getAllMatches(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not get matches');
});

/**
 * Get calendar data successfully.
 */
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

/**
 * Get calendar data with DAO error.
 */
test('Get calendar data with DAO error', async () => {
    const req = { params: { year: '2025', month: '10' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    calendarArray.mockReturnValue({ year: 2025, monthName: 'October', data: [] });
    dao.matchModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getCalendarData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error getting calendar data');
});
