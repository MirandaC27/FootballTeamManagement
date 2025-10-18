const dbcon = require('./DbConnection');
const dao = require('./UserDao');

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
test('Create new user',async function() {
    let newdata = {username: 'test', password: '12345678', email: 'test@gmail.com', 
        phone: '1230001234', date_of_birth: '10/17/2025', name: 'First Last', approve: false};
    let created = await dao.create(newdata);
    let found = await dao.read(created._id);
    expect(created._id).not.toBeNull(); 
    expect(created.login).toBe(found.login);
});

/**
 * Delete user test.
 */
test('Delete user', async function() {
    let newdata = {username: 'test', password: '12345678', email: 'test@gmail.com', 
        phone: '1230001234', date_of_birth: '10/17/2025', name: 'First Last', approve: false};
    let created = await dao.create(newdata); 
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id); 
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id); 
});

/**
 * Read all user documents test.
 */
test('Read All', async function() {
    let newdata1 = {username: 'test1', password: '12345678', email: 'test1@gmail.com', 
        phone: '1230001234', date_of_birth: '10/17/2025', name: 'First Last', approve: false};
    let newdata2 = {username: 'test2', password: '123456789', email: 'test2@gmail.com', 
        phone: '1230001234', date_of_birth: '10/17/2025', name: 'First Last', approve: false};
    let newdata3 = {username: 'test3', password: '12345678910', email: 'test3@gmail.com', 
        phone: '1230001234', date_of_birth: '10/17/2025', name: 'First Last', approve: false};
    await dao.create(newdata1);
    await dao.create(newdata2);
    await dao.create(newdata3);
    let lstUsers = await dao.readAll();
    expect(lstUsers.length).toBe(3);
    expect(lstUsers[0].username).toBe('test1');
});

/**
 * Find login user test.
 */
test('Find Login user', async function() {
    let newdata = {username: 'test1', password: '12345678', email: 'test1@gmail.com', 
        phone: '1230001234', date_of_birth: '10/17/2025', name: 'First Last', approve: false};
    let created = await dao.create(newdata); 
    let logged = await dao.findLogin(newdata.username);
    expect(logged).not.toBeNull();
    expect(logged._id).toEqual(created._id);
    expect(logged.username).toEqual(created.username);
});

/**
 * Login not found test.
 */
test('Login not found', async function() {
    let badLogged = await dao.findLogin("not the login","blah"); 
    expect(badLogged).toBeNull();
});