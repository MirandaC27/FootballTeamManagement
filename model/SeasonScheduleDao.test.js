const dbcon = require('./DbConnection');
const dao = require('./SeasonScheduleDao');

/**
 * Executed once before all tests
 */
beforeAll(async function() { 
    dbcon.connect('test');
});

/**
 *  Executed once after all tests have ran
 */
afterAll(async function() { 
    await dao.deleteAll();
    dbcon.disconnect();
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
    let newData = {weekNumber: 1, matchup_1: "test-test", matchup_2: "test2-test2", matchup_3: "test3-test3"};
    let created = await dao.create(newData);
    let found = await dao.read(created._id);
    expect(created._id).not.toBeNull(); 
    expect(created.weekNumber).toBe(found.weekNumber);
});

/**
 * Delete week test.
 */
test('Delete week', async function() {
    let newData = {weekNumber: 1, matchup_1: "test-test", matchup_2: "test2-test2", matchup_3: "test3-test3"};
    let created = await dao.create(newData); 
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id); 
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id); 
});

/**
 * Read all weeks and matchups test.
 */
test('Read All', async function() {
    let newData = {weekNumber: 1, matchup_1: "test-test", matchup_2: "test2-test2", matchup_3: "test3-test3"};
    let newData2 = {weekNumber: 2, matchup_1: "test-test", matchup_2: "test2-test2", matchup_3: "test3-test3"};
    let newData3 = {weekNumber: 3, matchup_1: "test-test", matchup_2: "test2-test2", matchup_3: "test3-test3"};
    await dao.create(newData);
    await dao.create(newData2);
    await dao.create(newData3);
    let lstUsers = await dao.readAll();
    expect(lstUsers.length).toBe(3);
    expect(lstUsers[0].weekNumber).toBe(1);
});

/**
 * Find week test.
 */
test('Find week', async function() {
    let newData = {weekNumber: 1, matchup_1: "test-test", matchup_2: "test2-test2", matchup_3: "test3-test3"};
    let created = await dao.create(newData); 
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