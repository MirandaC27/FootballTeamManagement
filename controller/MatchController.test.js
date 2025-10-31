const controller = require('./MatchController');
const matchDao = require('../model/MatchDao');
const teamDao = require('../model/TeamDao');

// DAO mocks
jest.mock('../model/MatchDao');
jest.mock('../model/TeamDao');

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
});

/*
 * create match tests
 */

// Fail to create match missing required attributes
test('Fail to create match with missing fields', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('All match attributes are required');
});

// Create a new match successfully
test('Create new match successfully', async () => {
    const req = {
        body: {
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            homeScore: 2,
            awayScore: 1,
            matchDate: '2025-10-20T15:00:00',
            matchLocation: 'Main Field',
            matchStatus: 'completed',
        },
    };

    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
    const saveMock = jest.fn().mockResolvedValue({});

    matchDao.matchModel.mockImplementation(() => ({ save: saveMock }));

    await controller.createNewMatch(req, res);

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Match added successfully' });
});

// Fail to create match when DAO throws error
test('Create new match with DAO error', async () => {
    const req = {
        body: {
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            homeScore: 3,
            awayScore: 2,
            matchDate: '2025-10-20T15:00:00',
            matchLocation: 'Main Field',
            matchStatus: 'scheduled',
        },
    };

    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
    const saveMock = jest.fn().mockRejectedValue(new Error('DB Error'));

    matchDao.matchModel.mockImplementation(() => ({ save: saveMock }));

    await controller.createNewMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not create match');
});

/*
 * delete match tests
 */

// Delete match successfully
test('Delete match successfully', async () => {
    const req = { params: { id: '123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    matchDao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '123' }) };

    await controller.deleteMatch(req, res);

    expect(matchDao.matchModel.findByIdAndDelete).toHaveBeenCalledWith('123');
    expect(res.json).toHaveBeenCalledWith({ message: 'Match deleted successfully' });
});

// Delete non-existent match
test('Delete match not found', async () => {
    const req = { params: { id: '999' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    matchDao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue(null) };

    await controller.deleteMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Match not found' });
});

// Delete match with DAO error
test('Delete match with DAO error', async () => {
    const req = { params: { id: '500' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    matchDao.matchModel = { findByIdAndDelete: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.deleteMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting match' });
});

/*
 * get match tests
 */

// Get all matches successfully
test('Get all matches successfully', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    const matches = [
        { _id: '1', homeTeam: 'Team A', awayTeam: 'Team B' },
        { _id: '2', homeTeam: 'Team C', awayTeam: 'Team D' },
    ];
    matchDao.matchModel = { find: jest.fn().mockResolvedValue(matches) };

    await controller.getAllMatches(req, res);

    expect(matchDao.matchModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(matches);
});

// Get all matches with DAO error
test('Get all matches with DAO error', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    matchDao.matchModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

    await controller.getAllMatches(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Could not get matches');
});

/*
 * GET MATCH DETAILS TESTS
 */

// Get match details successfully
test('Get match details successfully', async () => {
    const req = { params: { id: 'match1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };

    const match = {
        _id: 'match1',
        homeTeam: 'home123',
        awayTeam: 'away456',
        homeScore: 2,
        awayScore: 1,
        matchDate: '2025-10-21T15:00:00',
        matchLocation: 'Main Field',
        matchStatus: 'completed',
    };

    const homeTeam = { _id: 'home123', name: 'Team A' };
    const awayTeam = { _id: 'away456', name: 'Team B' };

    matchDao.matchModel = {
        findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(match) }),
    };

    teamDao.findById = jest.fn((id) => {
    if (id === 'home123') {
        return { lean: jest.fn().mockResolvedValue(homeTeam) };
    } else if (id === 'away456') {
        return { lean: jest.fn().mockResolvedValue(awayTeam) };
    }
    });


    await controller.getMatchDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        matchDate: match.matchDate,
        matchLocation: match.matchLocation,
        matchStatus: match.matchStatus,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        homeTeam,
        awayTeam,
    });
});

// Get match details when match not found
test('Get match details - match not found', async () => {
    const req = { params: { id: 'noexist' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };

    matchDao.matchModel = {
        findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    };

    await controller.getMatchDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid match' });
});

// Get match details with DAO error
test('Get match details with DAO error', async () => {
    const req = { params: { id: 'match1' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

    matchDao.matchModel = {
        findById: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('DB Error')) }),
    };

    await controller.getMatchDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error loading match');
});
