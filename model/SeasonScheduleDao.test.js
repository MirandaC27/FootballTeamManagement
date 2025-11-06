const dbcon = require('./DbConnection');
let dao;
let matchups;

/**
 * Executed once before all tests
 */
beforeAll(async function() { 
    await dbcon.connect('test');
    dao = require('./SeasonScheduleDao');
    matchups = [
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
    ]
});

/**
 *  Executed once after all tests have ran
 */
afterAll(async function() { 
    await dao.deleteAll();
    await dbcon.disconnect();
});

/**
 * Executed before each test
 */
beforeEach(async function() {
    await dao.deleteAll();
});

/**
 * Create new week test.
 */
test('Create new week',async function() {
    let created = await dao.create(1, matchups);
    let found = await dao.read(created._id);
    expect(created._id).not.toBeNull(); 
    expect(created.weekNumber).toBe(found.weekNumber);
});

/**
 * Delete week test.
 */
test('Delete week', async function() {
    let newData = {weekNumber: 1, weekMatchups: matchups};
    let created = await dao.create(1, matchups);
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id); 
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id); 
});

/**
 * Read all weeks and matchups test.
 */
test('Read All', async function() {
    let newData = {weekNumber: 1, weekMatchups: matchups};
    let newData2 = {weekNumber: 2, weekMatchups: matchups};
    let newData3 = {weekNumber: 3, weekMatchups: matchups};
    await dao.create(1, matchups);
    //await dao.create(2, matchups);
    //await dao.create(3, matchups);
    let lstWeeks = await dao.getAll();
    //expect(lstUsers.length).toBe(3);
    expect(lstWeeks[0].weekNumber).toBe(1);
});

/**
 * Find week test.
 */
test('Find week', async function() {
    let newData = {weekNumber: 1, weekMatchups: matchups};
    let created = await dao.create(1, matchups);
    let logged = await dao.findWeek(newData.weekNumber);
    expect(logged).not.toBeNull();
    expect(logged._id).toEqual(created._id);
    expect(logged.weekNumber).toEqual(created.weekNumber);
});

/**
 * Week not found test.
 */
test('Week not found', async function() {
    let badLogged = await dao.findWeek(-1); 
    expect(badLogged).toBeNull();
});

/**
 * Get weeks matchups test.
 */
test('Get weeks matchups', async function() {
    let newData = {weekNumber: 1, weekMatchups: matchups};
    let created = await dao.create(1, matchups);
    let logged = await dao.findWeek(1);
    expect(logged).not.toBeNull();
    //expect(logged.weekMatchups).toEqual(matchups);
});


/**
 * Update a weeks matchups
 */
test('Update week matchups', async function() {
    let newData = {weekNumber: 1, weekMatchups: matchups};
    let newData2 = {weekNumber: 2, weekMatchups: matchups};
    let newData3 = {weekNumber: 3, weekMatchups: matchups};
    let created = await dao.create(1, matchups);
    let updated = await dao.upsertWeek(2, [{homeTeam: "red", awayTeam:"blue"}]);
    let logged = await dao.findWeek(2);
    matchups2 = [
        {
            homeTeam: "red",
            awayTeam: "blue"
        },
    ]
    expect(logged).not.toBeNull();
    //expect(logged.weekMatchups).toEqual(matchups2);
});

/**
 * Deletes a week by its week number
 */
test('Delete by week number', async function() {
    let newData = {weekNumber: 1, weekMatchups: matchups};
    let created = await dao.create(1, matchups);
    let deleted = await dao.delByWeekNumber(created.weekNumber);
    let found = await dao.read(created._id); 
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id); 
});

/**
 * Get matchups by its week number
 */
test('Get matchups by week number', async function() {
    let newData = {weekNumber: 1, weekMatchups: matchups};
    let created = await dao.create(1, matchups);
    let found = await dao.getWeeksMatchups(1);
    //expect(found).toEqual(matchups);
});

/**
 * Update a matchups result
 */
test('Update the result of a matchup', async function() {
    let newData = {weekNumber: 1, weekMatchups: matchups};
    let created = await dao.create(1, matchups);
    let updated = await dao.updateResult(1, "lions", "tigers", "win");
    const matchups2 = [
        {
            homeTeam: "lions",
            awayTeam: "tigers",
            result: "win"
        },
        {
            homeTeam: "bees",
            awayTeam: "fish"
        },
        {
            homeTeam: "rays",
            awayTeam: "bulls"
        },
    ]
    //expect(updated.weekMatchups).toEqual(matchups2);
});

/**
 * Add a matchup to a week
 */
test('Add matchup to week', async function() {
    let newData = {weekNumber: 1, weekMatchups: matchups};
    let created = await dao.create(1, matchups);
    let updated = await dao.addMatchup(1, {homeTeam: "test1", awayTeam: "test2"});
    const matchups2 = [
        {
            homeTeam: "lions",
            awayTeam: "tigers",
            result: "win"
        },
        {
            homeTeam: "bees",
            awayTeam: "fish"
        },
        {
            homeTeam: "rays",
            awayTeam: "bulls"
        },
        {
            homeTeam: "test1",
            awayTeam: "test2"
        },
    ]
    //expect(updated.weekMatchups).toEqual(matchups2);
});
