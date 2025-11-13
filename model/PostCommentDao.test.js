const dbcon = require('./DbConnection');
const dao = require('./PostCommentDao');
require("../model/UserDao");

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
 * Create new post comment test.
 */
test('Create new post comment', async function () {
    let newData = {
        post_id: "68f321cef24b117cb0cc4a11",
        owner_id: "68f321cef24b117cb0cc4a22",
        message: "abc"
    };
    let created = await dao.create(newData);
    let found = await dao.read(created._id);
    expect(created._id).not.toBeNull();
    expect(found.name).toBe(created.name);
});

/**
 * Delete post comment test.
 */
test('Delete post comment', async function () {
    let newData = {
        post_id: "68f321cef24b117cb0cc4a11",
        owner_id: "68f321cef24b117cb0cc4a22",
        message: "abc"
    };
    let created = await dao.create(newData);
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id);
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id);
});

/**
 * Read all post comments test. 
 */
test('Read all post comments', async function () {
    const postId = "68f321cef24b117cb0cc4a11";
    let newData1 = {
        post_id: postId,
        owner_id: "68f321cef24b117cb0cc4a22",
        message: "abc"
    };
    let newData2 = {
        post_id: postId,
        owner_id: "68f321cef24b117cb0cc4a33",
        message: "def"
    };
    let newData3 = {
        post_id: postId,
        owner_id: "68f321cef24b117cb0cc4a44",
        message: "ghi"
    };
    await dao.create(newData1);
    await dao.create(newData2);
    await dao.create(newData3);

    let lstComments = await dao.readAll(postId);
    expect(lstComments.length).toBe(3);
    expect(lstComments[0].message).toBe('ghi');
});