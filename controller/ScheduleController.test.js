const controller = require('./ScheduleController');
const dao = require('../model/SeasonScheduleDao');

// Mock the whole modules
jest.mock('../model/SeasonScheduleDao');

const matchups = [
        {
            homeTeam: "lions",
            awayTeam: "tigers"
        },
        {
            homeTeam: "bees",
            awayTeam: "fish"
        },
        {
            homeTeam: "rays",
            awayTeam: "bulls"
        },
    ];

const matchups2 = [
        {
            homeTeam: "fish",
            awayTeam: "tigers"
        },
        {
            homeTeam: "lions",
            awayTeam: "fish"
        },
        {
            homeTeam: "whales",
            awayTeam: "snakes"
        },
    ];

/**
 * Executed before each test.
 */
beforeEach(function () {
    jest.clearAllMocks();
});

/**
 * Get all weeks from database test.
 */
test('Get all weeks from database', async function () {
    let req = {};
    let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

    // Create a fake documents collection for the dao model
    let weeks = [
        {
            _id: 'test1', weekNumber: 1, weekMatchups: matchups
        },
        {
            _id: 'test2', weekNumber: 2, weekMatchups: matchups2
        },
    ];
    dao.getAll.mockResolvedValue(weeks);
    await controller.getAllWeeks(req, res);

    expect(dao.getAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(weeks);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Get a week from the database test.
 */
test('Get a specified week from the database', async function () {
    let req = { body: { weekNumber: 1 }, session: {} };
    let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

    let week1 = [
        {
            _id: 'test1', weekNumber: 1, weekMatchups: matchups
        }];

    // Mock that week was found
    dao.findWeek.mockResolvedValue(week1);
    await controller.getSpecificWeek(req, res);

    expect(dao.findWeek).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(week1);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Create and add a new week to the database test.
 */
test('Create and add a new week to the database test', async function () {
    let req = { body: { weekNumber: 1, weekMatchups: matchups }, session: {} };
    let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

    await controller.createWeek(req, res);

    expect(dao.create).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Upsert a new week to the database test.
 */
test('Upsert a new week to the database test.', async function () {
    let req = { params: {weekNumber: 1}, body: { weekMatchups: matchups }, session: {} };
    let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

    await controller.upsertWeek(req, res);

    expect(dao.upsertWeek).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Delete a week from the database test.
 */
test('Delete a week from the database test.', async function () {
    let req = { params: {weekNumber: 1}, body: {}, session: {} };
    let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

    await controller.deleteWeek(req, res);

    expect(dao.delByWeekNumber).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Update a matchup result in the database test.

test('Update a matchup result in the database test.', async function () {
    let req = { params: {weekNumber: 1}, body: { weekMatchups: matchups }, session: {} };
    let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

    await controller.upsertWeek(req, res);

    req = { params: {weekNumber: 1}, body: { homeTeam: 'lions', awayTeam: 'tigers', result: 'win' }, session: {} };
    res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

    await controller.updateMatchupResult(req, res);

    expect(dao.updateResult).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
});

*/