const dbcon = require('./DbConnection');
const dao = require('./PostDao');
require("../model/UserDao");
require("../model/PostCommentDao");

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
        containsMinors: true,
        likesCount: 0,
        likedBy: [],
        comments: []
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
        containsMinors: true,
        likesCount: 0,
        likedBy: [],
        comments: []
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
        containsMinors: false,
        likesCount: 0,
        likedBy: [],
        comments: []
    };
    let created = await dao.create(newData);
    await dao.updateContainsMinors(created._id, true);
    let found = await dao.read(created._id);
    expect(found.containsMinors).toBe(true);
});

/**
 * Update like by liking post test.
 */
test('Update like by liking post', async function () {
    // the post being liked
    let newData = {
        owner_id: "68f321cef24b117cb0cc4a11",
        type: "image/jpeg",
        path: "/uploads/testimage.jpg",
        caption: "caption",
        containsMinors: false,
        likesCount: 0,
        likedBy: [],
        comments: []
    };

    let created = await dao.create(newData);
    let postId = created._id;
    let userId = "68f321cef24b117cb0cc4a22";
    let result = await dao.updateLikeReaction(postId, userId);
    let found = await dao.read(postId);

    expect(result.isLiked).toBe(true);
    expect(result.count).toBe(1);
    expect(found.likedBy[0].toString()).toBe(userId);
    expect(found.likesCount).toBe(1);
});

/**
 * Update like by removing liked post test.
 */
test('Update like by removing liked post', async function () {
    // the post that was liked
    let newData = {
        owner_id: "68f321cef24b117cb0cc4a11",
        type: "image/jpeg",
        path: "/uploads/testimage.jpg",
        caption: "caption",
        containsMinors: false,
        likesCount: 1,
        likedBy: ["68f321cef24b117cb0cc4a22"],
        comments: []
    };

    let created = await dao.create(newData);
    let postId = created._id;
    let userId = "68f321cef24b117cb0cc4a22";
    let result = await dao.updateLikeReaction(postId, userId);
    let found = await dao.read(postId);

    expect(result.isLiked).toBe(false);
    expect(result.count).toBe(0);
    expect(found.likedBy.length).toBe(0);
    expect(found.likesCount).toBe(0);
});
