const dbcon = require('./DbConnection');
const dao = require('./MatchChatDao');

/**
 * Executed once before all tests
 */
beforeAll(async function () {
    dbcon.connect('test');
});

/**
 *  Executed once after all tests have ran
 */
afterAll(async function () {
    await dao.deleteAll();
    dbcon.disconnect();
});

/**
 * Executed before each test
 */
beforeEach(async function () {
    await dao.deleteAll();
});

/**
 * Create new match chat test.
 */
test('Create new match chat', async function () {
    let newData = {
        match_id: '68f321cef24b117cb0cc4a11',
        name: 'adsad',
        text: 'aaa'
    };
    let created = await dao.create(newData);
    let found = await dao.read(newData.match_id);
    expect(found[0].name).toBe(created.name);
});

/**
 * Delete chat test.
 */
test('Delete chat test', async function () {
    let newData = {
        match_id: '68f321cef24b117cb0cc4a11',
        name: 'adsad',
        text: 'aaa'
    };
    let created = await dao.create(newData);
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id);
    expect(found).toEqual([]);
    expect(deleted._id).toEqual(created._id);
});

/**
 * Read all chats test.
 */
test('Read All', async function () {
    let newData1 = {
        match_id: '68f321cef24b117cb0cc4a11',
        name: 'adsad',
        text: 'aaa'
    };
    let newData2 = {
        match_id: '68f321cef24b117cb0cc4a11',
        name: 'Guest21',
        text: 'bbb'
    };
    let newData3 = {
        match_id: '68f321cef24b117cb0cc4a11',
        name: 'Apple',
        text: 'ccc'
    };
    await dao.create(newData1);
    await dao.create(newData2);
    await dao.create(newData3);
    let lstChats = await dao.readAll();
    expect(lstChats.length).toBe(3);
    expect(lstChats[0].text).toBe('aaa');
});