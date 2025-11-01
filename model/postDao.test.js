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
 * Read all post documents test.
 */
test('Read All', async function () {
    let newData1 = {
        owner_id: "68f321cef24b117cb0cc4a11",
        type: "image/jpeg",
        path: "/uploads/testimage.jpg",
        caption: "abc",
        containsMinors: true
    };
    let newData2 = {
        owner_id: "68f321cef24c117cb0cc4a11",
        type: "image/png",
        path: "/uploads/testimage1.png",
        caption: "abc",
        containsMinors: false
    };
    let newData3 = {
        owner_id: "68f321cef24d117cb0cc4a11",
        type: "video/mp4",
        path: "/uploads/testi2.mp4",
        caption: "abc",
        containsMinors: true
    };
    await dao.create(newData1);
    await dao.create(newData2);
    await dao.create(newData3);
    let lstPosts = await dao.readAll();
    expect(lstPosts.length).toBe(3);
    expect(lstPosts[0].owner_id).toBe('68f321cef24b117cb0cc4a11');
});