const dbcon = require('./DbConnection');
const dao = require('./PostDao');

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
 * Create new post test.
 */
test('Create new post', async function () {
    let newData = {
        owner_id: "68f321cef24b117cb0cc4a11",
        type: "image/jpeg",
        path: "/uploads/testimage.jpg",
        caption: "abc",
        containsMinors: true
    };
    let created = await dao.create(newData);
    let found = await dao.read(created._id);
    expect(created._id).not.toBeNull();
    expect(found.name).toBe(created.name);
});

/**
 * Delete post test.
 */
test('Delete post', async function () {
    let newData = {
        owner_id: "68f321cef24b117cb0cc4a11",
        type: "image/jpeg",
        path: "/uploads/testimage.jpg",
        caption: "abc",
        containsMinors: true
    };
    let created = await dao.create(newData);
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id);
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id);
});

/**
 * Update containsMinors test.
 */
test('Update containsMinors', async function () {
    let newData = {
        owner_id: "68f321cef24b117cb0cc4a11",
        type: "image/jpeg",
        path: "/uploads/testimage.jpg",
        caption: "..;da",
        containsMinors: false
    };
    let created = await dao.create(newData);
    await dao.updateContainsMinors(created._id, true);
    let found = await dao.read(created._id);
    expect(found.containsMinors).toBe(true);
});
