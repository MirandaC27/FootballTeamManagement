const controller = require('./PostController');
const dao = require('../model/PostDao');

// Mock the entire dao module
jest.mock("../model/PostDao");

/**
 * Executed before each test.
 */
beforeEach(function () {
    jest.clearAllMocks();
});

/**
 * Retrieve all posts from database test when logged in.
 */
test('Get all posts when logged in', async function () {
    let req = { session: { user: { _id: "123" } } };
    let res = { json: jest.fn(), status: jest.fn(), send: jest.fn() };

    // Create a fake documents collection for the post model
    let posts = [
        { _id: '1208213', owner_id: { _id: 'u1', name: 'Bob' }, type: 'image/png', path: '/uploads/a.png', caption: '', containsMinors: true },
        { _id: '1237213y', owner_id: { _id: 'u2', name: 'Boby' }, type: 'video/mp4', path: '/uploads/b.mp4', caption: 'asd', containsMinors: false }
    ];

    dao.readAll.mockResolvedValue(posts);
    await controller.getAllPosts(req, res);

    expect(dao.readAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(posts);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Retrieve all posts from database test when not logged in.
 */
test('Get all posts without minors when not logged in', async function () {
    let req = { session: {} };
    let res = { json: jest.fn(), status: jest.fn(), send: jest.fn() };

    // Create a fake documents collection for the post model
    let posts = [
        { _id: 'hasminor', owner_id: { _id: 'u1', name: 'Bob' }, type: 'image/png', path: '/uploads/a.png', caption: '', containsMinors: true },
        { _id: 'nominor', owner_id: { _id: 'u2', name: 'Boby' }, type: 'video/mp4', path: '/uploads/b.mp4', caption: 'asd', containsMinors: false }
    ];

    dao.readAll.mockResolvedValue(posts);
    await controller.getAllPosts(req, res);

    // Only show post without minor
    expect(dao.readAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([
        { _id: 'nominor', containsMinors: false }
    ]);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Upload post successfully test.
 */
test('Upload new post', async function () {
    let req = {
        file: { filename: 'test.png', mimetype: 'image/png' },
        body: { caption: 'asd', containsMinors: true },
        session: { user: { username: 'bob' } }
    }
    let res = { send: jest.fn(), status: jest.fn() };

    dao.create.mockResolvedValue({});
    await controller.uploadPost(req, res);

    expect(dao.create).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('Successfully uploaded');
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Upload post without file test.
 */
test('Upload new post without file', async function () {
    let req = {
        file: null,
        body: {},
        session: { user: { username: 'bob' } }
    };
    let res = { send: jest.fn(), status: jest.fn() };
    await controller.uploadPost(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith("Error no file uploaded");
});

/**
 * Test the error catch block in getAllPosts function. 
 */
test('Get all posts fails', async function () {
    let req = { session: { user: { _id: "123" } } };
    let res = { json: jest.fn(), status: jest.fn(), send: jest.fn() };

    dao.readAll.mockRejectedValue(new Error("err"));
    await controller.getAllPosts(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('Error getting posts');
});

/**
 * Test the error catch block in uploadPost function.
 */
test('Upload post fails', async function () {
    let req = {
        file: { filename: 'test.png', mimetype: 'image/png' },
        body: { caption: 'hello', containsMinors: false },
        session: { user: { _id: '111' } }
    };

    let res = { send: jest.fn(), status: jest.fn() };

    dao.create.mockRejectedValue(new Error("err"));
    await controller.uploadPost(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('Error uploading file');
});

/**
 * Update containsMinors successfully test.
 */
test('Update containsMinors successfully', async function () {
    let req = {
        params: { id: 'a' },
        body: { containsMinors: false }
    };
    let res = { send: jest.fn(), status: jest.fn() };

    dao.updateContainsMinors.mockResolvedValue({});
    await controller.updateContainsMinors(req, res);

    expect(dao.updateContainsMinors).toHaveBeenCalledWith('a', false);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Update containsMinors fails test.
 */
test('Update containsMinors fails', async function () {
    let req = {
        params: { id: 'a' },
        body: { containsMinors: false }
    };
    let res = { send: jest.fn(), status: jest.fn() };

    dao.updateContainsMinors.mockRejectedValue(new Error('err'));
    await controller.updateContainsMinors(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('Error updating containsMinors');
});
