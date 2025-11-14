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
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

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
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    // Create a fake documents collection for the post model
    let posts = [
        { _id: 'hasminor', owner_id: { _id: 'u1', name: 'Bob' }, type: 'image/png', path: '/uploads/a.png', caption: '', containsMinors: true },
        { _id: 'nominor', owner_id: { _id: 'u2', name: 'Boby' }, type: 'video/mp4', path: '/uploads/b.mp4', caption: 'asd', containsMinors: false }
    ];

    dao.readAll.mockResolvedValue(posts);
    await controller.getAllPosts(req, res);

    // Only show post without minor
    expect(dao.readAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{
        _id: 'nominor',
        owner_id: { _id: 'u2', name: 'Boby' },
        type: 'video/mp4',
        path: '/uploads/b.mp4',
        caption: 'asd',
        containsMinors: false
    }
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
    let res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

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
    let res = { send: jest.fn(), status: jest.fn().mockReturnThis() };
    await controller.uploadPost(req, res);

    expect(dao.create).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('Successfully uploaded');
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Test the error catch block in getAllPosts function. 
 */
test('Get all posts fails', async function () {
    let req = { session: { user: { _id: "123" } } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

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

    let res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

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
    let res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

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
    let res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.updateContainsMinors.mockRejectedValue(new Error('err'));
    await controller.updateContainsMinors(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('Error updating containsMinors');
});

/**
 * Update like reaction successfully test.
 */
test('Update like reaction success', async function () {
    let req = {
        params: { id: "p" },
        session: { user: { _id: "aa" } }
    };
    let res = { json: jest.fn(), send: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.updateLikeReaction.mockResolvedValue({ isLiked: true, count: 121 });
    await controller.updateLikeReaction(req, res);

    expect(res.json).toHaveBeenCalledWith({ isLiked: true, count: 121 });
    expect(dao.updateLikeReaction).toHaveBeenCalledWith("p", "aa");
});

/**
 * Update like reaction fail test. 
 */
test('Update like reaction error', async function () {
    let req = {
        params: { id: "p" },
        session: { user: { _id: "a" } }
    };
    let res = { json: jest.fn(), send: jest.fn(), status: jest.fn().mockReturnThis() };

    dao.updateLikeReaction.mockRejectedValue(new Error("err"));
    await controller.updateLikeReaction(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith("Error updating likes");
});

/**
 * Get a single post test
 */
test('Get a single post', async function () {
    let req = { params: { id: 'p' } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    let post = {
        _id: 'p',
        caption: 'asdasd',
    };

    dao.read.mockResolvedValue(post);
    await controller.getPost(req, res);

    expect(dao.read).toHaveBeenCalledWith('p');
    expect(res.json).toHaveBeenCalledWith(post);
    expect(res.status).not.toHaveBeenCalled();
});

/**
 * Get a single post failure test
 */
test('Get a single post fail', async function () {
    let req = { params: { id: 'p' } };
    let res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    dao.read.mockRejectedValue(new Error('err'));
    await controller.getPost(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('Error getting a post');
});