const controller = require('./MatchController');
const matchDao = require('../model/MatchDao');
const NotificationDao = require("../model/NotificationDao");

// Mocks
jest.mock('../model/MatchDao');
jest.mock("../model/NotificationDao");

beforeEach(() => {
  jest.clearAllMocks();
});

/*
 * create match tests
 */
test('Fail to create match with missing fields', async () => {
  const req = { body: {} };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  await controller.createNewMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.send).toHaveBeenCalledWith('All match attributes are required');
});

test('Create new match successfully', async () => {
  const saveMock = jest.fn().mockResolvedValue({});
  matchDao.matchModel.mockImplementation(() => ({ save: saveMock }));

  const req = {
    body: {
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      homeScore: 2,
      awayScore: 1,
      matchDate: '2025-10-20T15:00:00',
      matchLocation: 'Main Field',
      matchStatus: 'Final'
    }
  };

  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await controller.createNewMatch(req, res);

  expect(saveMock).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ message: 'Match added successfully' });
});

test('Fail to create match when DB errors', async () => {
  const saveMock = jest.fn().mockRejectedValue(new Error("DB Error"));
  matchDao.matchModel.mockImplementation(() => ({ save: saveMock }));

  const req = {
    body: {
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      homeScore: 3,
      awayScore: 2,
      matchDate: '2025-11-01T15:00:00',
      matchLocation: 'Stadium',
      matchStatus: 'Scheduled'
    }
  };

  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  await controller.createNewMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith('Could not create match');
});

/*
 * DELETE MATCH TESTS
 */
test('Delete match successfully', async () => {
  matchDao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '123' }) };

  const req = { params: { id: '123' } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  await controller.deleteMatch(req, res);

  expect(matchDao.matchModel.findByIdAndDelete).toHaveBeenCalledWith('123');
  expect(res.json).toHaveBeenCalledWith({ message: 'Match deleted successfully' });
});

test('Delete match not found', async () => {
  matchDao.matchModel = { findByIdAndDelete: jest.fn().mockResolvedValue(null) };

  const req = { params: { id: '999' } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  await controller.deleteMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: 'Match not found' });
});

test('Delete match DAO error', async () => {
  matchDao.matchModel = { findByIdAndDelete: jest.fn().mockRejectedValue(new Error("DB Error")) };

  const req = { params: { id: '500' } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  await controller.deleteMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting match' });
});

/*
 * update match tests
 */
test('Update match successfully without notification', async () => {
  const updatedResult = { _id: 'abc', homeScore: 3 };

  matchDao.updateById.mockResolvedValue(updatedResult);

  const req = { params: { id: 'abc' }, body: { homeScore: 3 } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  await controller.updateMatch(req, res);

  expect(matchDao.updateById).toHaveBeenCalledWith('abc', { homeScore: 3 });
  expect(res.json).toHaveBeenCalledWith({
    message: 'Match updated successfully',
    updated: updatedResult
  });
});

test("Update match triggers notification on In Progress", async () => {
  const updatedResult = {
    _id: "123",
    homeTeam: "A",
    awayTeam: "B"
  };

  matchDao.updateById.mockResolvedValue(updatedResult);
  NotificationDao.createNotification.mockResolvedValue({ notif: true });

  const req = {
    params: { id: "123" },
    body: { matchStatus: "In Progress" }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  await controller.updateMatch(req, res);

  expect(NotificationDao.createNotification).toHaveBeenCalledWith({
    matchId: "123",
    title: "Match Started!",
    message: "Match A vs B is now In Progress"
  });

  expect(res.json).toHaveBeenCalledWith({
    message: "Match updated successfully",
    updated: updatedResult
  });
});

test('Update match not found', async () => {
  matchDao.updateById.mockResolvedValue(null);

  const req = { params: { id: 'xyz' }, body: {} };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  await controller.updateMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: 'Match not found' });
});

test("Update match DAO error", async () => {
  matchDao.updateById.mockRejectedValue(new Error("DB Error"));

  const req = { params: { id: "err" }, body: {} };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  await controller.updateMatch(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    message: "Server error while updating match"
  });
});


/*
 * get matches test
 */
test('Get all matches successfully', async () => {
  matchDao.matchModel = { find: jest.fn().mockResolvedValue([{ _id: 1 }]) };

  const req = {};
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

  await controller.getAllMatches(req, res);

  expect(res.json).toHaveBeenCalledWith([{ _id: 1 }]);
});

test('Get all matches DAO error', async () => {
  matchDao.matchModel = { find: jest.fn().mockRejectedValue(new Error("DB Error")) };

  const req = {};
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  await controller.getAllMatches(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith("Could not get matches");
});

/*
 * get match details tests
 */
test('Get match details successfully', async () => {
  const match = { _id: '123' };

  matchDao.matchModel = {
    findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(match) })
  };

  const req = { params: { id: '123' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await controller.getMatchDetails(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(match);
});

test('Get match details not found', async () => {
  matchDao.matchModel = {
    findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })
  };

  const req = { params: { id: 'xyz' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await controller.getMatchDetails(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: "Match not found" });
});

test('Get match details DAO error', async () => {
  matchDao.matchModel = {
    findById: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error("DB Error")) })
  };

  const req = { params: { id: 'err' } };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  await controller.getMatchDetails(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith("Error loading match");
});

/*
 * reaction tests
 */
