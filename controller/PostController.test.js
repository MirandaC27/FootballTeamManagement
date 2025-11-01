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
 * Retrieve all posts from database test.
 */
test('Get all posts', async function () {
    let req = {};
    let res = { json: jest.fn(), status: jest.fn(), send: jest.fn() };

    // Create a fake documents collection for the post model
    let posts = [
        { _id: '1208213', owner_id: { _id: 'u1', name: 'Bob' }, type: 'image/png', path: '/uploads/a.png', caption: '' },
        { _id: '1237213y', owner_id: { _id: 'u2', name: 'Boby' }, type: 'video/mp4', path: '/uploads/b.mp4', caption: 'asd' }
    ];

    dao.readAll = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(posts) });
    await controller.getAllPosts(req, res);

    expect(dao.readAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(posts);
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
    let req = {};
    let res = { json: jest.fn(), status: jest.fn(), send: jest.fn() };

    dao.readAll = jest.fn().mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error("err")) });
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

