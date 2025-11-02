const controller = require('./MatchController');
const matchDao = require('../model/MatchDao');

// DAO mocks
jest.mock('../model/MatchDao');

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

/*
 * create match tests
 */

// Fail to create match
test('Fail to create match with missing fields', async () => {
  const req = { body: {} };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };

  await controller.createNewMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.send).toHaveBeenCalledWith('All match attributes are required');
});

// Successfully create new match
test('Create new match successfully', async () => {
  const req = {
    body: {
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      homeScore: 2,
      awayScore: 1,
      matchDate: '2025-10-20T15:00:00',
      matchLocation: 'Main Field',
      matchStatus: 'Final',
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

// Fail to create match with DB error
test('Fail to create match when DAO throws error', async () => {
  const req = {
    body: {
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      homeScore: 3,
      awayScore: 2,
      matchDate: '2025-11-01T15:00:00',
      matchLocation: 'Stadium',
      matchStatus: 'Scheduled',
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

//successfully delete match
test('Delete match successfully', async () => {
  const req = { params: { id: '123' } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  matchDao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '123' }) };

  await controller.deleteMatch(req, res);

  expect(matchDao.matchModel.findByIdAndDelete).toHaveBeenCalledWith('123');
  expect(res.json).toHaveBeenCalledWith({ message: 'Match deleted successfully' });
});

//try to delete match that doesn't exist
test('Delete match not found', async () => {
  const req = { params: { id: '999' } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  matchDao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue(null) };

  await controller.deleteMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: 'Match not found' });
});

//try to delete match with DB error
test('Delete match with DAO error', async () => {
  const req = { params: { id: '500' } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  matchDao.matchModel = { findByIdAndDelete: jest.fn().mockRejectedValue(new Error('DB Error')) };

  await controller.deleteMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting match' });
});

/*
 * update match tests
 */
test('Update match successfully', async () => {
  const req = {
    params: { id: 'abc' },
    body: { matchStatus: 'Final', homeScore: 3 },
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  matchDao.updateById.mockResolvedValue({ _id: 'abc', matchStatus: 'Final', homeScore: 3 });

  await controller.updateMatch(req, res);

  expect(matchDao.updateById).toHaveBeenCalledWith('abc', req.body);
  expect(res.json).toHaveBeenCalledWith({
    message: 'Match updated successfully',
    updated: { _id: 'abc', matchStatus: 'Final', homeScore: 3 },
  });
});

test('Update match not found', async () => {
  const req = { params: { id: 'xyz' }, body: { matchStatus: 'Cancelled' } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  matchDao.updateById.mockResolvedValue(null);

  await controller.updateMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: 'Match not found' });
});

test('Update match with DAO error', async () => {
  const req = { params: { id: 'err' }, body: { homeScore: 1 } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  matchDao.updateById.mockRejectedValue(new Error('DB Error'));

  await controller.updateMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ message: 'Server error while updating match' });
});

/*
 * get match tests
 */

test('Get all matches successfully', async () => {
  const req = {};
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
  const matches = [{ _id: '1' }, { _id: '2' }];
  matchDao.matchModel = { find: jest.fn().mockResolvedValue(matches) };

  await controller.getAllMatches(req, res);
  expect(res.json).toHaveBeenCalledWith(matches);
});

test('Get all matches with DAO error', async () => {
  const req = {};
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
  matchDao.matchModel = { find: jest.fn().mockRejectedValue(new Error('DB Error')) };

  await controller.getAllMatches(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith('Could not get matches');
});

/*
 * get details of match test
 */

test('Get match details successfully', async () => {
  const req = { params: { id: 'match1' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };

  const match = {
    _id: 'match1',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    matchDate: '2025-11-01T15:00:00',
    matchLocation: 'Main Field',
    matchStatus: 'Final',
  };

  matchDao.matchModel = {
    findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(match) }),
  };

  await controller.getMatchDetails(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(match);
});

test('Get match details not found', async () => {
  const req = { params: { id: 'noexist' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
  matchDao.matchModel = {
    findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
  };

  await controller.getMatchDetails(req, res);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: 'Match not found' });
});

test('Get match details DAO error', async () => {
  const req = { params: { id: 'err' } };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
  matchDao.matchModel = {
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockRejectedValue(new Error('DB Error')),
    }),
  };

  await controller.getMatchDetails(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith('Error loading match');
});
