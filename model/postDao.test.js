const dbcon = require('./DbConnection');
const dao = require('./PostDao');

// for read all test
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true } 
});
const User = mongoose.model('user', userSchema);

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
    let user1 = await User.create({ name: 'User 1', username: 'u1' });
    let user2 = await User.create({ name: 'User 2', username: 'u2' });
    let user3 = await User.create({ name: 'User 3', username: 'u3' });

    let newData1 = {
        owner_id: user1._id,
        type: "image/jpeg",
        path: "/uploads/testimage.jpg",
        caption: "abc",
        containsMinors: true
    };
    let newData2 = {
        owner_id: user2._id,
        type: "image/png",
        path: "/uploads/testimage1.png",
        caption: "abc",
        containsMinors: false
    };
    let newData3 = {
        owner_id: user3._id,
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
    expect(lstPosts[0].owner_id.name).toBe('User 3');
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

