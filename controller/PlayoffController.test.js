const controller = require('./PlayoffController');
const dao = require('../model/PlayoffBracketDao');

// Mock the whole modules
jest.mock('../model/PlayoffBracketDao');
let req;
let res;

/**
 * Executed before each test.
 */
beforeEach(function () {
    req = {};
    res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
    jest.clearAllMocks();
});

/**
 * Gets all brackets in the database
 */
test('Get all brackets from database', async function () {
    const mockBrackets = [{ name: 'bracket1' }, { name: 'bracket2' }];
    dao.getAll.mockResolvedValue(mockBrackets);
    await controller.getAllBrackets(req, res);

    expect(dao.getAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockBrackets);
})

/**
 * Gets a bracket by name
 */
test('Get a bracket by name', async function () {
    req = { query: { bracketName: 'bracket1' }};
    const mockBracket = [{ name: 'bracket1' }];
    dao.findByName.mockResolvedValue(mockBracket);
    await controller.getBracketByName(req, res);

    expect(dao.findByName).toHaveBeenCalledWith('bracket1');
    expect(res.json).toHaveBeenCalledWith(mockBracket);
})

/**
 * Create new bracket
 */
test('Create a new bracket', async function () {
    req.body = { name: 'bracket1', numTeams: 6, rounds: [] };
    const mockBracket = { name: 'bracket1', numTeams: 6, rounds: [] };
    dao.create.mockResolvedValue(mockBracket);

    await controller.createBracket(req, res);

    expect(dao.create).toHaveBeenCalledWith('bracket1', 6, []);
    expect(res.json).toHaveBeenCalledWith(mockBracket);
});

/**
 * Add matchup to bracket
 */
test('addMatchup should add matchup successfully', async function () {
    req.params = { name: 'bracket1', roundNumber: '1' };
    req.body = { homeTeam: 'tigers', awayTeam: 'lions' };
    const updated = { name: 'bracket1', rounds: [{ roundNumber: 1, roundMatchups: [req.body] }] };
    dao.addMatchup.mockResolvedValue(updated);

    await controller.addMatchup(req, res);

    expect(dao.addMatchup).toHaveBeenCalledWith('bracket1', 1, req.body);
    expect(res.json).toHaveBeenCalledWith(updated);
});

/**
 * Update matchup result
 */
test('Update matchup result', async function () {
    req.params = { name: 'Bracket1', roundNumber: '1' };
    req.body = { homeTeam: 'A', awayTeam: 'B', result: '2-1' };
    const updatedWeek = { rounds: [{ roundNumber: 1 }] };
    dao.updateResult.mockResolvedValue(updatedWeek);

    await controller.updatePlayoffMatchupResult(req, res);

    expect(dao.updateResult).toHaveBeenCalledWith('Bracket1', 1, 'A', 'B', '2-1');
    expect(res.json).toHaveBeenCalledWith(updatedWeek);
});

/**
 * Deletes single bracket from the database
*/
test('Delete bracket from database', async function () {
    req.params = { name: 'bracket1' };
    const deleted = { deletedCount: 1 };
    dao.deleteByName.mockResolvedValue(deleted);

    await controller.deleteBracket(req, res);

    expect(dao.deleteByName).toHaveBeenCalledWith('bracket1');
    expect(res.json).toHaveBeenCalledWith(deleted);
});

/**
 * Deletes all brackets
 */
test('Deletes all brackets', async function () {
    const deletedAll = { deletedCount: 10 };
    dao.deleteAllBrackets.mockResolvedValue(deletedAll);

    await controller.deleteAllBrackets(req, res);

    expect(dao.deleteAllBrackets).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(deletedAll);
});