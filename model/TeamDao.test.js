const dbcon = require('./DbConnection');
const dao = require('./TeamDao');

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
 * Create new user test.
 */
test('Create new team',async function() {
    let newData = {name: 'test', location: 'baltimore', wins: 2, 
        losses: 1, priorSeasonWins: 13, priorSeasonLosses: 5};
    let created = await dao.create(newData);
    let found = await dao.read(created._id);
    expect(created._id).not.toBeNull(); 
    expect(created.login).toBe(found.login);
});

/**
 * Delete team test.
 */
test('Delete team', async function() {
    let newData = {name: 'test', location: 'baltimore', wins: 2, 
        losses: 1, priorSeasonWins: 13, priorSeasonLosses: 5};
    let created = await dao.create(newData); 
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id); 
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id); 
});

/**
 * Read all team documents test.
 */
test('Read All', async function() {
    let newData = {name: 'lions', location: 'baltimore', wins: 2, 
        losses: 1, priorSeasonWins: 13, priorSeasonLosses: 5};
    let newData2 = {name: 'tigers', location: 'chicago', wins: 0, 
        losses: 3, priorSeasonWins: 9, priorSeasonLosses: 9};
    let newData3 = {name: 'bears', location: 'miami', wins: 2, 
        losses: 1, priorSeasonWins: 3, priorSeasonLosses: 15};
    await dao.create(newData);
    await dao.create(newData2);
    await dao.create(newData3);
    let lstUsers = await dao.readAll();
    expect(lstUsers.length).toBe(3);
    expect(lstUsers[0].name).toBe('lions');
});

/**
 * Find team test.
 */
test('Find team', async function() {
    let newData = {name: 'lions', location: 'baltimore', wins: 2, 
        losses: 1, priorSeasonWins: 13, priorSeasonLosses: 5};
    let created = await dao.create(newData); 
    let logged = await dao.findTeam(newData.username);
    expect(logged).not.toBeNull();
    expect(logged._id).toEqual(created._id);
    expect(logged.name).toEqual(created.name);
});

/**
 * Team not found test.
 */
test('Team not found', async function() {
    let badLogged = await dao.findTeam("not a team"); 
    expect(badLogged).toBeNull();
});