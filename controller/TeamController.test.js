const controller = require("./TeamController");
const dao = require("../model/TeamDao");

jest.mock("../model/TeamDao");

/**
 * Executed before each test.
 */
beforeEach(function () {
    jest.clearAllMocks();
});

/**
 * Get all teams from database test.
 */
test('Get all teams from database', async function () {
    let req = {};
    let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };
    
    // Create a fake teams collection for the dao model
    let teams = [
        {
            _id: 'test1', name: 'lions', location: 'baltimore', wins: 2, 
        losses: 1, priorSeasonWins: 13, priorSeasonLosses: 5
        },
        {
            _id: 'test2', name: 'tigers', location: 'chicago', wins: 0, 
        losses: 3, priorSeasonWins: 9, priorSeasonLosses: 9
        },
    ];
    dao.teamModel.find.mockResolvedValue(teams);
    await controller.getAllTeams(req, res);

    expect(dao.teamModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(teams);
    expect(res.status).not.toHaveBeenCalled();
});