test("Toggle match reaction successfully", async () => {
  matchDao.updateMatchReaction.mockResolvedValue({ isReacted: true, count: 1 });

  const req = {
    params: { id: "1" },
    session: { user: { _id: "user1" } },
    body: { reaction: "like" }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

  await controller.updateMatchReaction(req, res);

  expect(res.json).toHaveBeenCalledWith({ isReacted: true, count: 1 });
});

test("Toggle reaction match not found", async () => {
  matchDao.updateMatchReaction.mockResolvedValue(null);

  const req =
{
    params: { id: "1" },
    session: { user: { _id: "user1" } },
    body: { reaction: "like" }
  };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  await controller.updateMatchReaction(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.send).toHaveBeenCalledWith("Match not found");
});

test("Toggle reaction DAO error", async () => {
  matchDao.updateMatchReaction.mockRejectedValue(new Error("DB error"));

  const req = {
    params: { id: "1" },
    session: { user: { _id: "user1" } },
    body: { reaction: "angry" }
  };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  await controller.updateMatchReaction(req, res);

  expect(res.status).toHaveBeenCalled();
  expect(res.send).toHaveBeenCalledWith("Error updating match reaction");
});

/*
 * start timer tests
 */
test("Start match timer successfully", async () => {
  matchDao.readById.mockResolvedValue({
    clock: { status: "stopped", elapsedBeforeStart: 100 }
  });

  matchDao.setClockState.mockResolvedValue({ updated: true });

  const emitMock = jest.fn();
  const req = {
    params: { id: "match1" },
    app: { get: () => ({ emit: emitMock }) }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  await controller.startMatchTimer(req, res);

  expect(emitMock).toHaveBeenCalledWith("clock:start", expect.any(Object));
  expect(res.json).toHaveBeenCalledWith({
    message: "Clock started",
    match: { updated: true }
  });
});

test("Start match timer match not found", async () => {
  matchDao.readById.mockResolvedValue(null);

  const req = { params: { id: "nope" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await controller.startMatchTimer(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: "Match not found" });
});

test("Start match timer DAO error", async () => {
  matchDao.readById.mockRejectedValue(new Error("DB Error"));

  const req = { params: { id: "fail" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await controller.startMatchTimer(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
});


test("startMatchTimer returns 'Clock already running' when clock is already started", async () => {
    const req = {
        params: { id: "M1" },
        app: { get: () => ({ emit: jest.fn() }) }
    };

    const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };

    //match exists and is already started
    matchDao.readById.mockResolvedValue({
        clock: {
            status: "started",
            startTimestamp: Date.now(),
            elapsedBeforeStart: 5000
        }
    });

    await controller.startMatchTimer(req, res);

    expect(res.json).toHaveBeenCalledWith({
        message: "Clock already running",
        match: {
            clock: {
                status: "started",
                startTimestamp: expect.any(Number),
                elapsedBeforeStart: 5000
            }
        }
    });
});


/*
 * end timer tests
 */
test("End match timer successfully", async () => {
  matchDao.matchModel = {
    findById: jest.fn().mockResolvedValue({
      clock: { status: "started", startTimestamp: Date.now(), elapsedBeforeStart: 50 }
    })
  };

  matchDao.setClockState.mockResolvedValue({ updated: true });

  const emitMock = jest.fn();
  const req = {
    params: { id: "match1" },
    app: { get: () => ({ emit: emitMock }) }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  await controller.endMatchTimer(req, res);

  expect(emitMock).toHaveBeenCalledWith("clock:stop", expect.any(Object));
  expect(res.json).toHaveBeenCalledWith({
    message: "Clock stopped",
    match: { updated: true }
  });
});

test("End match timer match not found", async () => {
  matchDao.matchModel = { findById: jest.fn().mockResolvedValue(null) };

  const req = { params: { id: "nope" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await controller.endMatchTimer(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
});

test("End match timer DAO error", async () => {
  matchDao.matchModel = { findById: jest.fn().mockRejectedValue(new Error("DB Error")) };

  const req = { params: { id: "fail" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await controller.endMatchTimer(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
});

test("endMatchTimer returns 'Clock already stopped' when clock is not running", async () => {
    const req = {
        params: { id: "M2" },
        app: { get: () => ({ emit: jest.fn() }) }
    };

    const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };

    //match exists but is already stopped
    matchDao.matchModel = {
        findById: jest.fn().mockResolvedValue({
            clock: {
                status: "stopped",
                startTimestamp: null,
                elapsedBeforeStart: 3000
            }
        })
    };

    await controller.endMatchTimer(req, res);

    expect(res.json).toHaveBeenCalledWith({
        message: "Clock already stopped",
        match: {
            clock: {
                status: "stopped",
                startTimestamp: null,
                elapsedBeforeStart: 3000
            }
        }
    });
});


/*
 * reset timer tests
 */
test("Reset match timer successfully", async () => {
  matchDao.readById.mockResolvedValue({});

  matchDao.setClockState.mockResolvedValue({ updated: true });

  const emitMock = jest.fn();
  const req = {
    params: { id: "match1" },
    app: { get: () => ({ emit: emitMock }) }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  await controller.resetMatchTimer(req, res);

  expect(emitMock).toHaveBeenCalledWith("clock:reset", { matchId: "match1" });
  expect(res.json).toHaveBeenCalledWith({
    message: "Clock reset",
    match: { updated: true }
  });
});

test("Reset match timer match not found", async () => {
  matchDao.readById.mockResolvedValue(null);

  const req = { params: { id: "nope" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await controller.resetMatchTimer(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
});

test("Reset match timer DAO error", async () => {
  matchDao.readById.mockRejectedValue(new Error("DB Error"));

  const req = { params: { id: "fail" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await controller.resetMatchTimer(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
});