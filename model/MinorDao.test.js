const dbcon = require('./DbConnection');
const dao = require('./MinorDao');

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
 * Create new minor test.
 */
test('Create new minor', async function() {
    let newdata = { 
        name: 'Child 1', 
        date_of_birth: '2012-05-10', 
        parent_id: '68f321cef24b117cb0cc4a11' 
    };
    let created = await dao.create(newdata);
    let found = await dao.read(created._id);
    expect(created._id).not.toBeNull(); 
    expect(found.name).toBe(created.name);
});

/**
 * Delete minor test.
 */
test('Delete minor', async function() {
    let newdata = { 
        name: 'Child 1', 
        date_of_birth: '2012-05-10', 
        parent_id: '68f321cef24b117cb0cc4a11' 
    };
    let created = await dao.create(newdata); 
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id); 
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id); 
});

/**
 * Read all minor documents test.
 */
test('Read All', async function() {
    let newdata1 = { name: 'Minor 1', date_of_birth: '2011-04-20', parent_id: '68f321cef24b117cb0cc4a11' };
    let newdata2 = { name: 'Minor 2', date_of_birth: '2013-08-15', parent_id: '68f321cef23b117cb0cc4a11' };
    let newdata3 = { name: 'Minor 3', date_of_birth: '2014-11-25', parent_id: '68f321cef24b118cb0cc4a11' };
    await dao.create(newdata1);
    await dao.create(newdata2);
    await dao.create(newdata3);
    let lstMinors = await dao.readAll();
    expect(lstMinors.length).toBe(3);
    expect(lstMinors[0].name).toBe('Minor 1');
});

/**
 * Find minor by name test.
 */
test('Find Minor by name', async function() {
    let newdata = { 
        name: 'Minor 1', 
        date_of_birth: '2010-06-12', 
        parent_id: '68f321cef24b117cb0cc4a11' 
    };
    let created = await dao.create(newdata); 
    let found = await dao.findByName(newdata.name);
    expect(found).not.toBeNull();
    expect(found._id).toEqual(created._id);
    expect(found.name).toEqual(created.name);
});

/**
 * Minor not found test.
 */
test('Minor not found', async function() {
    let badMinor = await dao.findByName("child child"); 
    expect(badMinor).toBeNull();
});